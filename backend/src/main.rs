//! Composition root.
//!
//! Wiring lives here and only here: load config, build the driven adapters,
//! inject them into the use cases, mount the driving (HTTP) adapter, and serve.
//! The layered modules themselves live in the library crate (`lib.rs`).

use std::sync::Arc;

use backend::{
	api::{self, state::AppState},
	application::{application_service::ApplicationService, contact_service::ContactService, vacancy_service::VacancyService},
	config::AppConfig,
	infrastructure::{
		db,
		email::{
			notifier::EmailNotifier,
			transport::{EmailTransport, NoopTransport, SmtpTransport},
		},
		persistence::{
			postgres_application_repository::PostgresApplicationRepository, postgres_contact_repository::PostgresContactRepository, postgres_vacancy_repository::PostgresVacancyRepository,
		},
	},
};
use color_eyre::eyre::{Context, Result};
use ev_lib::error_monitoring;

// Sentry must be initialised before the async runtime starts — no #[tokio::main].
fn main() -> Result<()> {
	color_eyre::install()?;
	dotenvy::dotenv().ok();

	let config = AppConfig::from_env().context("failed to load configuration")?;

	// Guard must stay alive for the duration of main — dropping it flushes events.
	// `init` is a no-op (returns None) when SENTRY_DSN is unset.
	let _sentry_guard = error_monitoring::init(&error_monitoring::Config {
		dsn: config.sentry_dsn.clone(),
		environment: config.app_env.clone(),
		traces_sample_rate: error_monitoring::Config::traces_sample_rate_for(&config.app_env),
	});

	init_tracing();

	tokio::runtime::Builder::new_multi_thread()
		.enable_all()
		.build()
		.context("failed to build tokio runtime")?
		.block_on(run(config))
}

async fn run(config: AppConfig) -> Result<()> {
	let pool = db::connect(&config.database_url).await.context("failed to connect to the database")?;
	db::migrate(&pool).await.context("failed to run migrations")?;

	// Email transport: real SMTP when configured, else a logging no-op.
	let transport: Arc<dyn EmailTransport> = match &config.smtp {
		Some(smtp) => Arc::new(SmtpTransport::try_new(&smtp.host, smtp.port, smtp.username.clone(), smtp.password.clone()).context("failed to build SMTP transport")?),
		None => {
			tracing::warn!("SMTP not configured — transactional emails will be logged, not delivered");
			Arc::new(NoopTransport)
		}
	};
	let notifier = Arc::new(EmailNotifier::new(transport, config.mail_from.clone(), config.mail_team.clone(), config.site_url.clone()));

	// Driven adapters ▶ use cases ▶ shared state.
	let vacancy_repo = Arc::new(PostgresVacancyRepository::new(pool.clone()));
	let application_repo = Arc::new(PostgresApplicationRepository::new(pool.clone()));
	let contact_repo = Arc::new(PostgresContactRepository::new(pool));

	let analytics = ev_lib::analytics::Analytics::new(config.posthog_key.clone(), config.posthog_host.clone());

	let vacancies = VacancyService::new(vacancy_repo.clone());
	let applications = ApplicationService::new(application_repo, vacancy_repo, notifier.clone());
	let contacts = ContactService::new(contact_repo, notifier);
	let state = AppState::new(vacancies, applications, contacts, analytics);

	let router = api::router::build(state);

	let listener = tokio::net::TcpListener::bind(config.bind_addr)
		.await
		.with_context(|| format!("failed to bind {}", config.bind_addr))?;
	tracing::info!(addr = %config.bind_addr, "backend listening");
	axum::serve(listener, router).await.context("server error")?;

	Ok(())
}

fn init_tracing() {
	use tracing_subscriber::{EnvFilter, fmt, prelude::*};

	let filter = EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new("info,backend=debug"));
	tracing_subscriber::registry().with(filter).with(fmt::layer()).with(error_monitoring::tracing_layer()).init();
}

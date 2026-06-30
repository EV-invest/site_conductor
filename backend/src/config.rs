use std::{env, net::SocketAddr};

use color_eyre::eyre::{Context, Result};

/// SMTP transport credentials. Present only when all four variables are set;
/// otherwise email delivery is a no-op (the notifier logs and returns Ok), the
/// same "unconfigured ⇒ silent no-op" contract the analytics/Sentry libs use.
#[derive(Clone, Debug)]
pub struct SmtpConfig {
	pub host: String,
	pub port: u16,
	pub username: String,
	pub password: String,
}

/// Application configuration, sourced from environment variables (and `.env`
/// in development via `dotenvy`).
#[derive(Clone, Debug)]
pub struct AppConfig {
	pub database_url: String,
	pub bind_addr: SocketAddr,
	pub sentry_dsn: Option<String>,
	pub app_env: String,
	pub smtp: Option<SmtpConfig>,
	/// `From:` mailbox for outgoing mail, e.g. `EV Investment <careers@evinvest.vn>`.
	pub mail_from: String,
	/// Internal inbox that receives the "new application / new message" copies.
	pub mail_team: String,
	/// Public origin used to build links inside emails (e.g. "View the role").
	pub site_url: String,
	/// PostHog project key for server-side capture. `None` ⇒ analytics no-op.
	pub posthog_key: Option<String>,
	pub posthog_host: Option<String>,
}

impl AppConfig {
	pub fn from_env() -> Result<Self> {
		let database_url = env::var("DATABASE_URL").context("DATABASE_URL must be set")?;
		let bind_addr = env::var("BIND_ADDR")
			.unwrap_or_else(|_| "0.0.0.0:58844".to_string())
			.parse()
			.context("BIND_ADDR must be a valid socket address, e.g. 0.0.0.0:58844")?;
		let sentry_dsn = env::var("SENTRY_DSN").ok();
		let app_env = env::var("APP_ENV").unwrap_or_else(|_| "development".to_string());

		let smtp = match (env::var("SMTP_HOST").ok(), env::var("SMTP_USERNAME").ok(), env::var("SMTP_PASSWORD").ok()) {
			// All three must be non-empty; a partially-set block falls back to the
			// no-op transport rather than failing per-send at runtime.
			(Some(host), Some(username), Some(password)) if !host.is_empty() && !username.is_empty() && !password.is_empty() => {
				let port = env::var("SMTP_PORT")
					.unwrap_or_else(|_| "587".to_string())
					.parse()
					.context("SMTP_PORT must be a valid port number")?;
				Some(SmtpConfig { host, port, username, password })
			}
			_ => None,
		};

		//TODO!!!: this is bad, switch to Defaults and `config` crate. Random fallbacks really bad
		let mail_from = env::var("MAIL_FROM").unwrap_or_else(|_| "EV Investment <careers@evinvest.vn>".to_string());
		let mail_team = env::var("MAIL_TEAM").unwrap_or_else(|_| "careers@evinvest.vn".to_string());
		let site_url = env::var("SITE_URL").unwrap_or_else(|_| "https://evinvest.vn".to_string());
		let posthog_key = env::var("POSTHOG_API_KEY").ok().filter(|k| !k.is_empty());
		let posthog_host = env::var("POSTHOG_HOST").ok().filter(|h| !h.is_empty());

		Ok(Self {
			database_url,
			bind_addr,
			sentry_dsn,
			app_env,
			smtp,
			mail_from,
			mail_team,
			site_url,
			posthog_key,
			posthog_host,
		})
	}
}

use axum::{
	Router,
	body::Body,
	http::Request,
	routing::{get, post},
};
use ev::error_monitoring::{NewSentryLayer, SentryHttpLayer};
use tower::ServiceBuilder;
use tower_http::{cors::CorsLayer, trace::TraceLayer};
use utoipa::OpenApi;
use utoipa_swagger_ui::SwaggerUi;

use crate::api::{handler, openapi::ApiDoc, state::AppState};

/// Assemble the HTTP surface: versioned routes, Swagger UI, and the
/// observability + CORS middleware stack. CORS is permissive — this is a
/// public read-mostly API behind a marketing site, with no auth or cookies.
pub fn build(state: AppState) -> Router {
	let routes = Router::new()
		.route("/health", get(handler::health::health))
		.route("/vacancies", get(handler::vacancy::list_vacancies))
		.route("/vacancies/{slug}", get(handler::vacancy::get_vacancy))
		.route("/applications", post(handler::application::create_application))
		.route("/contact", post(handler::contact::create_contact));

	Router::new()
		.nest("/api/v1", routes)
		.merge(SwaggerUi::new("/swagger-ui").url("/api-docs/openapi.json", ApiDoc::openapi()))
		.layer(
			ServiceBuilder::new()
				.layer(NewSentryLayer::<Request<Body>>::new_from_top())
				.layer(SentryHttpLayer::new().enable_transaction()),
		)
		.layer(TraceLayer::new_for_http())
		.layer(CorsLayer::permissive())
		.with_state(state)
}

use axum::{
	Json,
	extract::{Path, Query, State},
};
use domain::model::vacancy::{Slug, VacancyCategory};

use crate::{
	api::{
		dto::vacancy::{ListVacanciesQuery, VacancyDetail, VacancySummary},
		error::ApiError,
		state::AppState,
	},
	domain::port::vacancy_repository::VacancyFilter,
};

/// `GET /vacancies?category=&q=` — the searchable board.
#[utoipa::path(
	get,
	path = "/api/v1/vacancies",
	tag = "vacancies",
	params(ListVacanciesQuery),
	responses((status = 200, description = "Matching open roles", body = [VacancySummary]), (status = 400, description = "Unknown category")),
)]
pub async fn list_vacancies(State(state): State<AppState>, Query(query): Query<ListVacanciesQuery>) -> Result<Json<Vec<VacancySummary>>, ApiError> {
	let category = match query.category.as_deref().filter(|c| !c.is_empty()) {
		Some(c) => Some(VacancyCategory::parse(c)?),
		None => None,
	};
	let filter = VacancyFilter { category, search: query.q };
	let vacancies = state.vacancies.list(filter).await?;
	Ok(Json(vacancies.iter().map(VacancySummary::from).collect()))
}

/// `GET /vacancies/{slug}` — one role for the detail-page template.
#[utoipa::path(
	get,
	path = "/api/v1/vacancies/{slug}",
	tag = "vacancies",
	params(("slug" = String, Path, description = "Role slug, e.g. investment-analyst")),
	responses((status = 200, description = "The role", body = VacancyDetail), (status = 404, description = "Role not found")),
)]
pub async fn get_vacancy(State(state): State<AppState>, Path(slug): Path<String>) -> Result<Json<VacancyDetail>, ApiError> {
	let slug = Slug::parse(slug)?;
	let vacancy = state.vacancies.get_by_slug(&slug).await?;
	Ok(Json(VacancyDetail::from(vacancy)))
}

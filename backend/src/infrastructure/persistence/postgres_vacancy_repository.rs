use async_trait::async_trait;
use domain::{
	architecture::{Reader, Repository},
	error::DomainError,
	model::vacancy::{Compensation, Slug, Vacancy, VacancyCategory, VacancyId},
};
use sqlx::PgPool;
use time::OffsetDateTime;
use uuid::Uuid;

use super::{corrupt_row, map_sqlx_error, to_timestamp};
use crate::domain::port::vacancy_repository::{VacancyFilter, VacancyRepository};

const COLUMNS: &str = "id, slug, title, category, location, employment_type, summary, about, \
	 responsibilities, requirements, nice_to_have, offer, screening_question, compensation, published, created_at";

pub struct PostgresVacancyRepository {
	pool: PgPool,
}
impl PostgresVacancyRepository {
	pub fn new(pool: PgPool) -> Self {
		Self { pool }
	}
}

#[derive(sqlx::FromRow)]
struct VacancyRow {
	id: Uuid,
	slug: String,
	title: String,
	category: String,
	location: String,
	employment_type: String,
	summary: String,
	about: String,
	responsibilities: Vec<String>,
	requirements: Vec<String>,
	nice_to_have: Vec<String>,
	offer: Vec<String>,
	screening_question: String,
	compensation: String,
	published: bool,
	created_at: OffsetDateTime,
}

impl TryFrom<VacancyRow> for Vacancy {
	type Error = DomainError;

	fn try_from(row: VacancyRow) -> Result<Self, Self::Error> {
		let compensation = match row.compensation.as_str() {
			"negotiable" => Compensation::Negotiable,
			other => return Err(DomainError::Repository(format!("unknown compensation: {other}"))),
		};
		Ok(Self {
			id: VacancyId::from_raw(row.id),
			slug: Slug::parse(row.slug).map_err(corrupt_row)?,
			title: row.title,
			category: VacancyCategory::parse(&row.category).map_err(corrupt_row)?,
			location: row.location,
			employment_type: row.employment_type,
			summary: row.summary,
			about: row.about,
			responsibilities: row.responsibilities,
			requirements: row.requirements,
			nice_to_have: row.nice_to_have,
			offer: row.offer,
			screening_question: row.screening_question,
			compensation,
			published: row.published,
			created_at: to_timestamp(row.created_at)?,
		})
	}
}

impl Repository for PostgresVacancyRepository {
	type Aggregate = Vacancy;
}

impl Reader for PostgresVacancyRepository {
	type Aggregate = Vacancy;
}

#[async_trait]
impl VacancyRepository for PostgresVacancyRepository {
	async fn list(&self, filter: VacancyFilter) -> Result<Vec<Vacancy>, DomainError> {
		let category = filter.category.map(VacancyCategory::as_str);
		let search = filter.search.filter(|s| !s.trim().is_empty());
		let sql = format!(
			"SELECT {COLUMNS} FROM vacancies \
			 WHERE published = TRUE \
			 AND ($1::text IS NULL OR category = $1) \
			 AND ($2::text IS NULL OR title ILIKE '%' || $2 || '%' OR summary ILIKE '%' || $2 || '%') \
			 ORDER BY created_at DESC"
		);
		// `sql` is static text + the `COLUMNS` constant; values are bound, never interpolated.
		let rows = sqlx::query_as::<_, VacancyRow>(sqlx::AssertSqlSafe(sql))
			.bind(category)
			.bind(search)
			.fetch_all(&self.pool)
			.await
			.map_err(map_sqlx_error)?;
		rows.into_iter().map(Vacancy::try_from).collect()
	}

	async fn find_by_slug(&self, slug: &Slug) -> Result<Option<Vacancy>, DomainError> {
		let row = sqlx::query_as::<_, VacancyRow>(sqlx::AssertSqlSafe(format!("SELECT {COLUMNS} FROM vacancies WHERE slug = $1")))
			.bind(slug.as_str())
			.fetch_optional(&self.pool)
			.await
			.map_err(map_sqlx_error)?;
		row.map(Vacancy::try_from).transpose()
	}

	async fn find_by_id(&self, id: VacancyId) -> Result<Option<Vacancy>, DomainError> {
		let row = sqlx::query_as::<_, VacancyRow>(sqlx::AssertSqlSafe(format!("SELECT {COLUMNS} FROM vacancies WHERE id = $1")))
			.bind(id.raw())
			.fetch_optional(&self.pool)
			.await
			.map_err(map_sqlx_error)?;
		row.map(Vacancy::try_from).transpose()
	}
}

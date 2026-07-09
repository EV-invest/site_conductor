use async_trait::async_trait;
use domain::{
	architecture::{Reader, Repository},
	error::DomainError,
	model::vacancy::{Slug, Vacancy, VacancyCategory, VacancyId},
};

#[async_trait]
pub trait VacancyRepository: Repository<Aggregate = Vacancy> + Reader<Aggregate = Vacancy> {
	/// Published roles matching `filter`, most recent first.
	async fn list(&self, filter: VacancyFilter) -> Result<Vec<Vacancy>, DomainError>;
	/// A published role by slug — the public detail/apply lookup. Unpublished
	/// (draft) roles resolve to `None`, matching `list()`.
	async fn find_by_slug(&self, slug: &Slug) -> Result<Option<Vacancy>, DomainError>;
	async fn find_by_id(&self, id: VacancyId) -> Result<Option<Vacancy>, DomainError>;
}
/// Read-side filter for the searchable board. `None` fields are wildcards.
#[derive(Clone, Debug, Default)]
pub struct VacancyFilter {
	pub category: Option<VacancyCategory>,
	pub search: Option<String>,
}

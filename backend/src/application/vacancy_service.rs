use std::sync::Arc;

use domain::{
	architecture::AggregateRoot,
	error::DomainError,
	model::vacancy::{Slug, Vacancy},
};

use crate::domain::port::vacancy_repository::{VacancyFilter, VacancyRepository};

#[derive(Clone)]
pub struct VacancyService {
	repository: Arc<dyn VacancyRepository>,
}

impl VacancyService {
	pub fn new(repository: Arc<dyn VacancyRepository>) -> Self {
		Self { repository }
	}

	pub async fn list(&self, filter: VacancyFilter) -> Result<Vec<Vacancy>, DomainError> {
		self.repository.list(filter).await
	}

	pub async fn get_by_slug(&self, slug: &Slug) -> Result<Vacancy, DomainError> {
		self.repository.find_by_slug(slug).await?.ok_or_else(|| DomainError::NotFound {
			entity: Vacancy::NAME,
			id: slug.as_str().to_string(),
		})
	}
}

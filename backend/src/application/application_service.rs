use std::sync::Arc;

use domain::{
	architecture::AggregateRoot,
	error::DomainError,
	model::{
		application::{JobApplication, NewApplication},
		vacancy::{Slug, Vacancy},
	},
};

use crate::domain::port::{application_repository::ApplicationRepository, notifier::Notifier, vacancy_repository::VacancyRepository};

#[derive(Clone)]
pub struct ApplicationService {
	applications: Arc<dyn ApplicationRepository>,
	vacancies: Arc<dyn VacancyRepository>,
	notifier: Arc<dyn Notifier>,
}

impl ApplicationService {
	pub fn new(applications: Arc<dyn ApplicationRepository>, vacancies: Arc<dyn VacancyRepository>, notifier: Arc<dyn Notifier>) -> Self {
		Self { applications, vacancies, notifier }
	}

	/// Submit an application. When `vacancy_slug` is `Some`, the role must
	/// exist (404 otherwise) and its context is embedded in the emails;
	/// `None` is a general talent-pool application. Email delivery is
	/// best-effort: a transport failure is logged but never fails the submit,
	/// since the application is already durably persisted.
	pub async fn submit(&self, vacancy_slug: Option<Slug>, new: NewApplication) -> Result<JobApplication, DomainError> {
		let vacancy = match vacancy_slug {
			Some(slug) => Some(self.vacancies.find_by_slug(&slug).await?.ok_or_else(|| DomainError::NotFound {
				entity: Vacancy::NAME,
				id: slug.into_string(),
			})?),
			None => None,
		};

		let application = self.applications.create(vacancy.as_ref().map(|v| v.id), new).await?;

		if let Err(error) = self.notifier.application_received(&application, vacancy.as_ref()).await {
			tracing::error!(%error, application_id = %application.id.raw(), "failed to send application emails");
		}

		Ok(application)
	}
}

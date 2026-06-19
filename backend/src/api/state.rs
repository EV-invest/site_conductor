use ev::analytics::Analytics;

use crate::application::{application_service::ApplicationService, contact_service::ContactService, vacancy_service::VacancyService};

/// Shared, cheap-to-clone handle injected into every handler. Each service is
/// itself a thin `Arc`-backed wrapper over ports; `Analytics` holds a pooled
/// reqwest client and no-ops when unconfigured.
#[derive(Clone)]
pub struct AppState {
	pub vacancies: VacancyService,
	pub applications: ApplicationService,
	pub contacts: ContactService,
	pub analytics: Analytics,
}

impl AppState {
	pub fn new(vacancies: VacancyService, applications: ApplicationService, contacts: ContactService, analytics: Analytics) -> Self {
		Self {
			vacancies,
			applications,
			contacts,
			analytics,
		}
	}
}

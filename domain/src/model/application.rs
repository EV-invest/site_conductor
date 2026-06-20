use jiff::Timestamp;
use serde::{Deserialize, Serialize};

use crate::{
	architecture::{AggregateRoot, Entity, Id},
	model::{email::EmailAddress, vacancy::VacancyId},
};

pub type ApplicationId = Id<ApplicationTag, uuid::Uuid>;
pub struct ApplicationTag;

/// A candidate's submission. `vacancy_id == None` is a general talent-pool
/// application; `Some(_)` ties it to a specific role, which switches on the
/// role block in the confirmation/notification emails (the universal-letter
/// mechanic from the Figma design).
#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct JobApplication {
	pub id: ApplicationId,
	pub vacancy_id: Option<VacancyId>,
	pub applicant_name: String,
	pub email: EmailAddress,
	pub portfolio_url: Option<String>,
	pub message: String,
	/// Requirements the candidate ticked — only meaningful for a role application.
	pub confirmed_requirements: Vec<String>,
	/// Answer to the role's screening prompt, when applying to a vacancy.
	pub screening_answer: Option<String>,
	pub created_at: Timestamp,
}

impl Entity for JobApplication {
	type Id = ApplicationId;

	fn id(&self) -> ApplicationId {
		self.id
	}
}

impl AggregateRoot for JobApplication {
	const NAME: &'static str = "job_application";
}

/// Validated intent to create a [`JobApplication`]. The id, timestamp and the
/// resolved `vacancy_id` (from the application service, which looks up the
/// slug) are assigned downstream by the persistence adapter.
#[derive(Clone, Debug)]
pub struct NewApplication {
	pub applicant_name: String,
	pub email: EmailAddress,
	pub portfolio_url: Option<String>,
	pub message: String,
	pub confirmed_requirements: Vec<String>,
	pub screening_answer: Option<String>,
}

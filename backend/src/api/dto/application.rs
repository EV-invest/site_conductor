use domain::{
	error::DomainError,
	model::{application::NewApplication, email::EmailAddress, vacancy::Slug},
};
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;
use uuid::Uuid;

use super::{optional, required};

/// Inbound payload for `POST /applications`. `vacancy_slug == None` is a
/// general talent-pool application; `confirmed_requirements` and
/// `screening_answer` are only meaningful when applying to a specific role.
#[derive(Debug, Deserialize, ToSchema)]
pub struct CreateApplicationRequest {
	#[schema(example = "investment-analyst")]
	pub vacancy_slug: Option<String>,
	#[schema(example = "Jane Doe")]
	pub name: String,
	#[schema(example = "jane@example.com")]
	pub email: String,
	pub portfolio_url: Option<String>,
	#[schema(example = "I underwrote 40 coastal deals at...")]
	pub message: String,
	#[serde(default)]
	pub confirmed_requirements: Vec<String>,
	pub screening_answer: Option<String>,
}

impl CreateApplicationRequest {
	/// Validate at the boundary and split into the slug (resolved by the
	/// service) and the domain draft.
	pub fn into_domain(self) -> Result<(Option<Slug>, NewApplication), DomainError> {
		let slug = match optional(self.vacancy_slug) {
			Some(s) => Some(Slug::parse(s)?),
			None => None,
		};
		let new = NewApplication {
			applicant_name: required("name", self.name)?,
			email: EmailAddress::parse(self.email)?,
			portfolio_url: optional(self.portfolio_url),
			message: required("message", self.message)?,
			confirmed_requirements: self.confirmed_requirements.into_iter().map(|r| r.trim().to_string()).filter(|r| !r.is_empty()).collect(),
			screening_answer: optional(self.screening_answer),
		};
		Ok((slug, new))
	}
}

#[derive(Debug, Serialize, ToSchema)]
pub struct ApplicationAccepted {
	pub id: Uuid,
	pub status: String,
}

use jiff::Timestamp;
use serde::{Deserialize, Serialize};

use crate::{
	architecture::{AggregateRoot, Entity, Id},
	error::DomainError,
};

pub type VacancyId = Id<VacancyTag, uuid::Uuid>;
/// Phantom tag making [`VacancyId`] incompatible with every other `Id<_, Uuid>`.
pub struct VacancyTag;

/// The discipline a role belongs to — also the board's filter facets.
#[derive(Clone, Copy, Debug, Eq, PartialEq, Deserialize, Serialize)]
#[serde(rename_all = "snake_case")]
pub enum VacancyCategory {
	Investment,
	Development,
	Advisory,
	Operations,
}

impl VacancyCategory {
	pub fn as_str(self) -> &'static str {
		match self {
			Self::Investment => "investment",
			Self::Development => "development",
			Self::Advisory => "advisory",
			Self::Operations => "operations",
		}
	}

	/// Human-facing label for chips and pills.
	pub fn label(self) -> &'static str {
		match self {
			Self::Investment => "Investment",
			Self::Development => "Development",
			Self::Advisory => "Advisory",
			Self::Operations => "Operations",
		}
	}

	pub fn parse(raw: &str) -> Result<Self, DomainError> {
		match raw.trim().to_ascii_lowercase().as_str() {
			"investment" => Ok(Self::Investment),
			"development" => Ok(Self::Development),
			"advisory" => Ok(Self::Advisory),
			"operations" => Ok(Self::Operations),
			other => Err(DomainError::Validation(format!("unknown vacancy category: {other}"))),
		}
	}
}

/// URL-safe identifier for a role (`investment-analyst`). The slug — not the
/// UUID — is what the detail route `/hiring/{slug}` resolves against.
#[derive(Clone, Debug, Eq, PartialEq, Deserialize, Serialize)]
#[serde(transparent)]
pub struct Slug(String);

impl Slug {
	pub fn parse(raw: impl Into<String>) -> Result<Self, DomainError> {
		let raw = raw.into();
		let s = raw.trim();
		let valid = !s.is_empty() && s.len() <= 120 && s.chars().all(|c| c.is_ascii_lowercase() || c.is_ascii_digit() || c == '-') && !s.starts_with('-') && !s.ends_with('-');
		if !valid {
			return Err(DomainError::Validation(format!("invalid slug: {raw}")));
		}
		Ok(Self(s.to_string()))
	}

	pub fn as_str(&self) -> &str {
		&self.0
	}

	pub fn into_string(self) -> String {
		self.0
	}
}

/// Pay disclosure for a role. A closed enum with a single variant is a
/// deliberate constraint: the public site never publishes a salary figure —
/// compensation is always "Negotiable" (the EN rendering of «договорная»).
#[derive(Clone, Copy, Debug, Eq, PartialEq, Deserialize, Serialize)]
#[serde(rename_all = "snake_case")]
pub enum Compensation {
	Negotiable,
}

impl Compensation {
	pub fn label(self) -> &'static str {
		match self {
			Self::Negotiable => "Negotiable",
		}
	}
}

/// An open role. The aggregate is the source of truth for both the searchable
/// board and the single reusable detail-page template.
#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct Vacancy {
	pub id: VacancyId,
	pub slug: Slug,
	pub title: String,
	pub category: VacancyCategory,
	pub location: String,
	pub employment_type: String,
	/// One-line teaser shown on the board row and hero.
	pub summary: String,
	/// Lead paragraph of the detail page ("About the role").
	pub about: String,
	pub responsibilities: Vec<String>,
	/// Doubles as the application form's "Which of these describe you?" checks.
	pub requirements: Vec<String>,
	pub nice_to_have: Vec<String>,
	pub offer: Vec<String>,
	/// Role-specific screening prompt embedded in the application form/email.
	pub screening_question: String,
	pub compensation: Compensation,
	pub published: bool,
	pub created_at: Timestamp,
}

impl Entity for Vacancy {
	type Id = VacancyId;

	fn id(&self) -> VacancyId {
		self.id
	}
}

impl AggregateRoot for Vacancy {
	const NAME: &'static str = "vacancy";
}

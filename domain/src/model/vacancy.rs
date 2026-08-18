use ev_lib::i18n::Locale;
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
#[derive(Clone, Copy, Debug, Deserialize, Eq, PartialEq, Serialize)]
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
#[derive(Clone, Debug, Deserialize, Eq, PartialEq, Serialize)]
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
#[derive(Clone, Copy, Debug, Deserialize, Eq, PartialEq, Serialize)]
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

/// The reader-facing half of a vacancy, in one target language.
///
/// Deliberately *not* every field. `slug` is the role's address — one job has
/// one URL in every language, or a share link stops resolving and the search
/// engines see five roles where there is one. `category` is a filter key, and is
/// already translated as a catalogue string on the front end, where the chips
/// live. `compensation` is a closed enum with one variant. `published` and
/// `created_at` are not language at all. Translating any of them would give one
/// role a second identity.
#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct VacancyTranslation {
	pub title: String,
	pub location: String,
	pub employment_type: String,
	pub summary: String,
	pub about: String,
	pub responsibilities: Vec<String>,
	pub requirements: Vec<String>,
	pub nice_to_have: Vec<String>,
	pub offer: Vec<String>,
	pub screening_question: String,
}

impl Vacancy {
	/// Overlay a translation, replacing every reader-facing field at once.
	///
	/// All-or-nothing on purpose: the digest that gates this covers the whole
	/// English row (see `vacancy_source_digest` in the migration), so a
	/// translation is either current or it is not. Merging field-by-field would
	/// invent a third state — half-translated — that nothing downstream, and no
	/// reader, can make sense of.
	#[must_use]
	pub fn with_translation(mut self, t: VacancyTranslation) -> Self {
		self.title = t.title;
		self.location = t.location;
		self.employment_type = t.employment_type;
		self.summary = t.summary;
		self.about = t.about;
		self.responsibilities = t.responsibilities;
		self.requirements = t.requirements;
		self.nice_to_have = t.nice_to_have;
		self.offer = t.offer;
		self.screening_question = t.screening_question;
		self
	}
}

/// A vacancy as it will actually be served, plus what the resolver did.
///
/// `translated` is reported rather than inferred: a caller cannot recover it by
/// comparing `locale` to anything, because a role can be requested in Russian
/// and served in English — that is rule 1.3's `fallback`, the deliberate
/// exception this collection makes (hiding an open role from someone who reads
/// English fine costs a candidate). The front end needs the flag to mark the
/// text honestly instead of implying a translation exists.
///
/// `translated == false` covers both "no row for this locale" and "the row is
/// stale". The caller cannot tell them apart, and should not: both mean the text
/// below is canonical English.
///
/// Not `Serialize`: the wire shape is the API's `VacancyDetail`/`VacancySummary`,
/// and `ev_lib::i18n::Locale` is deliberately dependency-free (no serde), so
/// deriving it here would mean either a newtype or pulling serde into the
/// library for one field. The DTO already renders the locale as its `code()`.
#[derive(Clone, Debug)]
pub struct LocalizedVacancy {
	pub vacancy: Vacancy,
	/// The locale that was *asked for*, not necessarily the one served.
	pub locale: Locale,
	pub translated: bool,
}

impl LocalizedVacancy {
	/// English, as authored — rule 1.1's canonical form.
	pub fn canonical(vacancy: Vacancy, locale: Locale) -> Self {
		Self { vacancy, locale, translated: false }
	}

	/// A vacancy with a current translation applied.
	pub fn translated(vacancy: Vacancy, locale: Locale, t: VacancyTranslation) -> Self {
		Self {
			vacancy: vacancy.with_translation(t),
			locale,
			translated: true,
		}
	}
}

use serde::{Deserialize, Serialize};

use crate::error::DomainError;

/// A syntactically valid email address. Validation is intentionally
/// structural, not exhaustive (RFC 5322 is not worth re-implementing): one
/// `@`, a non-empty local part, and a dotted domain with no spaces. Stored
/// trimmed; serialises transparently as the bare string.
#[derive(Clone, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[serde(transparent)]
pub struct EmailAddress(String);

impl EmailAddress {
	pub fn parse(raw: impl Into<String>) -> Result<Self, DomainError> {
		let trimmed = raw.into().trim().to_string();
		let mut parts = trimmed.splitn(2, '@');
		let valid = match (parts.next(), parts.next()) {
			(Some(local), Some(domain)) =>
				!local.is_empty() && domain.len() >= 3 && domain.contains('.') && !domain.starts_with('.') && !domain.ends_with('.') && !trimmed.contains(char::is_whitespace),
			_ => false,
		};
		if !valid {
			return Err(DomainError::Validation(format!("invalid email address: {trimmed}")));
		}
		Ok(Self(trimmed))
	}

	pub fn as_str(&self) -> &str {
		&self.0
	}

	pub fn into_string(self) -> String {
		self.0
	}
}

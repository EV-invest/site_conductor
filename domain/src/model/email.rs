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
				!local.is_empty()
					&& !domain.contains('@')
					&& domain.len() >= 3
					&& domain.contains('.')
					&& !domain.starts_with('.')
					&& !domain.ends_with('.')
					&& !trimmed.contains(char::is_whitespace),
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

#[cfg(test)]
mod tests {
	use super::*;

	#[test]
	fn accepts_valid_addresses() {
		for raw in ["user@example.com", "  padded@example.com  ", "first.last@sub.example.co"] {
			assert!(EmailAddress::parse(raw).is_ok(), "expected {raw:?} to parse");
		}
	}

	#[test]
	fn rejects_multiple_at_signs() {
		for raw in ["a@@b.com", "user@evil@example.com", "@@example.com", "a@b@c@d.com"] {
			assert!(EmailAddress::parse(raw).is_err(), "expected {raw:?} to be rejected");
		}
	}

	#[test]
	fn rejects_structurally_invalid_addresses() {
		for raw in ["", "plain", "@example.com", "user@", "user@x", "user@.com", "user@com.", "user@exa mple.com", "user@nodot"] {
			assert!(EmailAddress::parse(raw).is_err(), "expected {raw:?} to be rejected");
		}
	}
}

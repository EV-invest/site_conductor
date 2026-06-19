pub mod application;
pub mod contact;
pub mod vacancy;

use domain::error::DomainError;

/// Trim and reject empty required text at the HTTP boundary.
pub(crate) fn required(field: &str, value: String) -> Result<String, DomainError> {
	let trimmed = value.trim();
	if trimmed.is_empty() {
		Err(DomainError::Validation(format!("{field} is required")))
	} else {
		Ok(trimmed.to_string())
	}
}

/// Normalise an optional text field: trim, then collapse empty to `None`.
pub(crate) fn optional(value: Option<String>) -> Option<String> {
	value.map(|v| v.trim().to_string()).filter(|v| !v.is_empty())
}

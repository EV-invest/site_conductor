use domain::{
	error::DomainError,
	model::{contact::NewContact, email::EmailAddress},
};
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;
use uuid::Uuid;

use super::required;

#[derive(Debug, Deserialize, ToSchema)]
pub struct CreateContactRequest {
	#[schema(example = "Jane Doe")]
	pub name: String,
	#[schema(example = "jane@example.com")]
	pub email: String,
	#[schema(example = "I'd like to learn more about the Quy Nhơn fund.")]
	pub message: String,
}

impl CreateContactRequest {
	pub fn into_domain(self) -> Result<NewContact, DomainError> {
		Ok(NewContact {
			name: required("name", self.name)?,
			email: EmailAddress::parse(self.email)?,
			message: required("message", self.message)?,
		})
	}
}

#[derive(Debug, Serialize, ToSchema)]
pub struct ContactAccepted {
	pub id: Uuid,
	pub status: String,
}

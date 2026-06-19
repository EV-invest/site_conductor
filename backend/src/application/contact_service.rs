use std::sync::Arc;

use domain::{
	error::DomainError,
	model::contact::{ContactMessage, NewContact},
};

use crate::domain::port::{contact_repository::ContactRepository, notifier::Notifier};

#[derive(Clone)]
pub struct ContactService {
	contacts: Arc<dyn ContactRepository>,
	notifier: Arc<dyn Notifier>,
}

impl ContactService {
	pub fn new(contacts: Arc<dyn ContactRepository>, notifier: Arc<dyn Notifier>) -> Self {
		Self { contacts, notifier }
	}

	/// Persist a contact message, then send the "we got it" + internal copy.
	/// As with applications, email delivery is best-effort.
	pub async fn submit(&self, new: NewContact) -> Result<ContactMessage, DomainError> {
		let message = self.contacts.create(new).await?;

		if let Err(error) = self.notifier.contact_received(&message).await {
			tracing::error!(%error, contact_id = %message.id.raw(), "failed to send contact emails");
		}

		Ok(message)
	}
}

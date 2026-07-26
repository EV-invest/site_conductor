use std::sync::Arc;

use domain::{
	error::DomainError,
	model::newsletter::{NewNewsletterSubscription, NewsletterSubscription},
};

use crate::domain::port::{newsletter_repository::NewsletterRepository, notifier::Notifier};

#[derive(Clone)]
pub struct NewsletterService {
	subscriptions: Arc<dyn NewsletterRepository>,
	notifier: Arc<dyn Notifier>,
}

impl NewsletterService {
	pub fn new(subscriptions: Arc<dyn NewsletterRepository>, notifier: Arc<dyn Notifier>) -> Self {
		Self { subscriptions, notifier }
	}

	/// Persist a newsletter subscription, then send a confirmation email.
	/// Duplicate email is rejected with a conflict; email delivery is best-effort.
	pub async fn subscribe(&self, new: NewNewsletterSubscription) -> Result<NewsletterSubscription, DomainError> {
		let subscription = self.subscriptions.create(new).await?;

		if let Err(error) = self.notifier.newsletter_subscribed(&subscription).await {
			tracing::error!(%error, subscriber_id = %subscription.id.raw(), "failed to send newsletter confirmation email");
		}

		Ok(subscription)
	}
}

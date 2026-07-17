use std::net::SocketAddr;

use color_eyre::eyre::Result;

ev_lib::settings! {
	/// The raw environment surface (`dotenvy` loads `.env` first in dev).
	/// Every missing/invalid variable is reported in one aggregate error, and
	/// an empty string counts as unset — so `VAR=` placeholders in `.env`
	/// behave exactly like an absent variable.
	///
	/// `POSTHOG_KEY` / `POSTHOG_HOST` follow the org-canonical names fixed by
	/// `ev_lib::settings::presets` (this backend previously read
	/// `POSTHOG_API_KEY`).
	struct RawSettings {
		database_url: String,
		bind_addr: SocketAddr = "0.0.0.0:58844",
		/// Unset ⇒ error monitoring is a no-op.
		sentry_dsn: Option<String>,
		app_env: String = "development",
		smtp_host: Option<String>,
		smtp_port: u16 = "587",
		smtp_username: Option<String>,
		#[secret]
		smtp_password: Option<String>,
		/// `From:` mailbox for outgoing mail, e.g. `EV Investment <careers@evinvest.vn>`.
		mail_from: String = "EV Investment <careers@evinvest.vn>",
		/// Internal inbox that receives the "new application / new message" copies.
		mail_team: String = "careers@evinvest.vn",
		/// Public origin used to build links inside emails (e.g. "View the role").
		site_url: String = "https://evinvest.vn",
		/// PostHog project key for server-side capture. Unset ⇒ analytics no-op.
		posthog_key: Option<String>,
		posthog_host: Option<String>,
	}
}

/// SMTP transport credentials. Present only when host, username, and password
/// are all set (empty counts as unset); otherwise email delivery is a no-op
/// (the notifier logs and returns Ok), the same "unconfigured ⇒ silent no-op"
/// contract the analytics/Sentry libs use.
#[derive(Clone)]
pub struct SmtpConfig {
	pub host: String,
	pub port: u16,
	pub username: String,
	pub password: String,
}

impl std::fmt::Debug for SmtpConfig {
	fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
		f.debug_struct("SmtpConfig")
			.field("host", &self.host)
			.field("port", &self.port)
			.field("username", &self.username)
			.field("password", &"***")
			.finish()
	}
}

/// Application configuration, assembled from [`RawSettings`].
#[derive(Clone, Debug)]
pub struct AppConfig {
	pub database_url: String,
	pub bind_addr: SocketAddr,
	pub sentry_dsn: Option<String>,
	pub app_env: String,
	pub smtp: Option<SmtpConfig>,
	/// `From:` mailbox for outgoing mail, e.g. `EV Investment <careers@evinvest.vn>`.
	pub mail_from: String,
	/// Internal inbox that receives the "new application / new message" copies.
	pub mail_team: String,
	/// Public origin used to build links inside emails (e.g. "View the role").
	pub site_url: String,
	/// PostHog project key for server-side capture. `None` ⇒ analytics no-op.
	pub posthog_key: Option<String>,
	pub posthog_host: Option<String>,
}

impl AppConfig {
	pub fn from_env() -> Result<Self> {
		let raw = RawSettings::from_env()?;
		let smtp = match (raw.smtp_host, raw.smtp_username, raw.smtp_password) {
			(Some(host), Some(username), Some(password)) => Some(SmtpConfig { host, port: raw.smtp_port, username, password }),
			_ => None,
		};
		Ok(Self {
			database_url: raw.database_url,
			bind_addr: raw.bind_addr,
			sentry_dsn: raw.sentry_dsn,
			app_env: raw.app_env,
			smtp,
			mail_from: raw.mail_from,
			mail_team: raw.mail_team,
			site_url: raw.site_url,
			posthog_key: raw.posthog_key,
			posthog_host: raw.posthog_host,
		})
	}
}

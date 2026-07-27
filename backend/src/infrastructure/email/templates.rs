//! Server-rendered transactional emails. One dark shell, four messages, all
//! adaptive on whether a vacancy is attached — the universal-letter mechanic.
//! Inline hex (not design tokens) is required here: email clients support
//! neither CSS variables nor external stylesheets, so brand colours are
//! inlined per element.
//!
//! The palette below is flattened from `@evinvest/uikit` (`styles/tokens.css`),
//! which is the same source the Figma `ev/color` variables publish from — keep
//! the two in step when either moves.

use domain::model::{application::JobApplication, contact::ContactMessage, newsletter::NewsletterSubscription, vacancy::Vacancy};

// Flattened `@evinvest/uikit` tokens. Mail clients support neither CSS variables
// nor `color-mix`, so the alpha-based semantic tokens are pre-composited against
// the surface they sit on and pasted as opaque hex.
const MIST: &str = "#e6e1d3"; // --color-main-mist
const TEAL: &str = "#2a9d8f"; // --color-main-accent-t1
const HAIR: &str = "#1b2742"; // navy-hairline
const BLACK: &str = "#070d18"; // --color-main-black / --background
const SURFACE: &str = "#081020"; // --color-main-surface
const CARD: &str = "#0c1626"; // --color-main-card / --card
// --muted-foreground is `mist 40%`, which composites to ~#63676b on the card —
// 3.3:1, under the 4.5:1 that 13px body copy needs. Kept on the same mist ramp
// but at 60% so the label column stays legible in a mail client.
const MUTED: &str = "#8f908e";

// Playfair/Inter are the site's families; a mail client that lacks them falls
// through to the same serif/sans pairing the templates used before.
const SERIF: &str = "'Playfair Display',Georgia,'Times New Roman',serif";
const SANS: &str = "Inter,-apple-system,'Segoe UI',Arial,Helvetica,sans-serif";
pub struct RenderedEmail {
	pub subject: String,
	pub html: String,
	pub text: String,
}

pub fn candidate_application_received(application: &JobApplication, vacancy: Option<&Vacancy>, site_url: &str) -> RenderedEmail {
	let reference = reference(application.id.raw());
	let submitted = fmt_ts(&application.created_at);
	let first_name = application.applicant_name.split_whitespace().next().unwrap_or(&application.applicant_name).to_string();

	let (subject, eyebrow_text, role_section, cta) = match vacancy {
		Some(v) => {
			let mut block = String::new();
			block.push_str(&eyebrow(&format!("Your application · {}", v.title)));
			block.push_str(&detail_box(&[
				("Role", v.title.clone()),
				("Location", v.location.clone()),
				("Submitted", submitted.clone()),
				("Reference", reference.clone()),
			]));
			if !application.confirmed_requirements.is_empty() {
				block.push_str(&steps_heading("What you confirmed"));
				let items: Vec<(String, bool)> = application.confirmed_requirements.iter().map(|r| (r.clone(), true)).collect();
				block.push_str(&checklist(&items));
			}
			(
				format!("Your application for {} is in", v.title),
				"Application received".to_string(),
				block,
				button("View the role", &format!("{site_url}/hiring/{}", v.slug.as_str())),
			)
		}
		None => (
			"Your application is in — EV Investment".to_string(),
			"Application received".to_string(),
			detail_box(&[
				("Applicant", application.applicant_name.clone()),
				("Submitted", submitted.clone()),
				("Reference", reference.clone()),
			]),
			button("Browse open roles", &format!("{site_url}/hiring")),
		),
	};

	let mut body = String::new();
	body.push_str(&eyebrow(&eyebrow_text));
	body.push_str(&heading(&format!("Thanks, {first_name} — we've got it.")));
	body.push_str(&paragraph(match vacancy {
		Some(_) => "Your application has reached our team. We read every one personally and will be in touch about next steps. The details we have on file are below.",
		None => "Thanks for putting yourself forward. We've added you to our talent pool and will reach out when a role fits your strengths. Your details are below.",
	}));
	body.push_str(&role_section);
	body.push_str(&steps(
		"What happens next",
		&[
			"We review your application within five business days.",
			"If there's a fit, we'll invite you to an intro conversation.",
			"Either way, you'll hear back from a person — not a bot.",
		],
	));
	body.push_str(&cta);

	let html = shell(
		&format!("We received your application, {first_name}."),
		&body,
		"You're receiving this because you applied via evinvest.ltd/hiring.",
	);
	let text = application_received_text(vacancy, &reference, &submitted, &first_name);
	RenderedEmail { subject, html, text }
}
pub fn internal_new_application(application: &JobApplication, vacancy: Option<&Vacancy>, _site_url: &str) -> RenderedEmail {
	let reference = reference(application.id.raw());
	let submitted = fmt_ts(&application.created_at);
	let role_label = vacancy.map(|v| v.title.clone()).unwrap_or_else(|| "General talent pool — no specific role".to_string());

	let mut body = String::new();
	body.push_str(&eyebrow("New application"));
	body.push_str(&heading(&application.applicant_name));
	body.push_str(&detail_box(&[
		("Name", application.applicant_name.clone()),
		("Email", application.email.as_str().to_string()),
		("Portfolio", application.portfolio_url.clone().unwrap_or_else(|| "—".to_string())),
		("Role", role_label),
		("Submitted", submitted.clone()),
		("Reference", reference.clone()),
	]));
	if !application.message.trim().is_empty() {
		body.push_str(&steps_heading("Where they'd fit"));
		body.push_str(&quote_block(&application.message));
	}
	if let Some(v) = vacancy {
		body.push_str(&steps_heading("Requirement checks"));
		let items: Vec<(String, bool)> = v.requirements.iter().map(|r| (r.clone(), application.confirmed_requirements.iter().any(|c| c == r))).collect();
		body.push_str(&checklist(&items));
		if let Some(answer) = application.screening_answer.as_ref().filter(|a| !a.trim().is_empty()) {
			body.push_str(&steps_heading(&format!("Screening · {}", v.screening_question)));
			body.push_str(&quote_block(answer));
		}
	}

	let footer = match vacancy {
		Some(v) => format!("Internal notification · application for {}.", v.title),
		None => "Internal notification · general talent-pool application.".to_string(),
	};
	let html = shell("New application received.", &body, &footer);
	let text = format!(
		"New application\n\nName: {}\nEmail: {}\nRole: {}\nSubmitted: {submitted}\nReference: {reference}\n\nNote:\n{}\n",
		application.applicant_name,
		application.email.as_str(),
		vacancy.map(|v| v.title.as_str()).unwrap_or("General talent pool"),
		application.message
	);
	RenderedEmail {
		subject: format!("New application · {}", vacancy.map(|v| v.title.as_str()).unwrap_or("General talent pool")),
		html,
		text,
	}
}
pub fn candidate_contact_received(message: &ContactMessage, site_url: &str) -> RenderedEmail {
	let reference = reference(message.id.raw());
	let submitted = fmt_ts(&message.created_at);
	let first_name = message.name.split_whitespace().next().unwrap_or(&message.name).to_string();

	let mut body = String::new();
	body.push_str(&eyebrow("Message received"));
	body.push_str(&heading(&format!("Thanks for reaching out, {first_name}.")));
	body.push_str(&paragraph(
		"Your message has reached our team and we'll reply personally, usually within two business days. Here's what we have on file.",
	));
	body.push_str(&detail_box(&[
		("From", message.email.as_str().to_string()),
		("Submitted", submitted.clone()),
		("Reference", reference.clone()),
	]));
	body.push_str(&steps_heading("Your message"));
	body.push_str(&quote_block(&message.message));
	body.push_str(&steps(
		"While you wait",
		&["Explore our coastal developments in Quy Nhơn.", "Read our latest research on the market."],
	));
	body.push_str(&button("Explore developments", site_url));

	let html = shell(
		&format!("We received your message, {first_name}."),
		&body,
		"You're receiving this because you contacted us via evinvest.ltd.",
	);
	let text = format!(
		"Thanks for reaching out, {first_name}.\n\nWe received your message and will reply within two business days.\n\nReference: {reference}\nSubmitted: {submitted}\n\nYour message:\n{}\n\n— EV Investment",
		message.message
	);
	RenderedEmail {
		subject: "We received your message — EV Investment".to_string(),
		html,
		text,
	}
}
pub fn internal_new_contact(message: &ContactMessage, _site_url: &str) -> RenderedEmail {
	let reference = reference(message.id.raw());
	let submitted = fmt_ts(&message.created_at);

	let mut body = String::new();
	body.push_str(&eyebrow("New message"));
	body.push_str(&heading(&message.name));
	body.push_str(&detail_box(&[
		("Name", message.name.clone()),
		("Email", message.email.as_str().to_string()),
		("Submitted", submitted.clone()),
		("Reference", reference.clone()),
	]));
	body.push_str(&steps_heading("Message"));
	body.push_str(&quote_block(&message.message));

	let html = shell("New contact message.", &body, "Internal notification · contact form.");
	let text = format!(
		"New message\n\nName: {}\nEmail: {}\nSubmitted: {submitted}\nReference: {reference}\n\n{}\n",
		message.name,
		message.email.as_str(),
		message.message
	);
	RenderedEmail {
		subject: format!("New message · {}", message.name),
		html,
		text,
	}
}
pub fn candidate_newsletter_subscribed(subscription: &NewsletterSubscription, _site_url: &str) -> RenderedEmail {
	let reference = reference(subscription.id.raw());
	let submitted = fmt_ts(&subscription.created_at);

	let mut body = String::new();
	body.push_str(&eyebrow("You're on the list"));
	body.push_str(&heading("Welcome to the EV Investment newsletter."));
	body.push_str(&paragraph(
		"We'll send you curated research, market updates on Quy Nhơn, and early access to new opportunities — no more than once a month, unsubscribe anytime.",
	));
	body.push_str(&detail_box(&[
		("Email", subscription.email.as_str().to_string()),
		("Subscribed", submitted.clone()),
		("Reference", reference.clone()),
	]));

	let html = shell("Welcome to the EV Investment newsletter.", &body, "You're receiving this because you subscribed via evinvest.ltd.");
	let text = format!(
		"Welcome to the EV Investment newsletter.\n\nWe'll send you curated research, market updates on Quy Nhơn, and early access to new opportunities.\n\nEmail: {}\nSubscribed: {submitted}\nReference: {reference}\n\n— EV Investment",
		subscription.email.as_str()
	);
	RenderedEmail {
		subject: "You're on the list — EV Investment".to_string(),
		html,
		text,
	}
}
fn esc(raw: &str) -> String {
	raw.replace('&', "&amp;").replace('<', "&lt;").replace('>', "&gt;").replace('"', "&quot;")
}

fn reference(id: uuid::Uuid) -> String {
	id.simple().to_string()[..8].to_uppercase()
}

/// Human-readable UTC, e.g. `27 Jul 2026, 16:31 UTC`. The raw RFC 3339 form
/// (`2026-07-27T16:31:07.918453Z`) reads as machine output in a letter.
fn fmt_ts(ts: &jiff::Timestamp) -> String {
	ts.strftime("%-d %b %Y, %H:%M UTC").to_string()
}

fn heading(text: &str) -> String {
	// -0.02em tracking mirrors the `h1,h2,h3` rule in the site's globals.css.
	format!(
		r#"<h1 style="margin:0 0 14px;font-family:{SERIF};font-size:24px;line-height:1.25;letter-spacing:-0.02em;color:{MIST};font-weight:600;">{}</h1>"#,
		esc(text)
	)
}

fn eyebrow(text: &str) -> String {
	format!(
		r#"<p style="margin:0 0 18px;font-family:{SANS};font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:{TEAL};">{}</p>"#,
		esc(text)
	)
}

fn paragraph(text: &str) -> String {
	format!(
		r#"<p style="margin:0 0 16px;font-family:{SANS};font-size:15px;line-height:1.6;color:{MIST};">{}</p>"#,
		esc(text)
	)
}

fn detail_box(rows: &[(&str, String)]) -> String {
	let body: String = rows
		.iter()
		.map(|(label, value)| {
			format!(
				r#"<tr><td style="padding:6px 0;font-family:{SANS};font-size:13px;color:{MUTED};">{}</td><td align="right" style="padding:6px 0;font-family:{SANS};font-size:13px;color:{MIST};">{}</td></tr>"#,
				esc(label),
				esc(value)
			)
		})
		.collect();
	format!(
		r#"<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 22px;padding:16px 18px;background:{BLACK};border:1px solid {HAIR};border-radius:8px;">{body}</table>"#
	)
}

fn quote_block(text: &str) -> String {
	format!(
		r#"<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 22px;"><tr><td width="3" style="background:{TEAL};border-radius:2px;"></td><td style="padding:4px 0 4px 16px;font-family:{SANS};font-size:14px;line-height:1.6;color:{MIST};">{}</td></tr></table>"#,
		esc(text).replace('\n', "<br>")
	)
}

fn checklist(items: &[(String, bool)]) -> String {
	let body: String = items
		.iter()
		.map(|(label, checked)| {
			let (mark, color) = if *checked { ("&#10003;", TEAL) } else { ("&#9675;", MUTED) };
			format!(
				r#"<tr><td width="22" valign="top" style="font-family:{SANS};font-size:14px;color:{color};">{mark}</td><td style="padding:0 0 8px;font-family:{SANS};font-size:14px;line-height:1.5;color:{MIST};">{}</td></tr>"#,
				esc(label)
			)
		})
		.collect();
	format!(r#"<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 22px;">{body}</table>"#)
}

fn steps(label: &str, items: &[&str]) -> String {
	let lis: String = items
		.iter()
		.map(|i| format!(r#"<tr><td width="22" valign="top" style="font-family:{SANS};font-size:14px;color:{TEAL};">&mdash;</td><td style="padding:0 0 8px;font-family:{SANS};font-size:14px;line-height:1.5;color:{MIST};">{}</td></tr>"#, esc(i)))
		.collect();
	format!(
		r#"<p style="margin:0 0 10px;font-family:{SANS};font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:{MUTED};">{}</p><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">{lis}</table>"#,
		esc(label)
	)
}

fn button(label: &str, href: &str) -> String {
	format!(
		r#"<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 4px;"><tr><td style="background:{TEAL};border-radius:8px;"><a href="{}" style="display:inline-block;padding:13px 26px;font-family:{SANS};font-size:14px;font-weight:600;color:{BLACK};text-decoration:none;">{}</a></td></tr></table>"#,
		esc(href),
		esc(label)
	)
}

/// Wrap rendered sections in the brand shell: logo header, body, legal footer.
fn shell(preheader: &str, body: &str, footer_context: &str) -> String {
	let preheader = esc(preheader);
	let footer_context = esc(footer_context);
	format!(
		r##"<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"></head>
<body style="margin:0;padding:0;background:{BLACK};">
<span style="display:none;max-height:0;overflow:hidden;opacity:0;">{preheader}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:{BLACK};padding:32px 12px;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;background:{CARD};border:1px solid {HAIR};border-radius:14px;overflow:hidden;">
<tr><td style="padding:26px 36px;border-bottom:1px solid {HAIR};">
<div style="font-family:{SANS};font-size:18px;line-height:1.3;"><span style="font-weight:700;letter-spacing:.06em;color:{MIST};">EV</span><span style="font-weight:300;letter-spacing:.22em;color:{MUTED};">&nbsp;INVESTMENT</span></div>
<div style="margin-top:2px;font-family:{SANS};font-size:9px;letter-spacing:.28em;color:{MUTED};">QUY NHON FUND</div>
</td></tr>
<tr><td style="padding:34px 36px;background:{CARD};">{body}</td></tr>
<tr><td style="padding:24px 36px;background:{SURFACE};border-top:1px solid {HAIR};">
<p style="margin:0 0 6px;font-family:{SANS};font-size:12px;color:{MIST};">EV Investment</p>
<p style="margin:0 0 12px;font-family:{SANS};font-size:12px;line-height:1.6;color:{MUTED};">Premium coastal developments &middot; Quy Nh&#417;n, Vietnam</p>
<p style="margin:0 0 12px;font-family:{SANS};font-size:12px;line-height:1.6;color:{MUTED};">{footer_context}</p>
<p style="margin:0;font-family:{SANS};font-size:11px;color:{MUTED};">&copy; 2026 EV Investment</p>
</td></tr>
</table>
</td></tr></table></body></html>"##
	)
}

// ── candidate: application received ────────────────────────────────────────

fn steps_heading(label: &str) -> String {
	format!(
		r#"<p style="margin:0 0 10px;font-family:{SANS};font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:{MUTED};">{}</p>"#,
		esc(label)
	)
}

fn application_received_text(vacancy: Option<&Vacancy>, reference: &str, submitted: &str, first_name: &str) -> String {
	let role = vacancy.map(|v| format!("Role: {}\nLocation: {}\n", v.title, v.location)).unwrap_or_default();
	format!(
		"Thanks, {first_name} — we've got it.\n\nYour application has reached the EV Investment team.\n\n{role}Submitted: {submitted}\nReference: {reference}\n\nWhat happens next:\n- We review your application within five business days.\n- If there's a fit, we'll invite you to an intro conversation.\n- Either way, you'll hear back from a person.\n\n— EV Investment"
	)
}

// ── internal: new application ──────────────────────────────────────────────

// ── candidate: contact message received ────────────────────────────────────

// ── internal: new contact message ──────────────────────────────────────────

// ── newsletter: subscriber confirmation ────────────────────────────────────


#[cfg(test)]
mod render_preview {
	use super::*;

	// Dumps the rendered newsletter mail so the shell can be eyeballed in a
	// browser. Not an assertion — run with `--ignored` when tweaking the design.
	#[test]
	#[ignore]
	fn dump_newsletter_html() {
		use domain::model::{email::EmailAddress, newsletter::{NewsletterId, NewsletterSubscription}};
		let sub = NewsletterSubscription {
			id: NewsletterId::from_raw(uuid::Uuid::parse_str("636b9c35-4f4b-40e4-9785-47cf4ff17e07").unwrap()),
			email: EmailAddress::parse("admin+newsletter@evinvest.ltd").unwrap(),
			created_at: "2026-07-27T16:31:07Z".parse().unwrap(),
		};
		let mail = candidate_newsletter_subscribed(&sub, "https://evinvest.ltd");
		std::fs::write(std::env::var("PREVIEW_OUT").unwrap_or_else(|_| "/tmp/mail.html".into()), &mail.html).unwrap();
	}

	// The richest shell: quote block, step list and the CTA button.
	#[test]
	#[ignore]
	fn dump_contact_html() {
		use domain::model::{
			contact::{ContactId, ContactMessage},
			email::EmailAddress,
		};
		let msg = ContactMessage {
			id: ContactId::from_raw(uuid::Uuid::parse_str("047937fb-be8f-4074-8c07-822a137b771b").unwrap()),
			name: "Jane Doe".to_string(),
			email: EmailAddress::parse("jane@example.com").unwrap(),
			message: "I'd like to learn more about the Quy Nhơn fund.\nCould we set up a call next week?".to_string(),
			created_at: "2026-07-27T16:31:07Z".parse().unwrap(),
		};
		let mail = candidate_contact_received(&msg, "https://evinvest.ltd");
		std::fs::write(std::env::var("PREVIEW_OUT").unwrap_or_else(|_| "/tmp/mail-contact.html".into()), &mail.html).unwrap();
	}
}

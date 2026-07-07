//! Server-rendered transactional emails. One dark shell, four messages, all
//! adaptive on whether a vacancy is attached — the universal-letter mechanic
//! from the Figma "Transactional Emails" board. Inline hex (not design tokens)
//! is required here: email clients support neither CSS variables nor external
//! stylesheets, so brand colours are inlined per element.

use domain::model::{application::JobApplication, contact::ContactMessage, vacancy::Vacancy};

const MIST: &str = "#e6e1d3";
const MUTED: &str = "#9aa6b8";
const TEAL: &str = "#2a9d8f";
const HAIR: &str = "#1b2742";
const CARD: &str = "#0b1322";
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
		"You're receiving this because you applied via evinvest.vn/hiring.",
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
		"You're receiving this because you contacted us via evinvest.vn.",
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
fn esc(raw: &str) -> String {
	raw.replace('&', "&amp;").replace('<', "&lt;").replace('>', "&gt;").replace('"', "&quot;")
}

fn reference(id: uuid::Uuid) -> String {
	id.simple().to_string()[..8].to_uppercase()
}

fn fmt_ts(ts: &jiff::Timestamp) -> String {
	ts.to_string()
}

fn heading(text: &str) -> String {
	format!(
		r#"<h1 style="margin:0 0 14px;font-family:Georgia,'Times New Roman',serif;font-size:24px;line-height:1.25;color:{MIST};font-weight:600;">{}</h1>"#,
		esc(text)
	)
}

fn eyebrow(text: &str) -> String {
	format!(
		r#"<p style="margin:0 0 18px;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:{TEAL};">{}</p>"#,
		esc(text)
	)
}

fn paragraph(text: &str) -> String {
	format!(
		r#"<p style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:{MIST};">{}</p>"#,
		esc(text)
	)
}

fn detail_box(rows: &[(&str, String)]) -> String {
	let body: String = rows
		.iter()
		.map(|(label, value)| {
			format!(
				r#"<tr><td style="padding:6px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:{MUTED};">{}</td><td align="right" style="padding:6px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:{MIST};">{}</td></tr>"#,
				esc(label),
				esc(value)
			)
		})
		.collect();
	format!(
		r#"<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 22px;padding:16px 18px;background:#070d18;border:1px solid {HAIR};border-radius:10px;">{body}</table>"#
	)
}

fn quote_block(text: &str) -> String {
	format!(
		r#"<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 22px;"><tr><td width="3" style="background:{TEAL};border-radius:2px;"></td><td style="padding:4px 0 4px 16px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:{MIST};">{}</td></tr></table>"#,
		esc(text).replace('\n', "<br>")
	)
}

fn checklist(items: &[(String, bool)]) -> String {
	let body: String = items
		.iter()
		.map(|(label, checked)| {
			let (mark, color) = if *checked { ("&#10003;", TEAL) } else { ("&#9675;", MUTED) };
			format!(
				r#"<tr><td width="22" valign="top" style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:{color};">{mark}</td><td style="padding:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.5;color:{MIST};">{}</td></tr>"#,
				esc(label)
			)
		})
		.collect();
	format!(r#"<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 22px;">{body}</table>"#)
}

fn steps(label: &str, items: &[&str]) -> String {
	let lis: String = items
		.iter()
		.map(|i| format!(r#"<tr><td width="22" valign="top" style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:{TEAL};">&mdash;</td><td style="padding:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.5;color:{MIST};">{}</td></tr>"#, esc(i)))
		.collect();
	format!(
		r#"<p style="margin:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:{MUTED};">{}</p><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">{lis}</table>"#,
		esc(label)
	)
}

fn button(label: &str, href: &str) -> String {
	format!(
		r#"<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 4px;"><tr><td style="background:{TEAL};border-radius:8px;"><a href="{}" style="display:inline-block;padding:13px 26px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:600;color:#04130f;text-decoration:none;">{}</a></td></tr></table>"#,
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
<body style="margin:0;padding:0;background:#04070e;">
<span style="display:none;max-height:0;overflow:hidden;opacity:0;">{preheader}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#04070e;padding:32px 12px;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;background:{CARD};border:1px solid {HAIR};border-radius:14px;overflow:hidden;">
<tr><td style="padding:26px 36px;border-bottom:1px solid {HAIR};">
<span style="font-family:Arial,Helvetica,sans-serif;font-size:18px;font-weight:700;letter-spacing:.06em;color:{MIST};">EV</span>
<span style="font-family:Arial,Helvetica,sans-serif;font-size:18px;font-weight:300;letter-spacing:.22em;color:{MUTED};">&nbsp;INVESTMENT</span>
</td></tr>
<tr><td style="padding:34px 36px;background:#070d18;">{body}</td></tr>
<tr><td style="padding:24px 36px;background:#05080e;border-top:1px solid {HAIR};">
<p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:{MIST};">EV Investment</p>
<p style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:{MUTED};">Premium coastal developments &middot; Quy Nh&#417;n, Vietnam</p>
<p style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:{MUTED};">{footer_context}</p>
<p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#5a6576;">&copy; 2026 EV Investment</p>
</td></tr>
</table>
</td></tr></table></body></html>"##
	)
}

// ── candidate: application received ────────────────────────────────────────

fn steps_heading(label: &str) -> String {
	format!(
		r#"<p style="margin:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:{MUTED};">{}</p>"#,
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

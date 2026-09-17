// DRAFT — pending legal review (site_conductor #204). Not legal advice; a
// template for counsel to edit. Bracketed tokens are placeholders the owner
// fills before this page ships. The processors named are the ones the code
// integrates today (Google, Didit, Turnkey, PostHog, Sentry); nothing here
// asserts a transfer mechanism, certification or retention period.
import type { Translate } from "@evinvest/i18n";

import type { LegalDocument } from "./document";

export const privacyDocument = (t: Translate): LegalDocument => ({
  title: t("legal.privacy.title", "Privacy Policy"),
  lede: t(
    "legal.privacy.lede",
    "What personal data EV Investment collects, why, who processes it, and the rights you have over it."
  ),
  sections: [
    {
      title: t("legal.privacy.controller.title", "Who is responsible"),
      paragraphs: [
        "The controller of your personal data is [LEGAL NAME], [REGISTERED ADDRESS]. Privacy questions and requests go to [DPO / CONTACT EMAIL].",
      ],
    },
    {
      title: t("legal.privacy.data.title", "What we collect"),
      paragraphs: [
        "Only what the service needs to run and what the law requires us to keep:",
      ],
      bullets: [
        "Your name and e-mail address, received from Google when you sign in.",
        "Identity-verification documents and the verification result. The documents themselves are held by our verification provider, Didit; we keep the outcome and the reference needed to find the check.",
        "Wallet addresses you deposit from or withdraw to, and the record of your deposits, withdrawals, subscriptions and redemptions.",
        "Session and device information: IP address, browser and operating system, and the cookies that keep you signed in.",
        "Product-analytics events (which screens you use and what you click) and technical error reports.",
        "Messages you send us, and your e-mail address if you subscribe to our reports.",
      ],
    },
    {
      title: t("legal.privacy.purposes.title", "Why we use it"),
      paragraphs: [
        "To provide the Platform and perform our agreement with you; to meet our legal obligations, including identity verification, anti-money-laundering checks and financial record keeping; for our legitimate interests in securing the Platform, preventing fraud and understanding how the product is used; and, for the newsletter, on your consent, which you can withdraw at any time by unsubscribing.",
      ],
    },
    {
      title: t("legal.privacy.sharing.title", "Who processes it"),
      paragraphs: [
        "We share personal data with providers that process it on our instructions and only for the purposes above: Google (sign-in), Didit (identity verification), Turnkey (custody and transaction signing), PostHog (product analytics), Sentry (error monitoring), and the infrastructure that hosts the Platform. We disclose data to authorities where the law requires it. We do not sell personal data and we do not share it for advertising.",
      ],
    },
    {
      title: t("legal.privacy.cookies.title", "Cookies and analytics"),
      paragraphs: [
        "The Platform sets the cookies strictly necessary to keep you signed in and to remember your language. Product analytics through PostHog measures how the site and cabinet are used; error monitoring through Sentry captures the technical detail of a failure. There is no advertising or cross-site tracking.",
      ],
    },
    {
      title: t(
        "legal.privacy.retention.title",
        "Where it goes and how long we keep it"
      ),
      paragraphs: [
        "Some of the providers above process data outside [JURISDICTION]. Where the law requires it, we rely on the transfer safeguards available under applicable law. We keep account and transaction records for as long as your account is open and afterwards for as long as financial and anti-money-laundering law requires; analytics data is kept in the form our analytics provider retains it; newsletter data until you unsubscribe.",
      ],
    },
    {
      title: t("legal.privacy.rights.title", "Your rights"),
      paragraphs: [
        "Subject to applicable law, you may ask for access to your personal data, for it to be corrected or erased, for its processing to be restricted, for a copy in a portable form, and you may object to processing based on our legitimate interests. Where processing rests on consent, you may withdraw it. You may also complain to the supervisory authority in your country. To exercise any of these, write to [DPO / CONTACT EMAIL].",
      ],
    },
    {
      title: t("legal.privacy.security.title", "Security and changes"),
      paragraphs: [
        "Transaction signing runs through Turnkey’s custody infrastructure, and access to personal data is restricted to the people and systems that need it. No method of transmission or storage is entirely secure, and we cannot guarantee absolute security. We may revise this policy; the revised text is posted here with a new effective date.",
      ],
    },
  ],
});

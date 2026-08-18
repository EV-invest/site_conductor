"use client";

import { Send } from "lucide-react";
import { useT } from "@evinvest/i18n/react";
import { LIMITS } from "@/shared/lib/validation";
import { SentPanel } from "@/shared/ui/sent-panel";
import { TextField } from "@/shared/ui/text-field";
import { useContactForm } from "./use-contact-form";

/** Vacancy-agnostic contact form. Posts to the backend `createContact`. */
export function ContactForm() {
  const t = useT();
  const { fields, edit, errors, status, errorKey, submit } = useContactForm();
  // Field errors arrive as catalogue keys (shared/lib/validation.ts); LIMITS is
  // the value bag the max-length messages interpolate.
  const fe = (key?: string) => (key ? t(key, LIMITS) : undefined);
  const firstName = fields.name.trim().split(" ")[0];

  if (status === "sent") {
    return (
      <SentPanel
        title={
          firstName
            ? t("contact.form.sent.titleNamed", { name: firstName })
            : t("contact.form.sent.title")
        }
      >
        {t("contact.form.sent.body")}
      </SentPanel>
    );
  }

  return (
    <form
      onSubmit={submit}
      noValidate
      className="rounded-xl border border-white/10 bg-main-card/40 p-6"
    >
      <div className="space-y-4">
        <TextField
          label={t("form.name.label")}
          value={fields.name}
          onChange={edit("name")}
          error={fe(errors.name)}
          maxLength={LIMITS.name}
          required
          placeholder={t("form.name.placeholder")}
        />
        <TextField
          label={t("form.email.label")}
          type="email"
          value={fields.email}
          onChange={edit("email")}
          error={fe(errors.email)}
          maxLength={LIMITS.email}
          required
          placeholder={t("contact.form.email.placeholder")}
        />
        <TextField
          label={t("contact.form.message.label")}
          rows={5}
          value={fields.message}
          onChange={edit("message")}
          error={fe(errors.message)}
          maxLength={LIMITS.message}
          required
          placeholder={t("contact.form.message.placeholder")}
        />
      </div>

      {status === "error" && errorKey && (
        <p role="alert" className="mt-3 text-xs text-destructive">
          {t(errorKey)}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        aria-busy={status === "sending"}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-main-accent-t1 px-6 py-3 font-mono-tech text-xs uppercase tracking-widest text-main-black transition-colors hover:bg-main-accent-t1/90 disabled:opacity-60"
      >
        {status === "sending" ? (
          t("form.sending")
        ) : (
          <>
            {t("contact.form.submit")} <Send className="h-4 w-4" />
          </>
        )}
      </button>
    </form>
  );
}

"use client";

import { useT } from "@evinvest/i18n/react";
import { LIMITS } from "@/shared/lib/validation";
import { SentPanel } from "@/shared/ui/sent-panel";
import { TextField } from "@/shared/ui/text-field";
import { FormFooter, FormHeader } from "./form-chrome";
import { RoleBlock } from "./role-block";
import {
  useApplicationForm,
  type VacancyContext,
} from "./use-application-form";

/**
 * The universal dispatch/letter form. Posts to the backend `createApplication`
 * endpoint. When `vacancy` is provided it renders the injectable role block and
 * tags the submission with the slug; otherwise it's a general talent-pool
 * application. Reused by the hiring board (general) and the role page (role).
 */
export function ApplicationForm({ vacancy }: { vacancy?: VacancyContext }) {
  const t = useT();
  const { fields, edit, checked, toggle, errors, status, errorKey, submit } =
    useApplicationForm(vacancy);
  // Field errors arrive as catalogue keys (shared/lib/validation.ts); LIMITS is
  // the value bag the max-length messages interpolate.
  const fe = (key?: string) => (key ? t(key, LIMITS) : undefined);
  const firstName = fields.name.trim().split(" ")[0];

  if (status === "sent") {
    return (
      <SentPanel
        title={
          firstName
            ? t("apply.form.sent.titleNamed", { name: firstName })
            : t("apply.form.sent.title")
        }
      >
        {t("apply.form.sent.body")}
      </SentPanel>
    );
  }

  return (
    <form
      onSubmit={submit}
      noValidate
      className="rounded-xl border border-white/10 bg-main-card/40 p-6"
    >
      <FormHeader roleTitle={vacancy?.title} />

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
          placeholder={t("apply.form.email.placeholder")}
        />
        <TextField
          label={t("apply.form.portfolio.label")}
          value={fields.portfolio}
          onChange={edit("portfolio")}
          error={fe(errors.portfolio)}
          maxLength={LIMITS.portfolioUrl}
          placeholder={t("apply.form.portfolio.placeholder")}
        />
        {vacancy && (
          <RoleBlock
            title={vacancy.title}
            requirements={vacancy.requirements}
            screeningQuestion={vacancy.screeningQuestion}
            checked={checked}
            onToggle={toggle}
            screeningValue={fields.screening}
            onScreeningChange={edit("screening")}
            screeningError={fe(errors.screening)}
          />
        )}
        <TextField
          label={t("apply.form.message.label")}
          rows={4}
          value={fields.message}
          onChange={edit("message")}
          error={fe(errors.message)}
          maxLength={LIMITS.message}
          required
          placeholder={t("apply.form.message.placeholder")}
        />
      </div>

      {status === "error" && errorKey && (
        <p role="alert" className="mt-3 text-xs text-destructive">
          {t(errorKey)}
        </p>
      )}

      <FormFooter sending={status === "sending"} />
    </form>
  );
}

"use client";

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
  const { fields, edit, checked, toggle, errors, status, errorMsg, submit } =
    useApplicationForm(vacancy);

  if (status === "sent") {
    return (
      <SentPanel
        title={
          <>
            Thanks{fields.name ? `, ${fields.name.split(" ")[0]}` : ""} —
            we&apos;ve got it.
          </>
        }
      >
        Your application has reached our team. We read every one and will be in
        touch.
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
          label="Your name"
          value={fields.name}
          onChange={edit("name")}
          error={errors.name}
          maxLength={LIMITS.name}
          required
          placeholder="Jane Doe"
        />
        <TextField
          label="Email"
          type="email"
          value={fields.email}
          onChange={edit("email")}
          error={errors.email}
          maxLength={LIMITS.email}
          required
          placeholder="jane@fund.com"
        />
        <TextField
          label="Portfolio or LinkedIn (optional)"
          value={fields.portfolio}
          onChange={edit("portfolio")}
          error={errors.portfolio}
          maxLength={LIMITS.portfolioUrl}
          placeholder="https://…"
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
            screeningError={errors.screening}
          />
        )}
        <TextField
          label="Where you'd fit"
          rows={4}
          value={fields.message}
          onChange={edit("message")}
          error={errors.message}
          maxLength={LIMITS.message}
          required
          placeholder="A few lines on what you'd want to own, and why EV…"
        />
      </div>

      {status === "error" && (
        <p role="alert" className="mt-3 text-xs text-destructive">
          {errorMsg}
        </p>
      )}

      <FormFooter sending={status === "sending"} />
    </form>
  );
}

"use client";

import { type FormEvent, useState } from "react";
import { Check, Send } from "lucide-react";
import { createApplication } from "@/entities/job-application";
import { extractApiError } from "@/shared/api";
import { CONTROL, Field } from "./field";
import { RoleBlock } from "./role-block";

export interface VacancyContext {
  slug: string;
  title: string;
  requirements: string[];
  screeningQuestion: string;
}

type Status = "idle" | "sending" | "sent" | "error";

/**
 * The universal dispatch/letter form. Posts to the backend `createApplication`
 * endpoint. When `vacancy` is provided it renders the injectable role block and
 * tags the submission with the slug; otherwise it's a general talent-pool
 * application. Reused by the hiring board (general) and the role page (role).
 */
export function ApplicationForm({ vacancy }: { vacancy?: VacancyContext }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [message, setMessage] = useState("");
  const [screening, setScreening] = useState("");
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const toggle = (requirement: string) =>
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(requirement)) next.delete(requirement);
      else next.add(requirement);
      return next;
    });

  async function submit(event: FormEvent) {
    event.preventDefault();
    setStatus("sending");
    try {
      const { data, error } = await createApplication({
        body: {
          vacancy_slug: vacancy?.slug,
          name,
          email,
          portfolio_url: portfolio.trim() || undefined,
          message,
          confirmed_requirements: vacancy ? [...checked] : [],
          screening_answer: vacancy && screening.trim() ? screening : undefined,
        },
      });
      if (error || !data) {
        setErrorMsg(extractApiError(error));
        setStatus("error");
        return;
      }
      setStatus("sent");
    } catch {
      setErrorMsg("Network error — please try again.");
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div
        role="status"
        className="flex flex-col items-center rounded-xl border border-main-accent-t1/30 bg-main-card/40 p-10 text-center"
      >
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-main-accent-t1/15">
          <Check className="h-6 w-6 text-main-accent-t1" />
        </div>
        <h3 className="font-serif-display text-2xl text-white">
          Thanks{name ? `, ${name.split(" ")[0]}` : ""} — we&apos;ve got it.
        </h3>
        <p className="mt-2 max-w-xs text-sm text-main-mist/60">
          Your application has reached our team. We read every one and will be
          in touch.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-xl border border-white/10 bg-main-card/40 p-6"
    >
      <div className="mb-5 flex items-center justify-between">
        <span className="font-mono-tech text-[10px] uppercase tracking-[0.2em] text-main-accent-t1">
          Open application
        </span>
        <span className="font-mono-tech text-[10px] uppercase tracking-[0.2em] text-main-mist/40">
          {vacancy ? `Role · ${vacancy.title}` : "Form · EV-Hiring"}
        </span>
      </div>
      <h3 className="font-serif-display text-2xl text-white">
        Tell us where you fit.
      </h3>
      <p className="mb-5 mt-1 text-sm text-main-mist/55">
        A few lines is enough — we read every note.
      </p>

      <div className="space-y-4">
        <Field label="Your name">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            required
            className={CONTROL}
            placeholder="Jane Doe"
          />
        </Field>
        <Field label="Email">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className={CONTROL}
            placeholder="jane@fund.com"
          />
        </Field>
        <Field label="Portfolio or LinkedIn (optional)">
          <input
            value={portfolio}
            onChange={e => setPortfolio(e.target.value)}
            className={CONTROL}
            placeholder="https://…"
          />
        </Field>
        {vacancy && (
          <RoleBlock
            title={vacancy.title}
            requirements={vacancy.requirements}
            screeningQuestion={vacancy.screeningQuestion}
            checked={checked}
            onToggle={toggle}
            screeningValue={screening}
            onScreeningChange={setScreening}
          />
        )}
        <Field label="Where you'd fit">
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            required
            rows={4}
            className={CONTROL}
            placeholder="A few lines on what you'd want to own, and why EV…"
          />
        </Field>
      </div>

      {status === "error" && (
        <p role="alert" className="mt-3 text-xs text-destructive">
          {errorMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        aria-busy={status === "sending"}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-main-accent-t1 px-6 py-3 font-mono-tech text-xs uppercase tracking-widest text-main-black transition-colors hover:bg-main-accent-t1/90 disabled:opacity-60"
      >
        {status === "sending" ? (
          "Sending…"
        ) : (
          <>
            Send application <Send className="h-4 w-4" />
          </>
        )}
      </button>
      <p className="mt-4 text-center font-mono-tech text-[9px] uppercase tracking-[0.18em] text-main-mist/35">
        Reply within ~2 weeks · Quy Nhơn · HCMC
      </p>
    </form>
  );
}

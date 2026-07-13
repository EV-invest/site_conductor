"use client";

import { Send } from "lucide-react";
import { LIMITS } from "@/shared/lib/validation";
import { SentPanel } from "@/shared/ui/sent-panel";
import { TextField } from "@/shared/ui/text-field";
import { useContactForm } from "./use-contact-form";

/** Vacancy-agnostic contact form. Posts to the backend `createContact`. */
export function ContactForm() {
  const { fields, edit, errors, status, errorMsg, submit } = useContactForm();

  if (status === "sent") {
    return (
      <SentPanel
        title={
          <>
            Thanks{fields.name ? `, ${fields.name.split(" ")[0]}` : ""} —
            message received.
          </>
        }
      >
        We&apos;ll reply personally, usually within two business days.
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
          placeholder="jane@example.com"
        />
        <TextField
          label="Message"
          rows={5}
          value={fields.message}
          onChange={edit("message")}
          error={errors.message}
          maxLength={LIMITS.message}
          required
          placeholder="How can we help?"
        />
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
            Send message <Send className="h-4 w-4" />
          </>
        )}
      </button>
    </form>
  );
}

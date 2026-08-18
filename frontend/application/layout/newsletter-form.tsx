"use client";

import { type FormEvent, useState } from "react";
import { useT } from "@evinvest/i18n/react";
import {
  subscribeToNewsletter,
  type SubscribeError,
} from "@/entities/newsletter";

type Status = "idle" | "sending" | "sent" | "error";

// Client island — the only interactive piece of the footer, split out so the
// rest of the footer (and its sitemap links) stays a Server Component.
export function NewsletterForm() {
  const t = useT();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  // The reason, not the sentence: the sentence is looked up at render so it
  // follows the reader's locale rather than the locale at submit time.
  const [error, setError] = useState<SubscribeError | "invalidEmail" | null>(
    null
  );
  const errorKey = {
    invalidEmail: "footer.newsletter.invalidEmail",
    duplicate: "footer.newsletter.duplicate",
    server: "footer.newsletter.error",
    network: "footer.newsletter.networkError",
  } as const;

  async function submit(event: FormEvent) {
    event.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes("@")) {
      setError("invalidEmail");
      setStatus("error");
      return;
    }
    setStatus("sending");
    const result = await subscribeToNewsletter(trimmed);
    if (result.ok) {
      setStatus("sent");
    } else {
      setError(result.error);
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="flex items-center gap-2 border border-main-accent-t1/40 px-4 py-3">
        <p className="text-xs text-main-accent-t1 font-mono-tech uppercase">
          {t("footer.newsletter.success")}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate>
      <div className="flex border border-main-mist/20">
        <input
          type="email"
          placeholder={t("footer.newsletter.placeholder")}
          value={email}
          onChange={e => {
            setEmail(e.target.value);
            if (status === "error") {
              setStatus("idle");
              setError(null);
            }
          }}
          // text-base on phones: under 16px iOS zooms the viewport on focus
          // (see shared/ui/control.ts). sm: keeps the 12px footer design.
          className="bg-transparent text-base sm:text-xs p-3 w-full focus:outline-none text-white"
          disabled={status === "sending"}
        />
        <button
          type="submit"
          disabled={status === "sending"}
          className="bg-main-accent-t1 text-main-black px-4 font-mono-tech text-xs uppercase font-bold hover:bg-main-mist transition-colors disabled:opacity-60"
        >
          {status === "sending" ? "…" : t("footer.newsletter.join")}
        </button>
      </div>
      {status === "error" && error && (
        <p role="alert" className="mt-2 text-xs text-red-400">
          {t(errorKey[error])}
        </p>
      )}
    </form>
  );
}

"use client";

import { type FormEvent, useState } from "react";
import { subscribeToNewsletter } from "@/entities/newsletter";

type Status = "idle" | "sending" | "sent" | "error";

// Client island — the only interactive piece of the footer, split out so the
// rest of the footer (and its sitemap links) stays a Server Component.
export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes("@")) {
      setErrorMsg("Enter a valid email address.");
      setStatus("error");
      return;
    }
    setStatus("sending");
    const result = await subscribeToNewsletter(trimmed);
    if (result.ok) {
      setStatus("sent");
    } else {
      setErrorMsg(result.error);
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="flex items-center gap-2 border border-main-accent-t1/40 px-4 py-3">
        <p className="text-xs text-main-accent-t1 font-mono-tech uppercase">
          You&apos;re on the list — welcome.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate>
      <div className="flex border border-main-mist/20">
        <input
          type="email"
          placeholder="Institutional Email"
          value={email}
          onChange={e => {
            setEmail(e.target.value);
            if (status === "error") setStatus("idle");
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
          {status === "sending" ? "…" : "Join"}
        </button>
      </div>
      {status === "error" && (
        <p role="alert" className="mt-2 text-xs text-red-400">
          {errorMsg}
        </p>
      )}
    </form>
  );
}

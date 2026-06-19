"use client";

import { type FormEvent, useState } from "react";
import { Check, Send } from "lucide-react";
import { createContact } from "@/entities/contact";
import { extractApiError } from "@/shared/api";
import { INPUT_CLASS as CONTROL } from "@/shared/ui/control";

const LABEL = "mb-1.5 block font-mono-tech text-[10px] uppercase tracking-[0.2em] text-main-mist/50";

type Status = "idle" | "sending" | "sent" | "error";

/** Vacancy-agnostic contact form. Posts to the backend `createContact`. */
export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setStatus("sending");
    try {
      const { data, error } = await createContact({ body: { name, email, message } });
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
      <div role="status" className="flex flex-col items-center rounded-xl border border-main-accent-t1/30 bg-main-card/40 p-10 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-main-accent-t1/15">
          <Check className="h-6 w-6 text-main-accent-t1" />
        </div>
        <h3 className="font-serif-display text-2xl text-white">Thanks{name ? `, ${name.split(" ")[0]}` : ""} — message received.</h3>
        <p className="mt-2 max-w-xs text-sm text-main-mist/60">We&apos;ll reply personally, usually within two business days.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-xl border border-white/10 bg-main-card/40 p-6">
      <div className="space-y-4">
        <label className="block">
          <span className={LABEL}>Your name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} required className={CONTROL} placeholder="Jane Doe" />
        </label>
        <label className="block">
          <span className={LABEL}>Email</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={CONTROL} placeholder="jane@example.com" />
        </label>
        <label className="block">
          <span className={LABEL}>Message</span>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} required rows={5} className={CONTROL} placeholder="How can we help?" />
        </label>
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
        {status === "sending" ? "Sending…" : <>Send message <Send className="h-4 w-4" /></>}
      </button>
    </form>
  );
}

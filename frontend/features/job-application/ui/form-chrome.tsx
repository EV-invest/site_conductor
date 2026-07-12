import { Send } from "lucide-react";

/** Letterhead heading above the application fields. */
export function FormHeader({ roleTitle }: { roleTitle?: string }) {
  return (
    <>
      <div className="mb-5 flex items-center justify-between">
        <span className="font-mono-tech text-[10px] uppercase tracking-[0.2em] text-main-accent-t1">
          Open application
        </span>
        <span className="font-mono-tech text-[10px] uppercase tracking-[0.2em] text-main-mist/40">
          {roleTitle ? `Role · ${roleTitle}` : "Form · EV-Hiring"}
        </span>
      </div>
      <h3 className="font-serif-display text-2xl text-white">
        Tell us where you fit.
      </h3>
      <p className="mb-5 mt-1 text-sm text-main-mist/55">
        A few lines is enough — we read every note.
      </p>
    </>
  );
}

/** Submit button + reply-window footnote. */
export function FormFooter({ sending }: { sending: boolean }) {
  return (
    <>
      <button
        type="submit"
        disabled={sending}
        aria-busy={sending}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-main-accent-t1 px-6 py-3 font-mono-tech text-xs uppercase tracking-widest text-main-black transition-colors hover:bg-main-accent-t1/90 disabled:opacity-60"
      >
        {sending ? (
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
    </>
  );
}

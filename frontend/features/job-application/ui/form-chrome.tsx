"use client";

import { Send } from "lucide-react";
import { useT } from "@evinvest/i18n/react";

/** Letterhead heading above the application fields. */
export function FormHeader({ roleTitle }: { roleTitle?: string }) {
  const t = useT();
  return (
    <>
      <div className="mb-5 flex items-center justify-between">
        <span className="font-mono-tech text-[10px] uppercase tracking-[0.2em] text-main-accent-t1">
          {t("apply.form.eyebrow")}
        </span>
        <span className="font-mono-tech text-[10px] uppercase tracking-[0.2em] text-main-mist/40">
          {roleTitle
            ? t("apply.form.roleTag", { title: roleTitle })
            : t("apply.form.formTag")}
        </span>
      </div>
      <h3 className="font-serif-display text-2xl text-white">
        {t("apply.form.heading")}
      </h3>
      <p className="mb-5 mt-1 text-sm text-main-mist/55">
        {t("apply.form.intro")}
      </p>
    </>
  );
}

/** Submit button + reply-window footnote. */
export function FormFooter({ sending }: { sending: boolean }) {
  const t = useT();
  return (
    <>
      <button
        type="submit"
        disabled={sending}
        aria-busy={sending}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-main-accent-t1 px-6 py-3 font-mono-tech text-xs uppercase tracking-widest text-main-black transition-colors hover:bg-main-accent-t1/90 disabled:opacity-60"
      >
        {sending ? (
          t("form.sending")
        ) : (
          <>
            {t("apply.form.submit")} <Send className="h-4 w-4" />
          </>
        )}
      </button>
      <p className="mt-4 text-center font-mono-tech text-[9px] uppercase tracking-[0.18em] text-main-mist/35">
        {t("apply.form.footnote")}
      </p>
    </>
  );
}

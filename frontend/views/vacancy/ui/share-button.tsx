"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";

export function ShareButton() {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(window.location.href);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          // clipboard unavailable — no-op
        }
      }}
      className="inline-flex items-center gap-2 rounded-md border border-white/15 px-5 py-3 font-mono-tech text-xs uppercase tracking-widest text-main-mist/80 transition-colors hover:border-white/30"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 text-main-accent-t1" /> Copied
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4" /> Share role
        </>
      )}
    </button>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { useT } from "@evinvest/i18n/react";
import { Kbd } from "./kbd";

const TITLE_ID = "publication-search-shortcuts-title";

// The key caps are literal keyboard legends, not prose — they do not translate.
const BINDINGS: ReadonlyArray<{ keys: string[]; descriptionKey: string }> = [
  { keys: ["S", "/"], descriptionKey: "publications.shortcut.focus" },
  { keys: ["↑", "↓"], descriptionKey: "publications.shortcut.move" },
  { keys: ["Enter"], descriptionKey: "publications.shortcut.open" },
  { keys: ["Esc"], descriptionKey: "publications.shortcut.clear" },
  { keys: ["?"], descriptionKey: "publications.shortcut.toggle" },
];

export interface ShortcutsDialogProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Keyboard help, on the native `<dialog>` so the browser owns modality, focus
 * containment and the Escape gesture. Also dismissible by backdrop click.
 */
export function ShortcutsDialog({ open, onClose }: ShortcutsDialogProps) {
  const t = useT();
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-labelledby={TITLE_ID}
      onClose={onClose}
      onClick={event => {
        if (event.target === ref.current) onClose();
      }}
      className="m-auto w-[min(28rem,calc(100vw-2rem))] border border-main-mist/10 bg-main-card p-0 text-main-mist backdrop:bg-main-black/70"
    >
      <div className="p-6">
        <h2
          id={TITLE_ID}
          className="font-mono-tech text-[10px] uppercase tracking-[0.2em] text-main-accent-t1"
        >
          {t("publications.shortcuts.title")}
        </h2>
        <dl className="mt-4 space-y-3">
          {BINDINGS.map(binding => (
            <div
              key={binding.descriptionKey}
              className="flex items-center justify-between gap-4"
            >
              <dt className="flex shrink-0 items-center gap-1.5">
                {binding.keys.map(key => (
                  <Kbd key={key}>{key}</Kbd>
                ))}
              </dt>
              <dd className="text-right text-sm text-main-mist/70">
                {t(binding.descriptionKey)}
              </dd>
            </div>
          ))}
        </dl>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full border border-main-mist/10 px-4 py-2 font-mono-tech text-[10px] uppercase tracking-[0.2em] text-main-mist/50 transition-colors hover:text-main-mist"
        >
          Close
        </button>
      </div>
    </dialog>
  );
}

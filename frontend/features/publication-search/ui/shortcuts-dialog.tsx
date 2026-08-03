"use client";

import { useEffect, useRef } from "react";
import { Kbd } from "./kbd";

const TITLE_ID = "publication-search-shortcuts-title";

const BINDINGS: ReadonlyArray<{ keys: string[]; description: string }> = [
  { keys: ["S", "/"], description: "Focus the search field" },
  { keys: ["↑", "↓"], description: "Move through the results" },
  { keys: ["Enter"], description: "Open the selected result" },
  { keys: ["Esc"], description: "Clear the search and unfocus" },
  { keys: ["?"], description: "Toggle this dialog" },
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
          Keyboard shortcuts
        </h2>
        <dl className="mt-4 space-y-3">
          {BINDINGS.map(binding => (
            <div
              key={binding.description}
              className="flex items-center justify-between gap-4"
            >
              <dt className="flex shrink-0 items-center gap-1.5">
                {binding.keys.map(key => (
                  <Kbd key={key}>{key}</Kbd>
                ))}
              </dt>
              <dd className="text-right text-sm text-main-mist/70">
                {binding.description}
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

"use client";

import type { MouseEvent, ReactNode } from "react";
import { useLocale } from "@evinvest/i18n/react";
import { useAnalytics } from "@/features/analytics";

/** Where in the shell the cabinet entry sits — the funnel's `location` prop. */
export type CabinetEntryLocation = "header" | "menu";

// The header runs no experiment (no key in shared/config/experiments.ts), so
// the schema's `variant` is the control arm until one is declared there.
const HEADER_VARIANT = "control";

// Client island around the cabinet-entry slot: the static signed-out pair
// (header-cta.tsx) and the account chip, a cabinet-served remote in light DOM
// whose markup this repo does not own — so the CTA event is hung on a
// delegated listener over the slot instead of on the links themselves. A link
// names itself through `data-cta`: the pair's `open_account` / `cabinet`, and
// since banking #392 the chip's own signed-out CTA carries `cabinet` too; the
// href match below is the fallback for a chip build that predates it. Nothing
// else counts: the signed-in chip links to the profile, and a returning
// user's clicks on their own name would inflate the entry funnel. The chip is
// deliberately not instrumented (it carries no analytics client), so this
// listener is the single counter; `data-cta-location` stays on the wrapper
// for it to read if that ever changes — at that point one side must stop
// firing, or the funnel double-counts.
export function CabinetEntryTracker({
  location,
  children,
}: {
  location: CabinetEntryLocation;
  children: ReactNode;
}) {
  const capture = useAnalytics();
  const locale = useLocale();

  // Capture phase: runs before the remote's own listeners (a stopPropagation
  // inside the chip cannot swallow it) and before the browser starts the hard
  // navigation the link triggers. Delivery across that navigation is posthog's
  // pagehide flush — see the report on send_instantly in the lib.
  const onClickCapture = (e: MouseEvent<HTMLDivElement>) => {
    const target = e.target instanceof Element ? e.target : null;
    const link = target?.closest<HTMLAnchorElement>(
      'a[data-cta], a[href*="/cabinet/login"]'
    );
    if (!link) return;
    capture("cta_clicked", {
      cta: link.dataset.cta ?? "cabinet",
      location,
      variant: HEADER_VARIANT,
      locale,
    });
  };

  return (
    <div
      className="contents"
      data-cta-location={location}
      onClickCapture={onClickCapture}
    >
      {children}
    </div>
  );
}

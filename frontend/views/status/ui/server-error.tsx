"use client";

import { statusButtonClass } from "./buttons";
import { StatusScreen } from "./status-screen";

/** 500 surface. `reset` is supplied by Next's error boundary; absent elsewhere. */
export function ServerErrorView({ reset }: { reset?: () => void }) {
  return (
    <StatusScreen
      accent="red"
      eyebrow="Server error"
      code="500"
      headlineLead="Our systems are "
      headlineAccent="recalibrating"
      subtext="Something broke on our end — not yours. We've been alerted and are restoring service. Please try again in a moment."
      links={[{ label: "Back to home", href: "/", variant: "outline", leadingArrow: true }]}
    >
      <button type="button" className={statusButtonClass("red", "filled")} onClick={() => (reset ? reset() : window.location.reload())}>
        Try again
      </button>
    </StatusScreen>
  );
}

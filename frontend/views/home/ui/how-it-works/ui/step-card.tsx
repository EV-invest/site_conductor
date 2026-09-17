import { Card, CardDescription, CardHeader, CardTitle } from "@evinvest/uikit";

import type { Step } from "../model/steps";

/**
 * One step of the sequence. The ordinal is display type — it is the visual
 * anchor of the card and the only thing that says "this is a sequence, not a
 * feature grid". `aria-hidden` because the `<ol>` already numbers it for
 * assistive tech; reading "zero one" before every title would be noise.
 */
export function StepCard({ step }: { step: Step }) {
  return (
    <Card className="h-full gap-4 rounded-xl border-ink/10 bg-card/50 py-8">
      <CardHeader className="gap-4 px-8">
        <span
          aria-hidden
          className="font-display text-5xl font-light leading-none text-primary-ink"
        >
          {step.ordinal}
        </span>
        <CardTitle className="font-serif-display text-xl font-light leading-snug text-white">
          {step.title}
        </CardTitle>
        <CardDescription className="text-base leading-relaxed font-light text-ink-mid sm:text-sm">
          {step.body}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

"use client";

import { Users, Globe } from "lucide-react";
import { notifyPlaceholder } from "@/shared/lib/utils";
import { PlaceholderCard } from "./cards";

/**
 * Client island — the two interactive "join us" / "LP network" CTA cards.
 * Isolated so the rest of the Team section (intro, image, member grid) stays a
 * Server Component. Rendered as a fragment so the cards sit as direct children
 * of the parent grid.
 */
export function TeamPlaceholders() {
  return (
    <>
      <PlaceholderCard
        icon={Users}
        iconClassName="text-main-accent-t1"
        title="Join Us"
        body="We are always looking for talented analysts and asset managers in Quy Nhon and Da Nang."
        cta="Hiring"
        onCtaClick={() => notifyPlaceholder("Hiring")}
        heading="Open Position"
        sub="Investment Analyst"
      />

      <PlaceholderCard
        icon={Globe}
        iconClassName="text-main-accent-t1"
        title="LP Partner Network"
        body="Talk to us about co-investing in Vietnam's coastal real estate."
        cta="IR Contacts"
        onCtaClick={() => notifyPlaceholder("IR Contacts")}
        heading="Investor Relations"
        sub="Investor Relations (IR)"
      />
    </>
  );
}

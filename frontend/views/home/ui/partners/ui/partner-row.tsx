import type { CSSProperties } from "react";

import { cn } from "@/shared/lib/utils";

import { PARTNERS, type Partner } from "../model/partners";

// The same CSS-mask trick as shared/ui/logo.tsx: paint `currentColor` through
// the SVG rather than rendering it. A dozen vendor logos arrive in a dozen brand
// colours; masking flattens them into one monochrome row in the section's token
// colour, so the bar reads as our typography instead of a ransom note.
function markStyle(src: string): CSSProperties {
  return {
    backgroundColor: "currentColor",
    maskImage: `url(${src})`,
    WebkitMaskImage: `url(${src})`,
    maskRepeat: "no-repeat",
    WebkitMaskRepeat: "no-repeat",
    maskPosition: "center",
    WebkitMaskPosition: "center",
    maskSize: "contain",
    WebkitMaskSize: "contain",
  };
}

function PartnerItem({ partner: { name, mark } }: { partner: Partner }) {
  // A wordmark spells the vendor itself, so it carries the accessible name and
  // suppresses the text label. Everything else — including an entry with no file
  // at all — shows the name as text, which is what makes the missing-asset case
  // ordinary rather than broken.
  const labelled = mark?.shape !== "wordmark";
  return (
    // px-5 rather than a flex `gap` on the row: each item owns its own trailing
    // space, so the two copies of the list are byte-identical boxes and the
    // -50% slide lands exactly on the seam. A `gap` would leave the loop half a
    // gap short and visibly hitch once per lap.
    <li className="flex shrink-0 items-center gap-2.5 px-5 text-main-mist/55">
      {mark && (
        <span
          role={labelled ? undefined : "img"}
          aria-label={labelled ? undefined : name}
          aria-hidden={labelled || undefined}
          style={markStyle(mark.src)}
          className={mark.shape === "glyph" ? "size-6" : "h-6 w-24"}
        />
      )}
      {labelled && (
        <span className="font-mono-tech text-xs tracking-[0.15em] whitespace-nowrap uppercase">
          {name}
        </span>
      )}
    </li>
  );
}

/**
 * One pass of the vendor list. The track renders it twice; `clone` marks the
 * copy that exists only to hide the seam, so a screen reader hears the stack
 * once and reduced motion can drop it.
 */
export function PartnerRow({ clone = false }: { clone?: boolean }) {
  return (
    <ul
      aria-hidden={clone || undefined}
      className={cn(
        "flex shrink-0 items-center",
        clone && "partners-marquee-clone"
      )}
    >
      {PARTNERS.map(partner => (
        <PartnerItem key={partner.name} partner={partner} />
      ))}
    </ul>
  );
}

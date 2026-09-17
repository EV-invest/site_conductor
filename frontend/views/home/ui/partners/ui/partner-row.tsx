import type { CSSProperties } from "react";

import { cn } from "@/shared/lib/utils";

import type { Partner } from "../model/partners";

// The same CSS-mask trick as shared/ui/logo.tsx: paint `currentColor` through
// the SVG rather than rendering it. The vendor logos arrive in their own brand
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

function PartnerItem({ partner: { name, role, mark } }: { partner: Partner }) {
  // A wordmark spells the vendor itself, so it carries the accessible name and
  // suppresses the text label. Everything else — including an entry with no file
  // at all — shows the name as text, which is what makes the missing-asset case
  // ordinary rather than broken.
  const labelled = mark?.shape !== "wordmark";
  return (
    // px-6 rather than a flex `gap` on the row: each item owns its own trailing
    // space, so every copy of the list is a byte-identical box and the slide
    // lands exactly on the seam. A `gap` would leave the loop half a gap short
    // and visibly hitch once per lap.
    //
    // Two lines per item — the vendor, then what it does for the client — so
    // the bar answers "who?" and "for what?" in one glance without the intro
    // having to spell every pairing out.
    <li className="flex shrink-0 flex-col gap-1 px-6 text-ink-soft">
      <span className="flex h-6 items-center gap-2.5">
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
          <span className="font-mono-tech text-xs tracking-widest whitespace-nowrap text-ink uppercase">
            {name}
          </span>
        )}
      </span>
      <span className="text-xs leading-none font-light whitespace-nowrap">
        {role}
      </span>
    </li>
  );
}

/**
 * One pass of the vendor list. The track renders it several times; `clone`
 * marks a copy that exists only to hide the seam, so a screen reader hears the
 * list once and reduced motion can drop it.
 */
export function PartnerRow({
  items,
  clone = false,
}: {
  items: readonly Partner[];
  clone?: boolean;
}) {
  return (
    <ul
      aria-hidden={clone || undefined}
      className={cn(
        "flex shrink-0 items-start",
        clone && "partners-marquee-clone"
      )}
    >
      {items.map(partner => (
        <PartnerItem key={partner.name} partner={partner} />
      ))}
    </ul>
  );
}

import React from "react";
import { cn } from "@/shared/lib/utils";

// The EV Investment lockup, pulled from the `ev_assets` repo into
// public/assets/logo.svg (gitignored, populated by the flake — never hand-edited).
// Rendered as a CSS mask so the monochrome mark follows the surrounding text
// color via `currentColor`, instead of the SVG's baked-in black.
//
// `withBackground` paints the clean brand field generated from OKLCH(0.256,0.1,260)
// behind the mark, keeping the chip consistent with the favicon.
interface LogoProps {
  className?: string;
  withBackground?: boolean;
}

const LOGO_BG = "oklch(0.256 0.1 260)";

const maskStyle: React.CSSProperties = {
  backgroundColor: "currentColor",
  maskImage: "url(/assets/logo.svg)",
  WebkitMaskImage: "url(/assets/logo.svg)",
  maskRepeat: "no-repeat",
  WebkitMaskRepeat: "no-repeat",
  maskPosition: "center",
  WebkitMaskPosition: "center",
  maskSize: "contain",
  WebkitMaskSize: "contain",
};

export function Logo({ className, withBackground = false }: LogoProps) {
  const mark = (
    <span
      role="img"
      aria-label="EV Investment"
      style={maskStyle}
      className={cn("inline-block", withBackground ? "w-3/5 h-3/5" : className)}
    />
  );

  if (!withBackground) return mark;

  return (
    <span
      className={cn("inline-flex items-center justify-center", className)}
      style={{ backgroundColor: LOGO_BG }}
    >
      {mark}
    </span>
  );
}

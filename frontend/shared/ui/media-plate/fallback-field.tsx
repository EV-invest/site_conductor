import { ImageOff } from "lucide-react";

/**
 * The layout must hold when a poster is missing or fails to decode: this fills
 * the stage with a flat surface field instead of letting the box collapse or
 * show a browser-broken-image glyph. Fills its positioned parent.
 */
export function FallbackField() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-main-surface">
      <ImageOff className="size-7 text-main-mist/25" strokeWidth={1.25} />
      <span className="font-mono-tech text-[10px] uppercase tracking-[0.22em] text-main-mist/30">
        Poster unavailable
      </span>
    </div>
  );
}

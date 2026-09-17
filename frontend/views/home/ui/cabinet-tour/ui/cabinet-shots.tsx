import Image, { getImageProps } from "next/image";
import type { Translate } from "@evinvest/i18n";

import { shots, type Shot } from "../model/shots";

const HOME_SIZES = "(min-width: 1024px) 56vw, 100vw";
const PAIR_SIZES = "(min-width: 1024px) 28vw, 50vw";

// The same card shell around every capture: a thin border and a card surface,
// so a screen of the dark cabinet reads as a framed object on the page rather
// than a hole in it.
const FRAME =
  "overflow-hidden rounded-xl border border-ink/10 bg-card shadow-2xl";

/**
 * Server Component — the screenshot composition: the home screen large, the
 * product catalogue and the profile as a pair beneath it.
 *
 * The home screen is art-directed, not scaled: the desktop frame shrunk to a
 * phone is 2880 pixels of UI in 390, so below `sm` a `<picture>` swaps in the
 * phone capture of the same screen. `getImageProps` keeps both candidates on
 * Next's image pipeline; `width`/`height` on each `<source>` reserve the right
 * box per branch, which a lone `<img>` with one ratio could not.
 *
 * The pair is hidden below `sm` (two 1440-wide screens in 170px each are
 * noise); being lazy and unrendered, they are never fetched there either.
 */
export function CabinetShots({ t }: { t: Translate }) {
  const { home, homeMobile, invest, profile } = shots(t);
  const desktop = getImageProps({ ...home, sizes: HOME_SIZES }).props;
  const mobile = getImageProps({ ...homeMobile, sizes: "100vw" }).props;

  return (
    <figure className="space-y-4">
      <div className={FRAME}>
        <picture>
          <source
            media="(min-width: 640px)"
            srcSet={desktop.srcSet}
            sizes={desktop.sizes}
            width={home.width}
            height={home.height}
          />
          {/* `alt` restated: the a11y lint cannot see through the spread. */}
          <img {...mobile} alt={homeMobile.alt} className="h-auto w-full" />
        </picture>
      </div>
      <div className="hidden grid-cols-2 gap-4 sm:grid">
        <Pair shot={invest} />
        <Pair shot={profile} />
      </div>
      <figcaption className="font-mono-tech text-xs tracking-widest text-ink-soft uppercase">
        {t(
          "home.cabinetTour.caption",
          "Screens from the live cabinet, demo data"
        )}
      </figcaption>
    </figure>
  );
}

function Pair({ shot }: { shot: Shot }) {
  return (
    <div className={FRAME}>
      <Image
        {...shot}
        alt={shot.alt}
        sizes={PAIR_SIZES}
        className="h-auto w-full"
      />
    </div>
  );
}

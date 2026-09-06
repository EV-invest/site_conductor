import { translator, type Locale } from "@evinvest/i18n";
import { Text, Tier } from "@/shared/ui/text";
import { SplitText } from "@/shared/ui/motion";
import { messagesFor } from "@/shared/config/i18n";
import { accented } from "@/shared/ui/accented";

/**
 * The four competences the intro sentence already names, pulled out as their own
 * row. The ids are catalogue key stems, and the order is deliberate — it is the
 * order the work happens in, not the order the partners rank in.
 *
 * There are four for a structural reason: this block sits directly above a 4-up
 * grid (portraits on the homepage, offices and roles on /team). A three-column
 * strip over a four-column grid reads as a row that failed to fill; matching the
 * count makes the two blocks share one set of column edges, which is the whole
 * job of a text band between two grids.
 */
const PILLARS = ["investment", "risk", "development", "execution"] as const;

/**
 * Shared leadership intro — a text-only band: eyebrow and display heading on the
 * left, the positioning sentence on the right, and the four competences beneath
 * on the grid the section below already uses. Single source for both the
 * homepage Team section and the /team page, so the copy never drifts.
 *
 * It carried a boardroom photograph until v0.2.62. The picture was doing no work
 * the sentence beside it wasn't already doing, and an image block above a grid of
 * portraits gave the section two competing focal points before the reader
 * reached a single face. Removing it also retired the `team_office` A/B test,
 * whose two variants were both photographs of an office.
 */
export function LeadershipIntro({ locale }: { locale: Locale }) {
  const t = translator(messagesFor(locale), locale);
  return (
    <div className="space-y-10">
      <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-12">
        <div className="space-y-5 lg:col-span-7">
          <span className="block font-mono-tech text-xs uppercase tracking-[0.3em] text-main-accent-t1">
            {t("team.leadership.eyebrow")}
          </span>
          <h2 className="font-serif-display text-3xl font-light leading-[1.15] text-white sm:text-4xl">
            <SplitText inView>
              {accented({ text: t("team.leadership.title") })}
            </SplitText>
          </h2>
        </div>
        <Tier tier="main">
          <Text className="lg:col-span-5">{t("team.leadership.intro")}</Text>
        </Tier>
      </div>

      <dl className="grid gap-x-8 gap-y-7 sm:grid-cols-2 lg:grid-cols-4">
        {PILLARS.map((id, i) => (
          // A <dl> may only contain <dt>/<dd> pairs, optionally wrapped one
          // pair to a <div> — so the ordinal lives inside the <dt> rather than
          // as a third sibling.
          <div key={id} className="border-t border-main-mist/10 pt-4">
            <dt>
              <span
                aria-hidden="true"
                className="block font-mono-tech text-[10px] tracking-[0.25em] text-main-accent-t1/70"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="mt-2 block font-serif-display text-lg text-white">
                {t(`team.leadership.pillar.${id}.title`)}
              </span>
            </dt>
            <dd className="mt-1.5 text-sm leading-relaxed text-main-mist/60">
              {t(`team.leadership.pillar.${id}.body`)}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

import Image from "next/image";
import { translator, type Locale } from "@evinvest/i18n";
import { Text, Tier } from "@/shared/ui/text";
import { SplitText } from "@/shared/ui/motion";
import { ASSETS } from "@/shared/config/assets";
import { messagesFor } from "@/shared/config/i18n";
import { Accented } from "@/shared/ui/accented";

// Shared leadership intro — heading + boardroom image. Single source for both
// the homepage Team section and the /team page, so the copy never drifts.
export function LeadershipIntro({
  locale,
  officeSrc,
}: {
  locale: Locale;
  officeSrc?: string;
}) {
  const t = translator(messagesFor(locale), locale);
  return (
    <div className="grid items-center gap-12 lg:grid-cols-2">
      <div className="space-y-5">
        <span className="block font-mono-tech text-xs uppercase tracking-[0.3em] text-main-accent-t1">
          {t("team.leadership.eyebrow")}
        </span>
        <h2 className="font-serif-display text-3xl font-light text-white sm:text-4xl">
          <SplitText inView>
            <Accented text={t("team.leadership.title")} />
          </SplitText>
        </h2>
        <Tier tier="main">
          <Text className="max-w-xl">{t("team.leadership.intro")}</Text>
        </Tier>
      </div>
      <div className="relative aspect-[16/9] overflow-hidden rounded-xl border border-main-mist/10 shadow-2xl">
        <Image
          src={officeSrc ?? ASSETS.office_interior}
          alt={t("team.leadership.photoAlt")}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-main-black/85 via-transparent to-transparent" />
        <div className="absolute inset-x-4 bottom-4 flex items-end justify-between">
          <div className="space-y-1">
            <span className="font-mono-tech text-[10px] uppercase tracking-wider text-main-accent-t1">
              {t("team.leadership.officeBadge")}
            </span>
            <h3 className="text-sm font-semibold text-white">
              {t("team.leadership.officeName")}
            </h3>
          </div>
          <span className="font-mono-tech text-[10px] text-main-mist/60">
            Q1 2026
          </span>
        </div>
      </div>
    </div>
  );
}

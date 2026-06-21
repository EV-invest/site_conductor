import Image from "next/image";
import { Container } from "@evinvest/uikit";
import { Text } from "@/shared/ui/text";
import { Reveal } from "@/shared/ui/reveal";
import { MobileCarousel } from "@/shared/ui/carousel";
import { ASSETS } from "@/shared/config/assets";
import { TEAM, MemberCard } from "@/entities/team";
import { TeamPlaceholders } from "../shared/placeholders";

/**
 * Variant A — with {@link Reveal} scroll-reveal animation on both blocks.
 * Server Component; the only client islands are {@link Reveal} (motion),
 * {@link MobileCarousel} (swipe) and {@link TeamPlaceholders} (CTA clicks).
 */
export function TeamA() {
  const cards = TEAM.map(member => (
    <MemberCard key={member.name} member={member} />
  ));

  return (
    <section
      id="team"
      className="py-24 relative border-t border-main-mist/10 bg-main-black"
    >
      <Container>
        <Reveal className="grid lg:grid-cols-12 gap-12 items-center mb-16">
          <div className="lg:col-span-6 space-y-4">
            <span className="text-xs font-mono-tech text-main-accent-t1 tracking-[0.3em] uppercase block">
              Management &amp; Expertise
            </span>
            <h2 className="text-3xl sm:text-5xl font-serif-display text-white font-light">
              Led by{" "}
              <span className="italic text-main-accent-t1 font-serif">
                Institutional Pioneers
              </span>
            </h2>
            <Text className="max-w-xl">
              The EV Investment team combines international experience in
              investment, risk management, and real estate development. TODO
            </Text>
          </div>
          <div className="lg:col-span-6">
            <div className="relative aspect-[16/9] rounded-xl overflow-hidden border border-main-mist/10 shadow-2xl">
              <Image
                src={ASSETS.office_interior}
                alt="EV Investment Boardroom"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover opacity-70"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-main-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono-tech text-main-accent-t1 uppercase tracking-wider">
                    Head Office
                  </span>
                  <h4 className="text-sm font-bold text-white">
                    EV Boardroom • Quy Nhon
                  </h4>
                </div>
                <Text asChild variant="secondary">
                  <span className="text-[10px] font-mono-tech">Q1 2026</span>
                </Text>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.05}>
          {/* Desktop: members and opportunities share one 4-up grid. */}
          <div className="hidden gap-8 sm:grid sm:grid-cols-2 lg:grid-cols-4">
            {cards}
            <TeamPlaceholders />
          </div>
          {/* Mobile: swipe the portraits, opportunities stacked beneath. */}
          <div className="space-y-8 sm:hidden">
            <MobileCarousel>{cards}</MobileCarousel>
            <div className="grid gap-8">
              <TeamPlaceholders />
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

import { Container } from "@evinvest/uikit";

import { Text } from "@/shared/ui/text";

/** Server Component — static key-metrics ribbon pinned to the bottom of Hero A. */
export function HeroAStats() {
  return (
    <div className="absolute bottom-0 left-0 w-full bg-main-black/80 border-t border-main-mist/10 py-6 backdrop-blur-sm z-20">
      <Container className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        <div>
          <Text
            variant="secondary"
            className="text-xs font-mono-tech uppercase tracking-widest mb-1"
          >
            Target IRR
          </Text>
          <p className="text-2xl sm:text-3xl font-serif-display text-main-accent-t3 font-bold">
            16.4% +
          </p>
        </div>
        <div>
          <Text
            variant="secondary"
            className="text-xs font-mono-tech uppercase tracking-widest mb-1"
          >
            Specialization
          </Text>
          <p className="text-2xl sm:text-3xl font-serif-display text-white font-bold">
            Rentals
          </p>
        </div>
        {/*<div>
          <Text
            variant="secondary"
            className="text-xs font-mono-tech uppercase tracking-widest mb-1"
          >
            AUM Under Advisory
          </Text>
          <p className="text-2xl sm:text-3xl font-serif-display text-white font-bold">
            $145M // gotta come back to this once we have more, and make it dynamic, based on total Bank's assets
          </p>
        </div>*/}
        <div>
          <Text
            variant="secondary"
            className="text-xs font-mono-tech uppercase tracking-widest mb-1"
          >
            Current Target City
          </Text>
          <p className="text-2xl sm:text-3xl font-serif-display text-main-accent-t1 font-bold">
            Quy Nhon
          </p>
        </div>
        <div>
          <Text
            variant="secondary"
            className="text-xs font-mono-tech uppercase tracking-widest mb-1"
          >
            Institutional Grade
          </Text>
          <p className="text-2xl sm:text-3xl font-serif-display text-main-accent-t4 font-bold">
            100%
          </p>
        </div>
      </Container>
    </div>
  );
}

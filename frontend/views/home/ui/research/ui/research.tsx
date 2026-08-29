"use client";

import { useState } from "react";
import { Container } from "@evinvest/uikit";
import { type Locale } from "@evinvest/i18n";
import { Reveal } from "@/shared/ui/motion";

import { ResearchHeading } from "./research-heading";
import { ResearchMenu } from "./research-menu";
import { ResearchPane } from "./research-pane";
import { ResearchTabs } from "./research-tabs";
import type { ResearchReport } from "./research-report";

/// The section is one client island end to end: every part of it either reads
/// or moves `active`, the index of the report being read. The tab strip
/// (mobile) and the card list (desktop) set it; the pane renders it.
export function ResearchA({
  reports,
  locale,
}: {
  reports: ResearchReport[];
  locale: Locale;
}) {
  const [active, setActive] = useState(0);
  const report = reports[active];

  // 4. RESEARCH SECTION — quiet navy base (same family as the page) with a
  //    faint dot-grid texture so it reads as its own "document / library" zone
  //    via depth rather than a stark color clash.
  return (
    <section
      id="research"
      className="research-texture py-24 text-main-mist relative overflow-hidden border-y border-main-mist/10"
    >
      <Container className="relative z-10">
        <ResearchHeading />

        {/* Research Carousel / Interactive List */}
        <Reveal
          delay={0.05}
          className="grid grid-cols-1 lg:grid-cols-3 gap-x-8 gap-y-0"
        >
          <ResearchTabs
            reports={reports}
            active={active}
            onSelect={setActive}
          />
          <ResearchMenu
            reports={reports}
            active={active}
            onSelect={setActive}
          />
          <ResearchPane report={report} active={active} locale={locale} />
        </Reveal>
      </Container>
    </section>
  );
}

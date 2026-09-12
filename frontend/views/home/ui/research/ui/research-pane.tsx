"use client";

import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { localePath, type Locale } from "@evinvest/i18n";
import { useT } from "@/shared/lib/t";

import { ResearchPaneFooter } from "./research-pane-footer";
import type { ResearchReport } from "./research-report";

/// Research Preview Content Pane — darker, opaque reading field so the dot
/// texture stops at the edge and the dim body text is easy to focus on.
/// `.research-panel` adds a soft warm "low sun" from the top-left.
///
/// The whole pane is one wide link to the open report; `active` is the index
/// that chose it, and keying the body on it cross-fades on every switch.
export function ResearchPane({
  report,
  active,
  locale,
}: {
  report: ResearchReport;
  active: number;
  locale: Locale;
}) {
  const t = useT();
  const router = useRouter();
  const goToReport = () =>
    router.push(localePath(locale, `/publications/${report.slug}`));

  return (
    <motion.div
      layout
      transition={{ layout: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }}
      role="link"
      tabIndex={0}
      aria-label={t("home.research.readAria", "Read full report: {title}", {
        title: report.paneTitle,
      })}
      onClick={goToReport}
      onKeyDown={e => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          goToReport();
        }
      }}
      className="research-panel lg:col-span-2 border border-ink/10 border-t-0 lg:border-t shadow-2xl shadow-background/60 p-8 sm:p-12 flex flex-col justify-between cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-debug/60"
    >
      <div>
        <div className="border-b border-ink/10 pb-6 mb-8">
          <span className="text-xs font-mono-tech text-accent-debug uppercase tracking-widest hidden lg:block mb-1">
            {report.cat}
          </span>
          <h3 className="text-2xl sm:text-3xl font-serif-display text-white font-bold">
            {report.paneTitle}
          </h3>
        </div>

        <AnimatePresence mode="popLayout">
          <motion.div
            key={active}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="prose prose-sm text-ink/70 font-light max-w-none space-y-6 leading-relaxed"
          >
            <p className="font-serif-display italic text-lg text-ink/90">
              &quot;{report.quote}&quot;
            </p>
            {report.body.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      <ResearchPaneFooter report={report} locale={locale} />
    </motion.div>
  );
}

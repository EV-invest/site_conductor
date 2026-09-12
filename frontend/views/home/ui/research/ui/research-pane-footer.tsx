"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowUpRight, BookOpen } from "lucide-react";
import { localePath, type Locale } from "@evinvest/i18n";
import { useT } from "@/shared/lib/t";

import { Text } from "@/shared/ui/text";
import { Logo } from "@/shared/ui/logo";
import { useAnalytics } from "@/features/analytics";

import type { ResearchReport } from "./research-report";

/// The pane's standing footer: who publishes the report on the left, the two
/// ways into it on the right. It swallows its own clicks so the buttons win
/// over the pane-wide navigation they sit inside.
export function ResearchPaneFooter({
  report,
  locale,
}: {
  report: ResearchReport;
  locale: Locale;
}) {
  const t = useT();
  const capture = useAnalytics();

  return (
    <motion.div
      layout="position"
      onClick={e => e.stopPropagation()}
      className="mt-8 pt-6 border-t border-ink/10 flex flex-row justify-between items-center gap-3"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 shrink-0 rounded-full bg-accent-debug/15 border border-accent-debug/30 hidden sm:flex items-center justify-center text-accent-debug">
          <Logo className="w-6 h-6" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-white truncate">
            {t("home.research.department", "EV Research Department")}
          </p>
          <Text
            variant="secondary"
            className="text-[10px] font-mono-tech truncate hidden sm:block"
          >
            {t(
              "home.research.leadAuthor",
              "Lead Author: Dr. Nguyen An, Chief Economist"
            )}
          </Text>
        </div>
      </div>
      <div className="flex shrink-0 gap-2">
        <Link
          href={localePath(locale, `/publications/${report.slug}`)}
          className="bg-transparent text-ink border border-ink/30 hover:border-accent-debug hover:text-accent-debug transition-all duration-300 rounded-none font-mono-tech text-[10px] sm:text-[11px] tracking-wider uppercase py-3 px-3 sm:px-4 inline-flex items-center"
          onClick={() =>
            capture("cta_clicked", {
              cta: "read_report",
              report: report.slug,
            })
          }
        >
          <span className="sm:hidden">{t("home.research.read", "Read")}</span>
          <span className="hidden sm:inline">
            {t("home.research.readFull", "Read Full Report")}
          </span>
          <BookOpen className="w-3.5 h-3.5 ml-1.5 sm:w-4 sm:h-4 sm:ml-2" />
        </Link>
        <a
          href={`/publications/${report.slug}.pdf`}
          download
          className="bg-accent-debug text-background hover:bg-ink hover:text-brand transition-all duration-300 rounded-none font-mono-tech text-[10px] sm:text-[11px] tracking-wider uppercase py-3 px-3 sm:px-4 inline-flex items-center"
          onClick={() =>
            capture("cta_clicked", {
              cta: "download_report",
              report: report.slug,
            })
          }
        >
          <span className="sm:hidden">
            {t("home.research.download", "Download")}
          </span>
          <span className="hidden sm:inline">
            {t("home.research.downloadFull", "Download Full Report")}
          </span>
          <ArrowUpRight className="w-3.5 h-3.5 ml-1.5 sm:w-4 sm:h-4 sm:ml-2" />
        </a>
      </div>
    </motion.div>
  );
}

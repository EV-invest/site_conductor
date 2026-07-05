"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { Button } from "@evinvest/uikit";
import { Text } from "@/shared/ui/text";
import { useExperimentEvent } from "@/features/ab-variant";

/**
 * Client island — the "Explore Assets" button and scroll hint.
 * Extracted from HeroA so the rest of the section stays a Server Component.
 *
 * `scrollHint` is resolved on the server (it reads a cookie-backed variant) and
 * passed in as a node — a client island can't call the server-only `getVariant`.
 */
export function HeroACta({ scrollHint }: { scrollHint: ReactNode }) {
  const track = useExperimentEvent();
  return (
    <>
      <div className="flex flex-row items-center gap-4">
        <Button
          className="bg-main-mist text-main-brand hover:bg-main-accent-t1 hover:text-main-black hover:scale-105 active:scale-95 transition-all duration-300 font-mono-tech text-xs tracking-widest uppercase px-8 py-6 rounded-none"
          onClick={() =>
            track("cta_clicked", { cta: "explore_assets" }, (fire) => {
              fire();
              document.getElementById("portfolio")?.scrollIntoView({ behavior: "smooth" });
            })
          }
        >
          Explore Assets <ArrowRight className="w-4 h-4 ml-2" />
        </Button>

        <Button
          asChild
          className="bg-transparent text-main-mist border border-main-mist/40 hover:bg-main-mist hover:text-main-brand hover:scale-105 active:scale-95 transition-all duration-300 font-mono-tech text-xs tracking-widest uppercase px-8 py-6 rounded-none"
          onClick={() => track("cta_clicked", { cta: "whitepaper" })}
        >
          <Link href="/whitepaper">
            Whitepaper <FileText className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </div>

      <Text asChild variant="secondary" className="mt-8">
        {scrollHint}
      </Text>
    </>
  );
}


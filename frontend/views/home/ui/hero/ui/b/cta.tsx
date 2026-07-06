"use client";

import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { Button } from "@evinvest/uikit";
import { useExperimentEvent } from "@/features/ab-variant";

/**
 * Client island — the "Explore Assets" button for Hero B.
 * Extracted so HeroB stays a Server Component.
 */
export function HeroBCta({ className }: { className?: string }) {
  const track = useExperimentEvent();
  return (
    <div className="flex flex-row items-center gap-4">
      <Button
        className={className}
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
        className="max-sm:hidden bg-transparent text-main-mist border border-main-mist/40 hover:bg-main-mist hover:text-main-brand hover:scale-105 active:scale-95 transition-all duration-300 font-mono-tech text-xs tracking-widest uppercase px-8 py-6 rounded-none"
        onClick={() => track("cta_clicked", { cta: "whitepaper" })}
      >
        <Link href="/whitepaper">
          Whitepaper <FileText className="w-4 h-4 ml-2" />
        </Link>
      </Button>
    </div>
  );
}

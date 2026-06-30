"use client";

import { useEffect } from "react";
import { Container } from "@evinvest/uikit";
import { Text, Tier } from "@/shared/ui/text";
import { Logo } from "@/shared/ui/logo";
import { notifyPlaceholder } from "@/shared/lib/utils";

const version = process.env.NEXT_PUBLIC_BUILD_VERSION ?? "unknown";
const commit = process.env.NEXT_PUBLIC_BUILD_COMMIT || version;

export function Footer() {
  useEffect(() => {
    console.log(`EV Investment — build ${version}`);
  }, []);

  // 6. FOOTER (Minimalist, structured)
  return (
    <footer className="bg-main-black border-t border-main-mist/10 py-16">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <Logo className="w-8 h-8 text-white" />
              <div className="flex flex-col">
                <span className="font-serif-display font-bold text-base tracking-wider text-white">
                  EV INVESTMENT
                </span>
                <span className="text-[8px] font-mono-tech tracking-[0.3em] text-main-accent-t1 uppercase">
                  Quy Nhon Fund
                </span>
              </div>
            </div>
            <Text
              variant="secondary"
              className="text-xs font-light max-w-sm leading-relaxed mb-6"
            >
              EV Investment is a registered real estate advisory and investment
              management fund specializing in premium coastal developments in
              Quy Nhon, Binh Dinh province, Vietnam.
            </Text>
            <div className="flex gap-4 text-xs font-mono-tech text-main-accent-t1">
              <a href="#hero" className="hover:underline">
                Privacy Policy
              </a>
              <span className="text-main-mist/20">|</span>
              <a href="#hero" className="hover:underline">
                Terms of Service
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-mono-tech text-xs text-white uppercase tracking-widest mb-6">
              Offices
            </h4>
            {/* Plain <p>, not <Text>: these address lines want a fixed text-xs and
                sit under no <Tier>, so an info <Text> would panic. Sizing stays local. */}
            <ul className="space-y-4 text-xs text-main-mist/70 font-light leading-relaxed">
              <li>
                <strong className="text-white block font-mono-tech text-[10px] uppercase tracking-wider mb-1">
                  Quy Nhon Head Office
                </strong>
                102 An Duong Vuong St, Nguyen Van Cu Ward, Quy Nhon City,
                Vietnam
              </li>
              <li>
                <strong className="text-white block font-mono-tech text-[10px] uppercase tracking-wider mb-1">
                  Ho Chi Minh Representative
                </strong>
                Deutsches Haus, 33 Le Duan Blvd, District 1, Ho Chi Minh City,
                Vietnam
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono-tech text-xs text-white uppercase tracking-widest mb-6">
              Newsletter
            </h4>
            <Tier tier="alt">
              <Text className="mb-4">
                Subscribe, to receive our macro reports
              </Text>
            </Tier>
            <div className="flex border border-main-mist/20">
              <input
                type="email"
                placeholder="Institutional Email"
                className="bg-transparent text-xs p-3 w-full focus:outline-none text-white"
              />
              <button
                className="bg-main-accent-t1 text-main-black px-4 font-mono-tech text-xs uppercase font-bold hover:bg-main-mist transition-colors"
                onClick={() => notifyPlaceholder("Newsletter Subscription")}
              >
                Join
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-main-mist/10 pt-8 text-[10px] font-mono-tech text-main-mist/40">
          <p>
            © 2026 EV Investment. All rights reserved.{" "}
            <a
              href={`https://github.com/EV-invest/landing/commit/${commit}`}
              className="text-main-mist/30"
            >
              {version}
            </a>
          </p>
        </div>
      </Container>
    </footer>
  );
}

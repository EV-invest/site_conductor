import { Suspense, type ReactNode } from "react";
import Script from "next/script";
import type { Locale } from "@evinvest/i18n";
import { I18nProvider } from "@evinvest/i18n/react";
import { messagesFor } from "@/shared/config/i18n";
import { fontInter, fontPlayfair } from "@/application/styles/fonts";
import { Providers } from "@/application/providers";
import { ErrorMonitoringProvider } from "@/features/error-monitoring";
import { PostHogProvider, PostHogPageView } from "@/features/analytics";
import { DevAbPanel } from "@/features/ab-variant";
import { config } from "@/config";
import shell from "@/public/shell/manifest.json";
import { spanEnterScript } from "@/scripts/span-enter";
import { Header } from "./header";
import { AccountChipRemote } from "./account-chip-remote";
import { Footer } from "./footer";
import { DarkReaderHydrationFilter } from "./dark-reader-hydration-filter";
import "@/application/styles/globals.css";
// Imported here rather than @import-ed from globals.css: Tailwind v4 owns the
// @import graph in that file and drops a plain relative sheet on the floor —
// silently, which cost an afternoon. As a module import it is Next's to bundle,
// and the same file is read verbatim by scripts/build-shell.mts for zones, so
// both hosts animate identical distances from one source.
import "@/application/styles/header-span.css";

const analyticsEndpoint = config.public.analyticsEndpoint;
const analyticsWebsiteId = config.public.analyticsWebsiteId;

// THE document. Every HTML response this app serves is this tree — the routed
// pages through `app/[locale]/layout.tsx`, and the unrouted 404 through
// `app/global-not-found.tsx`, which Next renders *instead of* the root layout
// and which therefore has to build its own `<html>`. Two callers, one shell:
// the reason the old bare-Next 404 existed at all is that the shell lived
// inline in the layout, where nothing outside the `[locale]` tree could reach
// it. Keep it that way — a page that renders chrome renders it from here.
export function SiteDocument({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  return (
    <html
      lang={locale}
      className={`dark ${fontInter.variable} ${fontPlayfair.variable}`}
      suppressHydrationWarning
    >
      {/* eslint-disable-next-line @next/next/no-head-element -- `next/head` is
          Pages-Router only; in the App Router a document renders its own <head>.
          The rule exempts files under app/ by path, and this one lives in
          application/ because two routes render it. */}
      <head>
        {/* Runs before the first paint — a deferred script would land after the
            paint it exists to precede, which is precisely why the bar used to
            snap instead of narrowing on the way back from a zone. Inline and
            un-deferred for that reason alone; it reads one sessionStorage key
            and sets one attribute. */}
        <script dangerouslySetInnerHTML={{ __html: spanEnterScript("site") }} />
      </head>
      <body>
        {/* The header's one behavior implementation — the same content-hashed
            script the zone proxy injects (BrandHeader ships no React state). */}
        <Script defer src={shell.js} strategy="afterInteractive" />
        <DarkReaderHydrationFilter />
        <ErrorMonitoringProvider>
          <I18nProvider locale={locale} messages={messagesFor(locale)}>
            <Providers>
              {/* capturePageview=false: PostHogPageView owns every $pageview
                (initial + App Router soft navigations), so the provider must not
                also fire the initial one. Suspense is required by
                useSearchParams. */}
              <PostHogProvider capturePageview={false}>
                <Suspense fallback={null}>
                  <PostHogPageView />
                </Suspense>
                <Header
                  locale={locale}
                  accountSlot={
                    <AccountChipRemote className="hidden items-center sm:flex" />
                  }
                  mobileAccountSlot={
                    <AccountChipRemote className="flex w-full" />
                  }
                />
                {children}
                <Footer />
              </PostHogProvider>
              <DevAbPanel />
            </Providers>
          </I18nProvider>
        </ErrorMonitoringProvider>
        {analyticsEndpoint && analyticsWebsiteId && (
          <Script
            defer
            src={`${analyticsEndpoint}/umami`}
            data-website-id={analyticsWebsiteId}
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}

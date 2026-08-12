import { Suspense, type ReactNode } from "react";
import Script from "next/script";
import { fontInter, fontPlayfair } from "@/application/styles/fonts";
import { Providers } from "@/application/providers";
import { ErrorMonitoringProvider } from "@/features/error-monitoring";
import { Header, AccountChipRemote, Footer } from "@/application/layout";
import { PostHogProvider, PostHogPageView } from "@/features/analytics";
import { DevAbPanel } from "@/features/ab-variant";
import { DarkReaderHydrationFilter } from "./dark-reader-hydration-filter";
import { config } from "@/config";
import shell from "@/public/shell/manifest.json";
import { spanEnterScript } from "@/scripts/span-enter";
import "@/application/styles/globals.css";
// Imported here rather than @import-ed from globals.css: Tailwind v4 owns the
// @import graph in that file and drops a plain relative sheet on the floor —
// silently, which cost an afternoon. As a module import it is Next's to bundle,
// and the same file is read verbatim by scripts/build-shell.mts for zones, so
// both hosts animate identical distances from one source.
import "@/application/styles/header-span.css";

export { metadata, viewport } from "@/application/metadata";

const analyticsEndpoint = config.public.analyticsEndpoint;
const analyticsWebsiteId = config.public.analyticsWebsiteId;

export default function RootLayout({ children }: { children: ReactNode }) {
  // The layout stays static so non-A/B routes (/team, /hiring, /contact, the
  // status pages) can statically render. A/B pages opt into dynamic rendering
  // where it's actually needed: each tested section awaits `getVariant`, which
  // reads the `ab_*` cookie (next/headers) and dynamizes that route on its own.
  return (
    <html
      lang="en"
      className={`dark ${fontInter.variable} ${fontPlayfair.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Runs before the first paint — a deferred script would land after the
            paint it exists to precede, which is precisely why the bar used to
            snap instead of narrowing on the way back from a zone. Inline and
            un-deferred for that reason alone; it reads one sessionStorage key
            and sets one attribute. */}
        <script
          dangerouslySetInnerHTML={{ __html: spanEnterScript("site") }}
        />
      </head>
      <body>
        {/* The header's one behavior implementation — the same content-hashed
            script the zone proxy injects (BrandHeader ships no React state). */}
        <Script defer src={shell.js} strategy="afterInteractive" />
        <DarkReaderHydrationFilter />
        <ErrorMonitoringProvider>
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

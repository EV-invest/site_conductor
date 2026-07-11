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
import shell from "@/shared/zone-shell.generated.json";
import "@/application/styles/globals.css";

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
      <body>
        {/* The header's one behavior implementation — the same content-hashed
            script the zone proxy injects (BrandHeader ships no React state). */}
        <script defer src={shell.js} />
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
                  <AccountChipRemote className="flex w-full justify-center" />
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

import { Suspense, type ReactNode } from "react";
import Script from "next/script";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@evinvest/i18n";
import { I18nProvider } from "@evinvest/i18n/react";
import { localeStaticParams } from "@evinvest/i18n/next";
import type { Metadata } from "next";
import { messagesFor, isIndexed } from "@/shared/config/i18n";
import { metadata as baseMetadata } from "@/application/metadata";
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

export { viewport } from "@/application/metadata";

// Locale-aware only in the one respect that matters at this level: whether the
// locale may be indexed. Per-URL hreflang lives in app/sitemap.ts, where the
// path is actually known — emitting it here would stamp every page with the same
// alternates, which is worse than none.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return baseMetadata;
  if (isIndexed(locale)) return baseMetadata;
  return {
    ...baseMetadata,
    robots: {
      index: false,
      follow: true,
      googleBot: { index: false, follow: true },
    },
  };
}

const analyticsEndpoint = config.public.analyticsEndpoint;
const analyticsWebsiteId = config.public.analyticsWebsiteId;

// Every locale is prerendered, the default one included: unprefixed URLs are
// *rewritten* onto /en/*, so that tree has to really exist even though no reader
// ever sees the prefix.
//
// Wrapped rather than assigned directly, because Next types
// generateStaticParams as taking a props object while the helper takes an
// optional locale list, and the two signatures are not assignable.
export const generateStaticParams = () => localeStaticParams();

// Load-bearing, not hygiene. `[locale]` matches any single segment, so `/team`
// is ambiguous with this layout's own page — with `dynamicParams = false` the
// segment is *declined* and the request falls through to the `fallback` rewrite
// that resolves it as English. Without it, `/team` renders the homepage with
// locale === "team". See docs/i18n-routing-spike.md.
export const dynamicParams = false;

export default async function RootLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  // The layout stays static so non-A/B routes (/team, /hiring, /contact, the
  // status pages) can statically render. A/B pages opt into dynamic rendering
  // where it's actually needed: each tested section awaits `getVariant`, which
  // reads the `ab_*` cookie (next/headers) and dynamizes that route on its own.
  return (
    <html
      lang={locale}
      className={`dark ${fontInter.variable} ${fontPlayfair.variable}`}
      suppressHydrationWarning
    >
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

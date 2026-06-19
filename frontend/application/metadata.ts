import type { Metadata, Viewport } from "next";
import { SITE } from "@/shared/config/site";

// Root metadata, re-exported by app/layout.tsx. Kept a STATIC export (no
// request data) so it streams correctly even though the layout's `await
// cookies()` makes routes dynamic — do NOT switch this to generateMetadata.
//
// Icons are intentionally absent: the app/icon.svg, app/favicon.ico and
// app/apple-icon.png file conventions own them (declaring `icons` here too would
// emit duplicate <link> tags). OG/Twitter images are likewise owned by the
// app/opengraph-image.* + app/twitter-image.* conventions, so no `images` here.
export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name}: ${SITE.tagline}`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  // Self-referencing canonical collapses UTM / analytics query-string duplicates
  // (PostHog/Umami params) onto the clean URL. Resolved against metadataBase.
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      // Lets Google show a large image/thumbnail and an untruncated snippet.
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: `${SITE.name}: ${SITE.tagline}`,
    description: SITE.description,
    url: "/",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name}: ${SITE.tagline}`,
    description: SITE.description,
    ...(SITE.twitterHandle
      ? { site: SITE.twitterHandle, creator: SITE.twitterHandle }
      : {}),
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: SITE.theme.black,
};

import type { Metadata, Viewport } from "next";
import { SITE } from "@/shared/config/site";
import { requiredInProd } from "@/shared/config/require-env";

// REA's backend origin, advertised to the MFE bundle via <meta name="rea-url">.
const reaUrl = requiredInProd(process.env.NEXT_PUBLIC_REA_URL, "NEXT_PUBLIC_REA_URL", "http://localhost:59079");

// Must stay a STATIC export (no request data) so it streams despite the layout's
// `await cookies()` making routes dynamic — do NOT switch to generateMetadata.
// Icons/OG images are owned by the app/icon.* + app/opengraph-image.* conventions.
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
  // Read by the real-estate MFE bundle (`rea_origin()`) for its REA backend calls.
  other: { "rea-url": reaUrl },
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

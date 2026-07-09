import { config } from "@/config";
import { proxyZone } from "@/shared/zone-proxy";

// Never prerender the proxy: a build-time GET would bake a 404/502.
export const dynamic = "force-dynamic";

export const GET = (request: Request) => {
  const url = new URL(request.url);
  // The Dioxus router strips its base_path from the pathname, so `/rea/` → `/`
  // matches and bare `/rea` → "" never can — canonicalise into the slash
  // (automatic stripping is off: skipTrailingSlashRedirect in next.config.ts).
  if (url.pathname === "/rea") {
    url.pathname = "/rea/";
    return Response.redirect(url, 307);
  }
  return proxyZone(request, config.reaZoneUrl);
};
export const HEAD = GET;
export const POST = (request: Request) => proxyZone(request, config.reaZoneUrl);

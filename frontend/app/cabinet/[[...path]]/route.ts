import { config } from "@/config";
import { proxyZone } from "@/shared/zone-proxy";

// Never prerender the proxy: a build-time GET would bake a 404/502.
export const dynamic = "force-dynamic";

// `noindex`: the cabinet's own HTML (its login screen included) carries no
// `meta robots` of its own — see the comment on the flag in zone-proxy.ts.
export const GET = (request: Request) =>
  proxyZone(request, config.cabinetZoneUrl, {
    headerZone: "cabinet",
    noindex: true,
  });
export const HEAD = GET;
export const POST = GET;

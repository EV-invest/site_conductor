import { config } from "@/config";
import { proxyZone } from "@/shared/zone-proxy";

// Never prerender the proxy: a build-time GET would bake a 404/502.
export const dynamic = "force-dynamic";

export const GET = (request: Request) => proxyZone(request, config.reaZoneUrl);
export const HEAD = GET;
export const POST = GET;

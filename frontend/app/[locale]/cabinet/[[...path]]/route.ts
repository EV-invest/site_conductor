import { config } from "@/config";
import { proxyZone } from "@/shared/zone-proxy";

// The locale-prefixed cabinet mount: /{locale}/cabinet/*.
//
// Identical to the unprefixed handler beside it, and deliberately so. `proxyZone`
// forwards `url.pathname` verbatim, and the cabinet now owns `/{locale}/cabinet/*`
// as its own route tree (banking#147) — so the path this receives is already the
// path the zone expects. Nothing is stripped, rewritten or re-prefixed here; the
// two mounts differ only in which URLs reach them.
//
// The unprefixed `app/cabinet/[[...path]]` stays: the cabinet's own proxy redirects
// a bare /cabinet/* into a locale, so old links and bookmarks keep resolving.
export const dynamic = "force-dynamic";

export const GET = (request: Request) =>
  proxyZone(request, config.cabinetZoneUrl, { headerZone: "cabinet" });
export const HEAD = GET;
export const POST = GET;

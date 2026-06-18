import { createAbMiddleware } from "@evinvest/experiments/next";
import { experiments } from "@/shared/config/experiments";

// Next 16: this file MUST be named `proxy.ts` with a named `proxy` export
// (renamed from `middleware`). Runtime is nodejs (edge unsupported) — fine,
// since `Math.random` bucketing and cookie writes need no edge APIs.
//
// `createAbMiddleware` assigns a sticky weighted `ab_<key>` cookie per
// experiment on first visit, writing it to BOTH the forwarded request (so this
// same render's `cookies()` reads it — no first-paint bias) and the response
// (so the browser persists it for 30 days).
export const proxy = createAbMiddleware(experiments);

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

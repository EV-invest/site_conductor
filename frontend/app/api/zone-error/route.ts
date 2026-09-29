// Where scripts/zone-guard.ts reports a zone page whose own assets failed to
// load. Thrown rather than answered: onRequestError (instrumentation.ts) carries
// it to Sentry with the request attached, and Next logs it to stdout.
// ponytail: unauthenticated and unthrottled, so a spammer spends Sentry quota; rate-limit if that happens
export async function POST(request: Request): Promise<Response> {
  const report = (await request.text()).slice(0, 2048);
  throw new Error(`zone assets failed to load: ${report}`);
}

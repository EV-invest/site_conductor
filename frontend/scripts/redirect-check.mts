// CI gate for the /en/* collapse (next.config.ts `redirects()`).
//
// The rule exists to give each page exactly one canonical URL, and it has one
// carve-out: the cabinet zone owns `/{locale}/cabinet/*` and bounces an
// unprefixed `/cabinet/*` into the reader's locale itself. Collapsing
// `/en/cabinet/*` back answers that bounce with the path it just left, so the
// two rules chase each other forever and the whole cabinet becomes unreachable
// for English readers — most of them.
//
// That failure cannot be caught by a type or a lint: the config compiles either
// way, and the loop only closes once both deployments are live. Nor is one URL
// enough to eyeball, because the carve-out has to be narrow in two directions —
// `/en/cabinets` is a different page and must still collapse, and the paths that
// do collapse must keep working at every depth. So the rule is asserted here
// against Next's own matcher, substituting the way Next substitutes.
import assert from "node:assert/strict";

// Next vendors this as CommonJS, so it has no named ESM exports.
import pathToRegexpModule from "next/dist/compiled/path-to-regexp/index.js";

const { pathToRegexp, compile } = pathToRegexpModule as unknown as {
  pathToRegexp: (src: string, keys: { name: string | number }[]) => RegExp;
  compile: (
    dest: string,
    opts?: { validate?: boolean }
  ) => (params: Record<string, unknown>) => string;
};

import nextConfig from "../next.config.ts";

type Redirect = { source: string; destination: string; permanent?: boolean };

const redirects = (await nextConfig.redirects!()) as Redirect[];
const collapse = redirects.filter(r => r.source.startsWith("/en/"));

assert.equal(collapse.length, 1, "expected exactly one /en/* collapse rule");
const rule = collapse[0]!;

/** What the rule does to a path: the destination, or null when it does not match. */
function apply(pathname: string): string | null {
  const keys: { name: string | number }[] = [];
  const re = pathToRegexp(rule.source, keys);
  const m = re.exec(pathname);
  if (!m) return null;
  const params = Object.fromEntries(keys.map((k, i) => [k.name, m[i + 1]]));
  // `validate: false` is what Next itself passes when it resolves a redirect.
  // With validation on, a multi-segment capture is rejected and this harness
  // reports a break that production does not have.
  return compile(rule.destination, { validate: false })(params);
}

const collapses: [string, string][] = [
  ["/en/team", "/team"],
  ["/en/contact", "/contact"],
  // Multi-segment: `:path*` binds one segment and throws here instead.
  ["/en/publications/whitepaper", "/publications/whitepaper"],
  ["/en/apps/rea/listings", "/apps/rea/listings"],
  // A sibling that merely starts with the carve-out's name is not the cabinet.
  ["/en/cabinets", "/cabinets"],
  ["/en/cabinets/list", "/cabinets/list"],
];

const passesThrough = [
  "/en/cabinet",
  "/en/cabinet/wallet",
  "/en/cabinet/admin/revenue",
  "/en/cabinet/login",
];

const failures: string[] = [];

for (const [from, to] of collapses) {
  let got: string | null | { error: string };
  try {
    got = apply(from);
  } catch (e) {
    got = { error: (e as Error).message };
  }
  if (typeof got !== "string" || got !== to) {
    failures.push(`${from} should collapse to ${to}, got ${JSON.stringify(got)}`);
  }
}

for (const from of passesThrough) {
  let got: string | null | { error: string };
  try {
    got = apply(from);
  } catch (e) {
    got = { error: (e as Error).message };
  }
  if (got !== null) {
    failures.push(`${from} must reach app/[locale]/cabinet, but the collapse claimed it (${JSON.stringify(got)})`);
  }
}

if (failures.length > 0) {
  console.error(`The /en/* collapse is wrong in ${failures.length} case(s):\n`);
  for (const f of failures) console.error(`  ${f}`);
  console.error(
    "\nIf the cabinet carve-out was removed, every English reader will loop between" +
      "\nthis redirect and the zone's own locale bounce. See the comment on the rule."
  );
  process.exit(1);
}

console.log(`/en/* collapse OK — ${collapses.length} collapsed, ${passesThrough.length} passed through to the cabinet.`);

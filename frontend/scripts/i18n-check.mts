// CI gate for the translation policy (rules 1.1 / 1.2 — see
// @evinvest/i18n/policy and docs/i18n-persisted-content.md for the DB half).
//
// The runtime already degrades safely: a drifted entry falls back to canonical
// English and the page is fine. That safety is exactly why this exists. A silent
// fallback is indistinguishable from a site that was never translated, so
// without a noisy second channel a locale can rot to zero coverage and nobody
// finds out until a reader mentions it.
//
// Fails only on *drift* — an entry whose English source moved, or whose
// structure no longer matches. Untranslated keys are reported, not failed: a
// locale is filled in over time, and blocking CI on an unfinished translation
// would just get the check disabled.
//
// It also gates the *generation* half: English is authored at the call site and
// `npm run i18n:extract` writes the catalogue back out of it, so a committed
// catalogue that no longer matches the code would hand `resolveCatalogue` a
// stale `en` to compare every translation against — drift reported against a
// source nothing renders.
import { readFileSync } from "node:fs";
import { auditCatalogues } from "@evinvest/i18n/policy";
import { catalogueReport } from "../shared/config/i18n";
import { catalogue, collect } from "./i18n-extract.mts";

const { entries, errors } = collect();
if (errors.length > 0) {
  console.error(`${errors.length} t() call site(s) the extractor cannot read:`);
  for (const error of errors) console.error(`  ${error}`);
  process.exit(1);
}

const generated = `${JSON.stringify(catalogue(entries), null, 2)}\n`;
const committed = readFileSync(
  new URL("../messages/en/common.json", import.meta.url),
  "utf8"
);
if (generated !== committed) {
  console.error(
    "messages/en/common.json is out of date with the code. Run `npm run i18n:extract`."
  );
  process.exit(1);
}

const resolved = catalogueReport();
const { report } = auditCatalogues(resolved, 0);
console.log(report);

const drifted = resolved.flatMap(c =>
  c.rejected.map(r => `${c.locale}/${r.key}: ${r.reason} — ${r.detail}`)
);

if (drifted.length > 0) {
  console.error(
    `\n${drifted.length} entr${drifted.length === 1 ? "y" : "ies"} rejected by policy:`
  );
  for (const line of drifted) console.error(`  ${line}`);
  console.error(
    "\nEnglish is being served for these. Retranslate and update the `en` field," +
      " or revert the English change."
  );
  process.exit(1);
}

console.log("\ni18n: no drift — every translation matches its English source");

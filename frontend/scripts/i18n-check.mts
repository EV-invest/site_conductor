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
import { auditCatalogues } from "@evinvest/i18n/policy";
import { catalogueReport } from "../shared/config/i18n";

const resolved = catalogueReport();
const { report } = auditCatalogues(resolved, 0);
console.log(report);

const drifted = resolved.flatMap(c =>
  c.rejected.map(r => `${c.locale}/${r.key}: ${r.reason} — ${r.detail}`)
);

if (drifted.length > 0) {
  console.error(`\n${drifted.length} entr${drifted.length === 1 ? "y" : "ies"} rejected by policy:`);
  for (const line of drifted) console.error(`  ${line}`);
  console.error(
    "\nEnglish is being served for these. Retranslate and update the `en` field," +
      " or revert the English change."
  );
  process.exit(1);
}

console.log("\ni18n: no drift — every translation matches its English source");

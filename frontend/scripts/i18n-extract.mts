// Generates `messages/en/common.json` out of the code, and prunes the four
// translated catalogues down to the keys the code still asks for.
//
// English is authored where it is rendered — `t("hero.title", "We build …")` —
// so the catalogue is a build artefact, not a source. That inverts the old
// failure mode: copy can no longer be edited in one place and read from
// another, and a key nothing calls stops being carried (and retranslated)
// forever. What it cannot do is notice a *deleted* call site, which is why the
// prune is unconditional rather than additive.
//
// Syntactic only — `ts.createSourceFile`, no program, no type checker. Every
// `t` in this app is the same `t`, so a name match is enough, and a full
// program would cost seconds per run for nothing.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const ROOT = new URL("..", import.meta.url).pathname;
// `scripts` is in here for build-shell.mts: the zone header fragment it renders
// is chrome a reader sees, so its strings belong in the catalogue like any
// other.
const SOURCE_DIRS = [
  "app",
  "views",
  "application",
  "shared",
  "features",
  "entities",
  "scripts",
];
const TRANSLATED = ["ru", "vi", "fr", "de"] as const;

export type Entry = { key: string; en: string; where: string };

function* sourceFiles(dir: string): Generator<string> {
  for (const item of readdirSync(join(ROOT, dir), { withFileTypes: true })) {
    const path = join(dir, item.name);
    if (item.isDirectory()) yield* sourceFiles(path);
    else if (/\.tsx?$/.test(item.name)) yield path;
  }
}

/** A string literal or a backtick string with no `${}` in it. */
function literal(node: ts.Node): string | null {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node))
    return node.text;
  return null;
}

/**
 * Every `t(key, en)` in the app, plus the failures. A call that cannot be read
 * statically is an error, not a skip: the point of inlining is that the copy is
 * visible where it renders, and a key assembled at runtime is neither visible
 * nor greppable.
 */
export function collect(): { entries: Entry[]; errors: string[] } {
  const entries: Entry[] = [];
  const errors: string[] = [];

  for (const dir of SOURCE_DIRS) {
    for (const path of sourceFiles(dir)) {
      const text = readFileSync(join(ROOT, path), "utf8");
      const source = ts.createSourceFile(
        path,
        text,
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TSX
      );
      const at = (node: ts.Node) => {
        const { line } = source.getLineAndCharacterOfPosition(node.getStart());
        return `${path}:${line + 1}`;
      };

      const visit = (node: ts.Node) => {
        if (
          ts.isCallExpression(node) &&
          ts.isIdentifier(node.expression) &&
          node.expression.text === "t"
        ) {
          const [keyArg, enArg] = node.arguments;
          const key = keyArg && literal(keyArg);
          const en = enArg && literal(enArg);
          if (key === null || key === undefined)
            errors.push(`${at(node)}: t() key is not a string literal`);
          else if (en === null || en === undefined)
            errors.push(
              `${at(node)}: t("${key}", …) has no literal English second argument`
            );
          else entries.push({ key, en, where: at(node) });
        }
        ts.forEachChild(node, visit);
      };
      visit(source);
    }
  }

  const seen = new Map<string, Entry>();
  for (const entry of entries) {
    const first = seen.get(entry.key);
    if (!first) seen.set(entry.key, entry);
    else if (first.en !== entry.en)
      errors.push(
        `${entry.where}: "${entry.key}" is also defined at ${first.where} with different English\n` +
          `    ${first.where}: ${JSON.stringify(first.en)}\n` +
          `    ${entry.where}: ${JSON.stringify(entry.en)}`
      );
  }

  return { entries: [...seen.values()], errors };
}

/** Sorted, so the generated file diffs by key rather than by call-site order. */
export function catalogue(entries: Entry[]): Record<string, string> {
  return Object.fromEntries(
    entries.map(e => [e.key, e.en] as const).sort(([a], [b]) => (a < b ? -1 : 1))
  );
}

const write = (path: string, value: unknown) =>
  writeFileSync(join(ROOT, path), `${JSON.stringify(value, null, 2)}\n`);

function main() {
  const { entries, errors } = collect();
  if (errors.length > 0) {
    console.error(`${errors.length} call site${errors.length === 1 ? "" : "s"} the extractor cannot read:\n`);
    for (const error of errors) console.error(`  ${error}`);
    console.error(
      "\nEvery t() takes a literal key and a literal English string. Restructure" +
        " the call — a runtime-assembled key has nowhere to put its copy."
    );
    process.exit(1);
  }

  const en = catalogue(entries);
  write("messages/en/common.json", en);
  console.log(`en: ${Object.keys(en).length} keys from ${entries.length} call sites`);

  for (const locale of TRANSLATED) {
    const path = `messages/${locale}/common.json`;
    const authored = JSON.parse(readFileSync(join(ROOT, path), "utf8")) as Record<
      string,
      unknown
    >;
    const kept = Object.fromEntries(
      Object.entries(authored).filter(([key]) => key in en)
    );
    const dropped = Object.keys(authored).length - Object.keys(kept).length;
    write(path, kept);
    console.log(
      `${locale}: ${Object.keys(kept).length} kept, ${dropped} orphan${dropped === 1 ? "" : "s"} dropped`
    );
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) main();

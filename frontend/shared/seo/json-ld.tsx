import { SITE } from "@/shared/config/site";

// App-agnostic JSON-LD primitives. The domain-specific graph (which reads team
// entities) is composed one layer up, in the home view — `shared` must not
// depend on `entities`.
export type JsonLdNode = Record<string, unknown>;

// Build a node @id from a fragment, e.g. ldId("#organization").
export const ldId = (hash: string) => `${SITE.url}/${hash}`;

// Resolve a path to an absolute URL (schema.org URLs must be absolute).
export const ldAbs = (src: string) =>
  src.startsWith("http") ? src : new URL(src, SITE.url).toString();

// Drop undefined / empty-string / empty-array values so optional owner facts
// (foundingDate, sameAs, phones…) never emit blank schema fields. Shallow by
// design — call it on each node as you build it.
export function ldCompact<T extends JsonLdNode>(node: T): T {
  const out: JsonLdNode = {};
  for (const [key, value] of Object.entries(node)) {
    if (value === undefined || value === null || value === "") continue;
    if (Array.isArray(value) && value.length === 0) continue;
    out[key] = value;
  }
  return out as T;
}

// Renders a JSON-LD graph as a <script>. Server Component (no "use client").
export function JsonLd({ data }: { data: JsonLdNode }) {
  return (
    <script
      type="application/ld+json"
      // Escape "<" so no string value can break out of the <script> element —
      // the documented Next.js JSON-LD pattern.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

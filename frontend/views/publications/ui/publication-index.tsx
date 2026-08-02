"use client";

import { useEffect, useMemo, useState } from "react";

import type { Publication } from "@/entities/publication";
import {
  ResultCount,
  SearchField,
  ShortcutsDialog,
  usePublicationSearch,
} from "@/features/publication-search";
import { cn } from "@/shared/lib/utils";

import { href } from "../model/presentation";
import { EntryCard } from "./entry-card";
import { FilterChips, type KindFilter } from "./filter-chips";
import { LeadEntry } from "./lead-entry";

// Module scope: these are `useMemo` deps inside the hook, so inline lambdas
// would re-score the whole catalogue on every render.
const getTitle = (p: Publication) => p.title;
const getText = (p: Publication) => `${p.dek} ${p.text ?? ""}`;
const getHref = (p: Publication) => href(p);

const RESULTS_ID = "publication-results";
const rowId = (slug: string) => `publication-${slug}`;

// Keyboard selection is a roving highlight, not a listbox: the cards stay
// ordinary links with several interactive descendants each, which `role=option`
// forbids. So the highlight is styling plus a live region — no ARIA widget
// semantics we cannot honour.
const SELECTED = "outline-2 outline-offset-8 outline-main-accent-t1/60";

export function PublicationIndex({
  publications,
}: {
  publications: Publication[];
}) {
  const [kind, setKind] = useState<KindFilter>("all");

  const counts = useMemo(
    () => ({
      all: publications.length,
      "field-note": publications.filter(p => p.kind === "field-note").length,
      research: publications.filter(p => p.kind === "research").length,
      whitepaper: publications.filter(p => p.kind === "whitepaper").length,
    }),
    [publications]
  );

  const items = useMemo(
    () =>
      kind === "all" ? publications : publications.filter(p => p.kind === kind),
    [kind, publications]
  );

  const {
    query,
    setQuery,
    results,
    selectedIndex,
    setSelectedIndex,
    helpOpen,
    setHelpOpen,
    inputRef,
  } = usePublicationSearch({ items, getTitle, getText, getHref });

  const selected = selectedIndex === null ? undefined : results[selectedIndex];

  // Arrowing past the fold would otherwise move an off-screen highlight.
  useEffect(() => {
    if (!selected) return;
    document
      .getElementById(rowId(selected.slug))
      ?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [selected]);

  // The lead only earns its extra room in the resting state: once someone is
  // searching or filtering, every result deserves equal weight.
  const showLead = query === "" && kind === "all" && results.length > 0;
  const grid = showLead ? results.slice(1) : results;
  const gridOffset = showLead ? 1 : 0;

  return (
    <>
      <SearchField
        value={query}
        onChange={setQuery}
        inputRef={inputRef}
        controlsId={RESULTS_ID}
      />
      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <FilterChips
          value={kind}
          onChange={next => {
            // The old index would point into a list that no longer exists.
            setSelectedIndex(null);
            setKind(next);
          }}
          counts={counts}
        />
        <ResultCount shown={results.length} total={items.length} />
      </div>

      {/* The highlight drives Enter, so it has to be announced to anyone who
          cannot see it. */}
      <p aria-live="polite" className="sr-only">
        {selected
          ? `${selected.title} — ${(selectedIndex ?? 0) + 1} of ${results.length}`
          : ""}
      </p>

      <div id={RESULTS_ID} className="mt-14">
        {results.length === 0 ? (
          <p className="font-light text-main-mist/55" role="status">
            {query === ""
              ? "Nothing published under this filter yet."
              : `Nothing matches “${query}”. Clear the search with Esc, or try a place name — most dispatches are titled after one.`}
          </p>
        ) : (
          <>
            {showLead && (
              <LeadEntry
                publication={results[0]}
                id={rowId(results[0].slug)}
                className={cn(selectedIndex === 0 && SELECTED)}
              />
            )}
            <div
              className={cn(
                "grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3",
                showLead && "mt-16"
              )}
            >
              {grid.map((publication, index) => (
                <EntryCard
                  key={publication.slug}
                  publication={publication}
                  id={rowId(publication.slug)}
                  className={cn(
                    selectedIndex === index + gridOffset && SELECTED
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <ShortcutsDialog open={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  );
}

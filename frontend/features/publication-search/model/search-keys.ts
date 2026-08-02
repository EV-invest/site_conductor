/**
 * The keyboard contract, ported from the Rust/Leptos original. Kept out of the
 * hook so the hook stays small and this stays directly testable: it is a plain
 * function over a `KeyboardEvent` plus an explicit context of current state and
 * callbacks — no React, no closures over signals.
 *
 * Order matters and mirrors the original:
 *   1. help dialog open → swallow everything, close on Escape / `?`
 *   2. arrows + Enter → handled whether or not the field has focus
 *   3. focus inside an editable → only Escape (clear + blur) is meaningful
 *   4. otherwise the bare shortcuts: `s` `S` `/` focus, `?` help, Escape deselect
 */
export interface SearchKeyContext {
  helpOpen: boolean;
  setHelpOpen: (open: boolean) => void;
  query: string;
  setQuery: (value: string) => void;
  selectedIndex: number | null;
  setSelectedIndex: (index: number | null) => void;
  /** Hrefs of the currently visible results, in display order. */
  hrefs: string[];
  input: HTMLInputElement | null;
  navigate: (href: string) => void;
  /** Pushes the query into the address bar (linkable search). */
  pushUrl: (query: string) => void;
}

function isEditing(): boolean {
  const active = document.activeElement;
  if (!(active instanceof HTMLElement)) return false;
  if (active.isContentEditable) return true;
  return ["INPUT", "TEXTAREA", "SELECT"].includes(active.tagName);
}

/** ArrowUp/ArrowDown: clamp at both ends, never wrap. No selection → index 0. */
function moveSelection(event: KeyboardEvent, ctx: SearchKeyContext): boolean {
  if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return false;
  event.preventDefault();
  const last = ctx.hrefs.length - 1;
  if (last < 0) return true;
  const current = ctx.selectedIndex;
  if (current === null) ctx.setSelectedIndex(0);
  else if (event.key === "ArrowDown")
    ctx.setSelectedIndex(Math.min(current + 1, last));
  else ctx.setSelectedIndex(Math.max(current - 1, 0));
  return true;
}

/** Enter: record the query in the URL, then open the selected (or only) result. */
function confirmSelection(
  event: KeyboardEvent,
  ctx: SearchKeyContext
): boolean {
  if (event.key !== "Enter") return false;
  event.preventDefault();
  ctx.pushUrl(ctx.query);
  const { hrefs, selectedIndex } = ctx;
  const href =
    hrefs.length === 1
      ? hrefs[0]
      : selectedIndex === null
        ? undefined
        : hrefs[selectedIndex];
  if (href) ctx.navigate(href);
  return true;
}

export function handleSearchKey(
  event: KeyboardEvent,
  ctx: SearchKeyContext
): void {
  if (ctx.helpOpen) {
    if (event.key === "Escape" || event.key === "?") {
      event.preventDefault();
      ctx.setHelpOpen(false);
    }
    return;
  }

  // Deliberate divergence from the original, which swallows Ctrl/Cmd+S and
  // friends: never steal a modified chord from the browser.
  if (event.metaKey || event.ctrlKey || event.altKey) return;

  if (moveSelection(event, ctx)) return;
  if (confirmSelection(event, ctx)) return;

  if (isEditing()) {
    if (event.key === "Escape") {
      event.preventDefault();
      ctx.setQuery("");
      ctx.setSelectedIndex(null);
      ctx.input?.blur();
    }
    return;
  }

  switch (event.key) {
    case "s":
    case "S":
    case "/":
      event.preventDefault();
      ctx.input?.focus();
      break;
    case "?":
      event.preventDefault();
      ctx.setHelpOpen(true);
      break;
    case "Escape":
      ctx.setSelectedIndex(null);
      break;
  }
}

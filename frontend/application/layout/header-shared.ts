// Types, timings and the chip's placement classes shared by the header's
// pieces. The types are used across header.tsx, the bar and the drawer; the two
// timings are the drawer's stagger and are read only by the drawer and the
// sign-out control it beats against. Nothing here may import beyond types:
// scripts/build-shell.mts reads it under plain node.
export interface HeaderNavItem {
  label: string;
  href: string;
}

/** Accessible names for the menu controls, translated by the caller. */
export interface HeaderMenuLabels {
  open: string;
  close: string;
  menu: string;
  /** The drawer's sign-out control — visible text, not just an accessible name. */
  signOut: string;
}

export const DEFAULT_MENU_LABELS: HeaderMenuLabels = {
  open: "Open menu",
  close: "Close menu",
  menu: "Site menu",
  signOut: "Sign out",
};

/** One signed-out entry into the cabinet: a hard cross-zone href and its label. */
export interface HeaderAuthLink {
  href: string;
  label: string;
}

/**
 * The static signed-out pair (issue #197): the primary opens an account, the
 * secondary is the plain "Cabinet" entry. Built per locale by `authLinks` in
 * nav-items.ts; rendered by header-cta.tsx on both hosts.
 */
export interface HeaderAuthLinks {
  openAccount: HeaderAuthLink;
  cabinet: HeaderAuthLink;
}

/** Milliseconds before the first drawer row moves — the panel leads, rows follow. */
export const MENU_ENTER_DELAY = 90;
/** Milliseconds between drawer rows. */
export const MENU_STEP = 45;

// The account chip is for the signed-in state only: it stays hidden until
// `data-session="authenticated"` lands on the header root — replayed from the
// last load by scripts/session-stamp.ts before the first paint, then confirmed
// or corrected by scripts/header-behavior.ts from /api/auth/session — while
// the static pair (header-cta.tsx) carries the signed-out state from the
// server HTML. The chip's own signed-out CTA never shows by design — it would
// double the pair's "Cabinet" — so exactly one of the two is visible once the
// session is known, and the pair alone before that. Shared by the conductor's
// slots (account-chip-remote.tsx) and the zone fragment
// (scripts/build-shell.mts) so the two hosts cannot drift.
export const CHIP_BAR_CLASS =
  "hidden items-center group-data-[session=authenticated]/header:sm:flex";
export const CHIP_MENU_CLASS =
  "hidden w-full group-data-[session=authenticated]/header:flex";

// What the host tells the chip (banking #392): its signed-out CTA is the
// secondary "Cabinet" affordance, so it opens the login page in its plain
// sign-in state, never the signup one the pair's primary uses. No
// `data-return-to` on the marketing site — there is no in-cabinet page the
// reader was headed to. Applies to both hosts and both placements.
export const CHIP_ATTRIBUTES = { "data-intent": "login" } as const;

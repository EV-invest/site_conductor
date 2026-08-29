// The mobile drawer's footer control. Its own file because it is the one
// element in the panel with a session behind it: the static markup has no
// session awareness (header-behavior.ts unhides it), and it enters on a
// different vector from the rows above it.
export function HeaderSignOut({ enterDelayMs }: { enterDelayMs: number }) {
  return (
    <div className="px-6 pb-10">
      <button
        type="button"
        data-action="signout"
        // Starts hidden — the static markup has no session awareness of its
        // own; header-behavior.ts reveals it only once /api/auth/session
        // confirms a signed-in principal.
        hidden
        // Sign-out lands on the same beat as the last nav row but from below,
        // not from the side: it is the one destructive control here, and the
        // different vector stops it reading as the final item in that list.
        // The beat is the drawer's to decide — it owns the rows — so it
        // arrives as a prop rather than being recomputed from a row count
        // this file cannot see. `hidden` is what gates it, so the delay only
        // ever plays for a signed-in visitor.
        style={{ transitionDelay: `${enterDelayMs}ms` }}
        className="flex translate-y-2 items-center gap-2 rounded-lg border border-destructive/20 px-3 py-2.5 text-sm font-medium text-destructive/70 opacity-0 transition-[opacity,translate,background-color] duration-300 ease-out outline-none hover:bg-destructive/10 focus-visible:ring-2 focus-visible:ring-ring group-data-[menu-open]/header:translate-y-0 group-data-[menu-open]/header:opacity-100"
      >
        <svg
          className="size-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        Sign out
      </button>
    </div>
  );
}

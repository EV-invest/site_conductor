import { Forbidden } from "@evinvest/uikit";

// Next's `forbidden.tsx` file convention (experimental `authInterrupts`):
// rendered with a 403 status whenever the `forbidden()` interrupt is invoked
// from a Server Component / Route Handler. It is NOT a browsable `/forbidden`
// route — it mirrors how `not-found.tsx` / `error.tsx` back the 404 / 500 views.
export default function ForbiddenPage() {
  return <Forbidden />;
}

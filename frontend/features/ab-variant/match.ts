import type { ReactNode } from "react";
import { select } from "@evinvest/experiments";

/**
 * Selects a React node by variant value — `@evinvest/experiments`'s `select`
 * specialised to `ReactNode`.
 *
 * Kept here (delegating to the package's zero-dep core, **not** to the package's
 * `"use client"` `react` entry) so it stays server-safe: section wrappers call
 * `match` during the server render. The package's own `match` lives in the
 * client bundle and would be a client reference if imported here.
 *
 * TypeScript enforces exhaustiveness: every variant declared for the key must
 * appear as a branch, so adding a variant without updating a `match` call is a
 * compile-time error.
 *
 * @param variant  - The active variant returned by {@link getVariant}.
 * @param branches - Map from every valid variant to a React node.
 * @returns The node corresponding to the active variant.
 *
 * @example
 * ```tsx
 * const variant = await getVariant("hero");
 * return match(variant, { a: <HeroA />, b: <HeroB /> });
 * ```
 */
export function match<V extends string>(
  variant: V,
  branches: { [K in V]: ReactNode },
): ReactNode {
  return select(variant, branches);
}

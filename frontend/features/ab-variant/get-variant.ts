import {
  experiments,
  type ExperimentKey,
  type Variant,
} from "@/shared/config/experiments";

/**
 * Returns the control (first) variant for an experiment.
 *
 * A/B is disabled for the production launch: this deliberately does **not** read
 * the `ab_<key>` cookie, so tested routes (the home hero) stay statically
 * rendered instead of paying the per-request dynamic-render cost on the VPS.
 * Re-enable live A/B by restoring the cookie read:
 * `return readVariant(experiments, key)` (import from `@evinvest/experiments/next`)
 * and feeding `experiments` back to `createAbMiddleware` in `proxy.ts`.
 *
 * Curried over the app's `experiments` config so sections call `getVariant("hero")`
 * and the **page** stays agnostic of A/B: `HomeView` just renders `<Hero />` etc.
 */
export function getVariant<K extends ExperimentKey>(
  key: K,
): Promise<Variant<K>> {
  return Promise.resolve(experiments[key].variants[0] as Variant<K>);
}

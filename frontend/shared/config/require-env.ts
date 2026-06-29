// Public env vars keep a localhost/placeholder default so `next dev` runs with
// no setup. Shipping that default in a production build is a silently-broken
// deploy, so fail the build instead: pass a STATIC `process.env.NEXT_PUBLIC_*`
// read (Next only inlines static member access) and an unset var throws here,
// before any artifact is produced. NODE_ENV is "production" during `next build`.
export function requiredInProd(value: string | undefined, name: string, devDefault: string): string {
  if (value) return value;
  if (process.env.NODE_ENV === "production") {
    throw new Error(`${name} is unset in a production build — refusing to ship the dev default ${devDefault}`);
  }
  return devDefault;
}

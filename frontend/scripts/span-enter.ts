// The pre-paint half of the header's spanning ⇄ narrowing motion.
//
// This has to run BEFORE the first paint, which is why it is a tiny string
// inlined into <head> by both hosts (app/layout.tsx and shared/zone-proxy.ts)
// rather than part of the deferred behavior script. A deferred script cannot do
// this job: by the time it runs the header has already painted at its natural
// position, and starting an offset after that is a jump, not an entrance. That
// is the whole reason the reverse (cabinet → site) direction did not exist
// before — the mechanism was wrong, not the idea.
//
// All it does is record which zone the last document belonged to and, if this
// document belongs to the other one, stamp the direction. The CSS in
// application/styles/header-span.css does the rest.
//
// Recording the zone rather than a one-way "came from cabinet" flag is what
// makes both directions fall out of one branch, and makes a reload a no-op for
// free: prev === cur, so nothing is stamped and the bar simply paints where it
// belongs.

/** Inline `<script>` body. `zone` is baked in per host at build time. */
export const spanEnterScript = (zone: "site" | "cabinet") =>
  `(()=>{try{var d=document.documentElement,k="ev_zone",p=sessionStorage.getItem(k),c=${JSON.stringify(zone)};sessionStorage.setItem(k,c);if(p&&p!==c&&!matchMedia("(prefers-reduced-motion: reduce)").matches){d.setAttribute("data-span-from",p)}}catch(e){}})()`;

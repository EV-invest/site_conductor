"use client";

// The one composition primitive the landing host knows. It loads a
// microfrontend's self-registering ESM bundle by URL, waits for its custom
// element to upgrade, then mounts <tag> inside a host node — mapping props to
// attributes and CustomEvents back to callbacks. Identical for JS (React, …) and
// Rust/WASM (Dioxus, Leptos) remotes.
//
// Remotes are client-only, so this is a "use client" island: server components
// above stream normally and show the fallback until the element is ready. The
// element is created imperatively (not via JSX) so it works for any framework's
// custom element without React's attribute/property quirks. Light DOM only —
// Tailwind v4 @property tokens break inside shadow roots.
//
// Trust boundary: scriptUrl is operator-controlled via the in-repo registry —
// treat registry edits as code. It executes third-party JS in the landing origin
// (no sandbox); gate it against an origin allowlist if the registry ever becomes
// user-/dynamically-sourced.

import { useEffect, useRef, type ReactNode } from "react";

import { useRemoteBundle } from "./use-remote-bundle";

export interface RemoteElementProps {
  /** Custom-element tag the remote registers, e.g. "mfe-calculator-yield". */
  tag: string;
  /** URL of the remote's self-registering ESM bundle. */
  scriptUrl: string;
  /** Attributes passed down to the element (objects are JSON-encoded). */
  attributes?: Record<string, string | number | boolean | object>;
  /** CustomEvent name → handler, e.g. { select: (detail) => ... }. Handler
   *  identities may change freely; the set of event *names* must be stable. */
  events?: Record<string, (detail: unknown) => void>;
  className?: string;
  /** Shown until the element is registered, and if the bundle fails to load. */
  fallback?: ReactNode;
}

// Stable empty defaults so the effects don't re-run on every render.
const NO_ATTRS: Record<string, string | number | boolean | object> = {};
const NO_EVENTS: Record<string, (detail: unknown) => void> = {};

export function RemoteElement({
  tag,
  scriptUrl,
  attributes = NO_ATTRS,
  events = NO_EVENTS,
  className,
  fallback = null,
}: RemoteElementProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const elementRef = useRef<HTMLElement | null>(null);
  const appliedAttrs = useRef<string[]>([]);
  const eventsRef = useRef(events);
  const attributesRef = useRef(attributes);
  const ready = useRemoteBundle(tag, scriptUrl);

  // Keep the latest handlers/attributes reachable by the effects below, so
  // changing their identity updates the live element instead of remounting it.
  useEffect(() => {
    eventsRef.current = events;
    attributesRef.current = attributes;
  });

  // Mount the element once defined; bind stable listeners that dispatch to the
  // current handlers via the ref. Keyed on [ready, tag] only — never on
  // attributes/events — so the remote survives prop churn.
  useEffect(() => {
    const host = hostRef.current;
    if (!host || !ready) return;

    const element = document.createElement(tag);
    elementRef.current = element;
    const bound = Object.keys(eventsRef.current).map((name): [string, EventListener] => {
      const listener: EventListener = (event) =>
        eventsRef.current[name]?.((event as CustomEvent).detail);
      element.addEventListener(name, listener);
      return [name, listener];
    });
    host.appendChild(element);

    return () => {
      bound.forEach(([name, listener]) => element.removeEventListener(name, listener));
      element.remove();
      elementRef.current = null;
      appliedAttrs.current = [];
    };
  }, [ready, tag]);

  // Sync attributes onto the live element (set current, drop removed) — keyed on
  // serialized values, so a new object with the same data is a no-op.
  const attrKey = JSON.stringify(attributes);
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    const attrs = attributesRef.current;
    for (const [name, value] of Object.entries(attrs)) {
      element.setAttribute(name, typeof value === "object" ? JSON.stringify(value) : String(value));
    }
    for (const name of appliedAttrs.current) {
      if (!(name in attrs)) element.removeAttribute(name);
    }
    appliedAttrs.current = Object.keys(attrs);
  }, [ready, tag, attrKey]);

  return (
    <div ref={hostRef} className={className}>
      {ready ? null : fallback}
    </div>
  );
}

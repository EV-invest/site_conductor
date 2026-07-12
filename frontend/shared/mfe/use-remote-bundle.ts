import { useEffect, useState } from "react";

import { containRemoteStyles } from "./contain-remote-styles";

// Loads a remote's ESM bundle once per tag and resolves true when its element
// upgrades; stays false while loading or on failure (caller shows its fallback).
export function useRemoteBundle(tag: string, scriptUrl: string): boolean {
  // Keyed by tag (not a boolean) so a reused instance switching remotes is
  // un-ready for the new tag immediately; a stale boolean would report the
  // previous remote's readiness and suppress the fallback.
  const [readyTag, setReadyTag] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    // Demote any CSS the remote injects into the `reamfe` layer so it can't
    // override host utilities (set up before the bundle runs, and on the
    // already-loaded path too, since the remote's stylesheet may persist).
    const stopContainment = containRemoteStyles(scriptUrl);
    const whenReady = () =>
      customElements
        .whenDefined(tag)
        .then(() => !cancelled && setReadyTag(tag))
        .catch(() => {});

    if (customElements.get(tag) || document.querySelector(`script[data-mfe="${tag}"]`)) {
      void whenReady();
      return () => {
        cancelled = true;
        stopContainment();
      };
    }

    const script = document.createElement("script");
    script.type = "module";
    script.src = scriptUrl;
    script.dataset.mfe = tag;
    // A failed script must leave the DOM or the guard above would treat it as
    // loaded for the rest of the session; deliberately not removed on cleanup
    // so a failure that fires after unmount still allows a later mount to retry.
    const onError = () => script.remove();
    const onLoad = () => {
      script.removeEventListener("error", onError);
      void whenReady();
    };
    script.addEventListener("load", onLoad);
    script.addEventListener("error", onError, { once: true });
    document.head.appendChild(script);
    return () => {
      cancelled = true;
      script.removeEventListener("load", onLoad);
      stopContainment();
    };
  }, [tag, scriptUrl]);

  return readyTag === tag;
}

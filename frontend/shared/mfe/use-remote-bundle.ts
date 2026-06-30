import { useEffect, useState } from "react";

import { containRemoteStyles } from "./contain-remote-styles";

// Loads a remote's ESM bundle once per tag and resolves true when its element
// upgrades; stays false while loading or on failure (caller shows its fallback).
export function useRemoteBundle(tag: string, scriptUrl: string): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // Demote any CSS the remote injects into the `reamfe` layer so it can't
    // override host utilities (set up before the bundle runs, and on the
    // already-loaded path too, since the remote's stylesheet may persist).
    const stopContainment = containRemoteStyles(scriptUrl);
    const whenReady = () =>
      customElements
        .whenDefined(tag)
        .then(() => !cancelled && setReady(true))
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
    const onLoad = () => void whenReady();
    script.addEventListener("load", onLoad);
    document.head.appendChild(script);
    return () => {
      cancelled = true;
      script.removeEventListener("load", onLoad);
      stopContainment();
    };
  }, [tag, scriptUrl]);

  return ready;
}

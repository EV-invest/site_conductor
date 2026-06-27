import { useEffect, useState } from "react";

import { containRemoteStyles } from "./contain-remote-styles";

// Loads a microfrontend's self-registering ESM bundle (once per tag), then waits
// for its custom element to upgrade. Returns false while loading and if the
// bundle fails (the caller shows its fallback). Client-only — registration runs
// in the browser.
export function useRemoteBundle(tag: string, scriptUrl: string): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // Demote any CSS the remote injects into the `reamfe` layer so it can't
    // override host utilities (set up before the bundle runs, and on the
    // already-loaded path too, since the remote's stylesheet may persist).
    const stopContainment = containRemoteStyles(new URL(scriptUrl, window.location.href).origin);
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

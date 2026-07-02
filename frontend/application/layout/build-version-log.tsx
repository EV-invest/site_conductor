"use client";

import { useEffect } from "react";

const version = process.env.NEXT_PUBLIC_BUILD_VERSION ?? "unknown";

// Client island (renders nothing): surfaces the running build in the browser
// console for deploy debugging without making the whole footer a client tree.
export function BuildVersionLog() {
  useEffect(() => {
    console.log(`EV Investment — build ${version}`);
  }, []);
  return null;
}

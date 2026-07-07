"use client";

import { useEffect } from "react";
import { config } from "@/config";

const version = config.public.buildVersion ?? "unknown";

// Client island (renders nothing): surfaces the running build in the browser
// console for deploy debugging without making the whole footer a client tree.
export function BuildVersionLog() {
  useEffect(() => {
    console.log(`EV Investment — build ${version}`);
  }, []);
  return null;
}

"use client";

import { useEffect } from "react";
import { reportError } from "@/features/error-monitoring";
import { ServerErrorView } from "@/views/status";

// Route-segment error boundary (500). `reset` re-renders the segment; we also
// forward the error to monitoring.
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    reportError(error);
  }, [error]);

  return <ServerErrorView reset={reset} />;
}

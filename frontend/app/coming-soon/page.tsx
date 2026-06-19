import type { Metadata } from "next";
import { ComingSoonView } from "@/views/status";

export const metadata: Metadata = {
  title: "Coming soon",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <ComingSoonView />;
}

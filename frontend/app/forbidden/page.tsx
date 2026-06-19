import type { Metadata } from "next";
import { ForbiddenView } from "@/views/status";

export const metadata: Metadata = {
  title: "Access forbidden",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <ForbiddenView />;
}

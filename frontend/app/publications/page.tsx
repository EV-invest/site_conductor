import type { Metadata } from "next";

import { PublicationsView } from "@/views/publications";

export const metadata: Metadata = {
  title: "Field Notes & Research",
  description:
    "EV Investment publications — field notes filmed in Quy Nhơn and institutional research on Vietnam coastal real estate.",
  alternates: { canonical: "/publications" },
};

export default function Page() {
  return <PublicationsView />;
}

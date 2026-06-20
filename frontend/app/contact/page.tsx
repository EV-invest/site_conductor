import type { Metadata } from "next";
import { ContactView } from "@/views/contact";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with EV Investment — hiring, investment, and our coastal developments in Quy Nhơn, Vietnam.",
  alternates: { canonical: "/contact" },
};

export default function Page() {
  return <ContactView />;
}

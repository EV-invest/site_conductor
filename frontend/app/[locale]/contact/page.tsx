import { ContactView } from "@/views/contact";
import { pageMetadata } from "@/shared/seo/page-metadata";

export const metadata = pageMetadata({
  title: "Contact",
  description:
    "Get in touch with EV Investment — hiring, investment, and our coastal developments in Quy Nhơn, Vietnam.",
  path: "/contact",
});

export default function Page() {
  return <ContactView />;
}

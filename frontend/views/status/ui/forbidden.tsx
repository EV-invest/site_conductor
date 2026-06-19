import { StatusScreen } from "./status-screen";

export function ForbiddenView() {
  return (
    <StatusScreen
      accent="gold"
      eyebrow="Access forbidden"
      code="403"
      headlineLead="This harbour is "
      headlineAccent="private"
      subtext="You don't have the credentials to view this page. If you believe you should, our team can open the right doors."
      links={[
        { label: "Back to home", href: "/", leadingArrow: true },
        { label: "Request access", href: "/#contact", variant: "outline" },
      ]}
    />
  );
}

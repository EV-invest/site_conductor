import { StatusScreen } from "./status-screen";

export function NotFoundView() {
  return (
    <StatusScreen
      accent="teal"
      eyebrow="Page not found"
      code="404"
      headlineLead="You've reached "
      headlineAccent="open water"
      subtext="The page you're looking for has drifted off our coastline — moved, renamed, or never charted. Let's get you back to shore."
      links={[
        { label: "Back to home", href: "/", leadingArrow: true },
        { label: "Contact the team", href: "/#contact", variant: "outline" },
      ]}
    />
  );
}

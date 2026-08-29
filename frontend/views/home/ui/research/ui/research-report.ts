// Report library. The list (left) and the reading pane (right) both render
// from this — switching a card just moves the index, and the pane cross-fades.
// The data comes from the publication catalogue via the server wrapper in
// ./research-section, so this section can no longer drift from /publications
// (it used to keep its own copy, including a slug that pointed at the wrong
// report).
export type ResearchReport = {
  cat: string;
  title: string;
  paneTitle: string;
  slug: string;
  date: string;
  quote: string;
  body: string[];
};

`site_conductor` is the public site and central shell for **EV Investment** — a
real-estate advisory and investment fund specializing in premium coastal
developments in Quy Nhon, Vietnam. It conducts the other EV web apps: each runs
as a standalone service on its own subdomain, and this repo composes them into
one client-facing surface (microfrontends — custom-element remotes and routed
zones). A Next.js 16 (App Router) front end in [`frontend/`](frontend) lives
alongside a [`backend/`](backend) placeholder to grow the site's own API into.
The shared design system ships as the published `@evinvest/uikit`.

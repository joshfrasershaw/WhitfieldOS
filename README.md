# WhitfieldOS

The business control tower for **Whitfield Plumbing, Heating & Cooling**.

V1 is a complete, responsive visual application foundation: a Dashboard and departmental workspaces including working offline tools. It opens directly into the Dashboard. All business areas are navigable; every metric and data workspace is an honest empty state.

**No live business data, integrations, authentication, AI, backend or database is included.** UI controls navigate, search pages, switch views and explore the empty workspace; they do not create operational records or change external systems.

## Local development

Requires Node.js **22.12+** (Node 24 LTS recommended) and npm.

```sh
npm ci
npm run dev
```

Open the local address printed by Vite. To bind to all interfaces in a development container, use `npm run dev -- --host 0.0.0.0`. No environment variables or credentials are required.

```sh
npm run lint          # TypeScript / React lint rules
npm test              # Navigation and future access-metadata contract tests
npm run build         # Type check and production build in dist/
npm run preview       # Serve the built application locally
npm run format:check  # Consistent source formatting
```

## Browser tests

```sh
npx playwright install --with-deps chromium
npm run test:e2e
```

The browser suite builds the app, serves its production output, checks every route at desktop (1440px), tablet (768px) and mobile (390px), tests key controls, detects console errors and page overflow, and checks representative workspaces with axe's WCAG A/AA rules. Automated accessibility checks supplement manual review; they do not constitute a certification.

If Chromium is already installed, use `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e`. Tests use two workers. Diagnostic traces and dashboard screenshots are written to the ignored `test-results/` directory.

## What is included

- Graphite sidebar with seven collapsible navigation groups, active states, desktop collapse and a mobile drawer.
- Shared design tokens, responsive white-surface workspaces, consistent empty states and Lucide icons.
- Dashboard: seven KPI cards, jobs, location preview, management attention, capacity, commercial pipeline, marketing, renewals, activity, quick access and assistant entry point.
- Purpose-specific diaries, triage flow, stock and record tables, pipeline boards, analytics frames, content calendar, directories and documents workspace.
- Searchable integration directory for nine planned system categories, all explicitly not connected.
- Global page search (button or Ctrl/Cmd+K), notification/profile dialogs, keyboard navigation, focus treatment, a skip link, not-found page and render error boundary.
- Cloudflare Workers static-asset configuration, Pages compatibility and CI validation.

## Architecture

```text
src/
  components/         Shared application layout, panels, headers and empty states
  config/             Central typed navigation and future role metadata
  features/           Dashboard and purpose-specific module workspaces
  styles.css          Tailwind integration, design tokens and responsive styling
  main.tsx            Router, app entry point and render error boundary
public/               Typographic favicon
tests/                Cross-viewport browser and accessibility tests
```

See [architecture and future integration points](docs/architecture.md) for extension guidance and design decisions.

## Cloudflare Workers staging

For a Git-connected Worker (the Cloudflare flow with a deploy command):

- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`
- Environment variable: `NODE_VERSION=24`
- Branch: `main`

`wrangler.jsonc` serves `dist` as static assets with native single-page-application routing. No Worker application code, API credentials in the app, or Cloudflare Vite plugin is needed. Keep the project name `whitfieldos` to match the existing Worker. Cloudflare supplies a free `workers.dev` staging URL.

Do not add a wildcard `/index.html` redirect: Workers rejects that rule as a redirect loop. The explicit Wrangler configuration also prevents automatic framework setup from rewriting the Vite project during deployment.

## Cloudflare Pages

This repository is suitable for a static Cloudflare Pages deployment:

- Build command: `npm run build`
- Output directory: `dist`
- Use Node 24 (or at least 22.12).
- Root directory: repository root.
- Pages provides its built-in SPA fallback because this app has no top-level `404.html`. No `_redirects` file is needed.

No deployment has been performed as part of V1. A production access-control decision is required before introducing real internal business information; V1 intentionally has no authentication.

## Scope and limitations

Nothing connects to ServiceM8, Xero, Google or any other provider. There are no customer/employee records, financial transactions, generated AI answers, or pretend live alerts. The location view is an abstract labelled preview, not a live map. Dashes mean unavailable data, not zero. Calendar navigation is local and does not schedule jobs. Settings describe planned capabilities rather than offering save buttons that cannot save.

The displayed date uses Europe/London. Calendar views use the browser's local calendar. Search indexes application pages only. View selections and navigation collapse state are session UI state and are not persisted. Future role metadata is not a security boundary.

## Phase 1.1: Offline management tools

- **Route Planner** (Operations): immediately enter UK job postcodes with no spreadsheet upload. WhitfieldOS bundles 2,856 historic CC0-licensed postcode *district* centroids; the engine chooses the exact shortest straight-line order for up to 10 jobs, then a fast heuristic for larger runs, with fixed start/end, manual reordering, copyable run and an optional Google Maps link. Importing more precise full-postcode coordinates is optional. **District positions are approximate, not driving distances or journey times.** No paid routing API, subscription, external lookup or automatic ServiceM8 diary import. Job details are not stored.
- **Product & Warranty Registration** (Operations): gas boilers, oil boilers, air-conditioning units and hot-water cylinders. Add verified manufacturer HTTPS registration links; open those websites externally. Links save **only in this browser**, with no warranty tracking.
- **Call Desk & Customer Handover** (Customers & Commercial): manually capture a caller's number, customer details and enquiry, copy a booking brief, open WhatsApp and open a separately supplied ServiceM8 profile URL. The fields are memory-only. **No automatic caller recognition or customer matching** is implemented, and you must not use this unauthenticated public prototype to store real customer records.
- Dashboard now contains both **Jobs Today** and **Expected Revenue Today** as distinct, unconnected KPIs.

See [delivery roadmap and security gates](docs/delivery-roadmap.md) for the remaining phases.

### Route planner's bundled data

Postcode district centroids derived from [gibbs/uk-postcodes](https://github.com/gibbs/uk-postcodes) (CC0-1.0). District-level coordinates are deliberately approximate and historically sourced; for job-level positioning an operator can load a WGS84 CSV of exact postcodes. The app does not contact this dataset's author or any geocoding API at runtime. The external Google Maps link is a normal browser directions URL, not an API key or billed service. Validate the actual driving route before allocating work.

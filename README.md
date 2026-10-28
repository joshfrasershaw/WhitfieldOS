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

- **Route Planner** (Operations): immediately enter UK job postcodes with no spreadsheet upload. WhitfieldOS bundles 2,856 historic CC0-licensed postcode _district_ centroids; the engine chooses the exact shortest straight-line order for up to 10 jobs, then a fast heuristic for larger runs, with fixed start/end, manual reordering, copyable run and an optional Google Maps link. Importing more precise full-postcode coordinates is optional. **District positions are approximate, not driving distances or journey times.** No paid routing API, subscription, external lookup or automatic ServiceM8 diary import. Job details are not stored.
- **Product & Warranty Registration** (Operations): four entire clickable cards, opening Worcester Bosch's installer guarantee portal for gas boilers, oil boilers and air conditioning, or Gledhill Installer Connect for cylinders, in a new browser tab. Links are built in; no registration form, API, browser-stored configuration or warranty tracking.
- **Call Desk & Customer Handover** (Customers & Commercial): manually capture a caller's number, customer details and enquiry, copy a booking brief, open WhatsApp and open a separately supplied ServiceM8 profile URL. The fields are memory-only. **No automatic caller recognition or customer matching** is implemented, and you must not use this unauthenticated public prototype to store real customer records.
- Dashboard now contains both **Jobs Today** and **Expected Revenue Today** as distinct, unconnected KPIs.

See [delivery roadmap and security gates](docs/delivery-roadmap.md) for the remaining phases.

### Route planner's bundled data

Postcode district centroids derived from [gibbs/uk-postcodes](https://github.com/gibbs/uk-postcodes) (CC0-1.0). District-level coordinates are deliberately approximate and historically sourced; for job-level positioning an operator can load a WGS84 CSV of exact postcodes. The app does not contact this dataset's author or any geocoding API at runtime. The external Google Maps link is a normal browser directions URL, not an API key or billed service. Validate the actual driving route before allocating work.

## Whitfield brand assets and design tokens

WhitfieldOS uses the official company assets supplied for this project, stored locally in `public/brand/` rather than fetched from WordPress at runtime:

- `/brand/whitfield-logo.png` — official Whitfield Plumbing, Heating & Cooling logo, used in the main navigation.
- `/brand/whitfield-van.jpg` — official van illustration, used for van-related imagery (currently the dashboard welcome area).

Primary brand grey is **#565c5d**; accent blue is **#71b0ff**. The application keeps a darker derived action-blue for accessible link text on light backgrounds. Theme tokens live in `src/styles.css`; application-specific logo, sidebar and illustration styling lives in `src/brand.css`. Avoid replacing company assets with generic vans or placeholder logos.

## Triage & Diagnostics — interactive call handling

The triage workspace is now a click-through, NHS 111-inspired call guide based on **curated** content from 67 Whitfield scripts supplied in October 2026. It covers boiler fuel and work type, leaks, toilets, taps, radiators/heating, showers, servicing, new installations, controls and specialist enquiries. Operators answer questions, follow paths into the corresponding script, capture customer details (session-only), and receive a recommended **next administrative action** (diagnostic, service, fixed-price indication, quote, WhatsApp photo request, George review or decline). Safety questions and a permanent gas-emergency shortcut take priority. Handovers remain available at every step, and a copyable summary can be used for an operator to book in ServiceM8, which remains disconnected.

This is **not** an automatic plumbing diagnosis, booking engine, or payment collector. The uploaded source DOCX/PDF and leads spreadsheets were **not** committed to GitHub. Only selected script-derived summaries/pricing are in the public frontend. Some prices conflict with later updates (gas service £179 in old script versus £249 latest; kitchen tap £290 in old script versus £390 mentioned later). These are explicitly flagged, not treated as verified live quotes. Old appointment dates are not presented as available appointments. No real customer details should be used until WhitfieldOS has authentication and data-protection controls.

### Triage WhatsApp photo request and question deduplication

On toilet-leak journeys, the exposed/concealed, leak source and constant/intermittent questions are each asked once as clickable options. An answer identifying a toilet base or waste-pipe leak now stops the ordinary diagnostic script immediately and shows the existing exclusion/referral outcome, rather than asking irrelevant follow-up questions.

**Request WhatsApp photos** opens an externally hosted WhatsApp click-to-chat URL addressed to the customer's number entered in Triage, using a pre-written company message with the Josh sign-off. When no number is available, the operator can enter the customer's WhatsApp number first. The user must send the message manually. The business account to send from is determined by the active WhatsApp/WhatsApp Business login; a `wa.me` link **cannot** force the sender identity. The Whitfield business account number is 01743 624123. No paid messaging API is used, and no customer telephone number is hardcoded or retained beyond the Triage browser tab.

### Shower call routing (October 2026)

Shower pathways now distinguish the **known equipment type** from the **work requested**. Selecting an electric shower does not ask whether it is electric/mixer, a white box, concealed, or rainfall; those are identification cues reserved for the explicit **Not sure what type of shower** route. Electric and rainfall routes instead ask whether the caller needs a fault reviewed, a like-for-like replacement, or a wholly new installation. A report of fluctuating hot/cold water is a **fault**, not proof that a £290 replacement is appropriate: fault outcomes refer for assessment, request photographs and show **no installation price**. The £290 electric and £490 rainfall script figures appear only on a selected replacement route, with suitability/current-price warnings. Generic mixer showers and unknown types receive photos/manager review rather than an invented fixed price. The initial categories are evidence, not medical-style diagnoses; operator should always confirm the actual product before booking.

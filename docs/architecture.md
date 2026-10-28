# Architecture and future development

## Frontend foundation

React and TypeScript run as a static Vite application. React Router owns client-side navigation. Tailwind CSS v4 is integrated through its Vite plugin; central CSS tokens and component classes keep the intentionally restrained visual system consistent. System sans-serif fonts avoid an external font request and provide an Inter-like professional fallback. The wordmark and favicon are typographic product identifiers, not official company branding assets.

`src/config/navigation.ts` is the source of truth for all 32 routes, navigation labels, icons, descriptions, workspace variants and future role visibility. The Dashboard is the index route; other entries map to a typed module workspace. Seven sidebar groups match the requested business hierarchy.

Shared `Panel`, `Empty`, `PageHeader` and `ConnectionNote` components establish layout and data-availability semantics. The workspace variants intentionally differ: scheduling grids, triage flow, table workspaces, stage boards, analytics frames, month calendar, tabbed directories, document categories, assistant workspace, settings and integrations.

Presentation is separated from navigation configuration. Replace a module's visual variant with a dedicated feature component as real workflows develop; preserve shared primitives. Do not add API or provider concerns to the layout component.

## Honest data states

V1 has no data fetches. A dash means unavailable; it never implies a business count or currency value. Empty pages have explicit data-source context. No fake records, revenue, staff locations or operational events are seeded. The abstract location frame is labelled as a preview without live data.

When introducing real data, model `loading`, `ready`, `empty`, `unconnected` and `error` states separately. Retain the existing neutral empty language and add retry/error states around actual requests. Avoid replacing unavailable information with synthetic figures.

## Future integration boundaries

Planned sources:

| Source                    | Intended features                                     |
| ------------------------- | ----------------------------------------------------- |
| ServiceM8                 | Dispatch, jobs, engineers, customers, service history |
| Xero                      | Finance summaries, invoices and receivables           |
| Google Ads                | Campaign spend and conversions                        |
| GA4                       | Website engagement and enquiry journeys               |
| Search Console            | Organic queries and indexing                          |
| Google Business Profile   | Local profile interactions                            |
| Meta                      | Social publishing and channel performance             |
| WordPress                 | Content and website workflows                         |
| WhatsApp / communications | Conversation context                                  |

Introduce typed domain adapters and feature-level data hooks behind these views. Provider authentication, token storage, webhooks, normalisation and authorisation must live in a secure server boundary selected in a future phase. Never ship provider secrets in Vite environment variables or browser bundles. The current directory is informational and performs no authentication or connection attempts.

## Roles and authentication

The navigation model includes owner, operations, administration, engineer and marketing roles. All modules are visible to all roles in V1. Future UI visibility can consume this metadata, but server-side authorisation must enforce access to real records. The current profile is a workspace placeholder, not a signed-in person. Authentication is deliberately absent.

## Interaction and accessibility

Semantic page headings, named icon controls, native dialogs, focus restoration, keyboard-operable tabs, reduced-motion support and a skip link support accessible navigation. The mobile drawer locks background interaction, traps keyboard focus and closes with Escape. Off-canvas navigation is hidden from keyboard and accessibility traversal when closed. Tables and scheduling grids scroll internally on narrow screens instead of expanding the page.

Global search is a local page directory, not a business-record search or an AI endpoint. Assistant prompts are illustrative and the input is explicitly disabled. Settings communicate the foundation's capabilities without implying configuration persistence.

## Deployment

Cloudflare Pages can serve `dist` as static assets. Pages uses its built-in SPA fallback; there is no top-level `404.html`. A Git-connected Worker can also serve the same static output using `wrangler.jsonc`, whose `assets.not_found_handling` enables native SPA routing. No wildcard redirect is shipped because Workers rejects it as a redirect loop. V1 has no Worker application code, paid services, database or server runtime dependency. Wrangler is a development/deployment tool only. Decide authentication and data protection before connecting sensitive business information.

## No-cost offline tools (phase 1.1)

The browser-only route planner includes 2,856 UK outward-postcode district centroids from the CC0-licensed gibbs/uk-postcodes dataset. It can optionally use a user-imported WGS84 full-postcode CSV for better accuracy. It calculates haversine distances; Held–Karp dynamic programming finds the exact shortest straight-line ordering for 10 or fewer jobs, with nearest-neighbour + 2-opt for larger runs. It does **not** know roads or traffic. No coordinates, job lists or caller details are uploaded or persisted. Google's publicly supported Maps URLs provide an external hand-off only and are not a Maps API integration. Source licensing and dataset maintenance are the user's responsibility.

The warranty registration hub has four static, outbound manufacturer portal links: Worcester Bosch (gas boilers, oil boilers, air conditioning) and Gledhill Installer Connect (cylinders). All four cards open the relevant site in a new tab. There are no customer records, tracked registrations, APIs, browser storage or credentials. Only add more manufacturer URLs after they are supplied and checked.

The Call Desk is a manually entered, ephemeral proof of concept. A real caller pop-up requires an Android call-screening/identification companion (subject to Android permissions, role requirements and device behaviour), a trusted paired channel and a backend that queries ServiceM8 with credentials stored server-side. Browser code cannot read an incoming mobile call. ServiceM8 customer profile URLs must be obtained from the real provider account, not guessed.

Do not persist personal data on a shared, unauthenticated static site. Live caller recognition and customer records remain blocked pending authentication, tenancy and data-protection decisions. Never put ServiceM8 tokens into Vite browser environment variables.

## WordPress admin shortcut

Under Growth → SEO & Website, an optional outbound WordPress login shortcut is saved in the current browser's localStorage after the operator supplies the URL. It is restricted to the Whitfield Plumbing domain and the WordPress login path. The actual concealed login URL must **never** be committed to this public repository, included in build assets, or printed in diagnostics. WhitfieldOS has no authentication yet; this shortcut is device-local convenience, not credential storage or secure secrets management. Staff on different devices must configure their own shortcut.

## Corporate branding

Brand-supplied image files are checked into `public/brand` and do not depend on fetching the WordPress installation when WhitfieldOS loads. `src/styles.css` defines Whitfield grey `#565c5d` and accent blue `#71b0ff`; `src/brand.css` supplies the associated responsive logo, sidebar and dashboard imagery styling. The official PNG has baked-in text and artwork, so preserve its aspect ratio and avoid overlaid typography. In collapsed navigation, crop the existing image to the left-hand emblem rather than invent a new logo. The van illustration is decorative branding only, **not** a real-time engineer location. Use these same brand assets throughout future van-related imagery.

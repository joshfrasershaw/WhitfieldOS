# WhitfieldOS — implementation roadmap and cost/security controls

## Delivery status

| Area                                                        | Present                                                                         | Real-data phase                                                               |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Management Dashboard                                        | Visual shell, Jobs Today and Expected Revenue Today empty KPIs                  | Read-only ServiceM8 job and price data, with job value semantics validated    |
| Dispatch diary / Triage / Inventory                         | Purpose-specific empty workspaces                                               | Source integrations, business rules and workflows                             |
| Route Planner                                               | Working, bundled postcode district lookup and pure-code optimiser; optional precise CSV; Maps link | Day-job import from ServiceM8, appointments, travel-time network if justified |
| Product & Warranty Registration                             | Outbound registration directory, configurable per browser                       | Centrally managed verified manufacturer URLs; no tracking by request          |
| Call Desk                                                   | Manual ephemeral enquiry, WhatsApp hand-off and supplied ServiceM8 record URL   | Secure caller ID feed and live customer lookup                                |
| Sales, service renewals, finance, growth, people, reporting | Consistent departmental shells                                                  | Read-only adapters and then carefully authorised write actions                |

## Non-negotiable architecture

1. ServiceM8 owns customers, jobs, quotes and scheduling; Xero owns financial transactions. Never introduce duplicate records needing manual upkeep.
2. Central authentication, server-side authorisation and secure provider credential storage **before** syncing real customers or commercial data. This GitHub repository is public, and the current prototype has no sign-in. Never put keys or exports of customer data in the repository or Vite assets.
3. Integrations should start read-only. Write-back, booking automation, sync conflict resolution, retries and audit logs require separate testing and authorisation.
4. Show disconnected/unknown rather than zero or invented values. Distinguish _scheduled_ revenue from _invoiced_ revenue and gross from net/VAT.
5. Maintain a no-new-recurring-spend target for prototypes, while recognising that hosting, ServiceM8 account features, data suppliers or future road-routing requirements may cost money. Do not promise a permanently free operating platform.

## Secure incoming caller identification: future proof of concept

- **Current:** Forwarded landline calls arrive on the user's Android mobile with the originating telephone number visible, but no matching name.
- **Proposed:** Explore a limited Android companion under available Android caller-ID/call-screening roles and permissions. Verify actual behaviour on the specific device, especially when numbers are forwarded. A regular website cannot read telephone call events.
- **Transport:** Companion sends a minimal incoming telephone number to an authenticated WhitfieldOS endpoint through a paired, authenticated channel; show expiry and pairing controls. Do not use public unprotected push endpoints.
- **Lookup:** Backend normalises UK mobile/landline formats, queries ServiceM8 server-to-server (if plan, permissions, data retrieval and rate limits allow) and returns only the matching profile needed on the authorised employee's session.
- **Result:** Existing-customer card on the operator's computer, with name, telephone, postcode, high-level history and genuine ServiceM8 deep link when available. New customer gets a fresh enquiry form, without creating a duplicate CRM.
- **Actions:** Customer booking is completed in ServiceM8; WhatsApp opens externally for a person to send. No automatic messaging or calls.
- **Compliance:** Permission, data minimisation, access revocation, retention, logging, identity and shared-device threats must be resolved before real customer data.

## Offline routing: limitations and next steps

The current algorithm uses historic, approximate postcode-district centroids (or optionally imported full-postcode latitude/longitude) as a proxy for distance, not the road network. It ignores one-way systems, traffic, route restrictions, service durations, time windows, engineer skills and workload balancing. This is useful to demonstrate route order but **not** evidence of travel time savings.

The built-in 2,856-district dataset is CC0-licensed and loaded within the app. An optional WGS84 full-postcode CSV can be supplied for better precision, loaded only in memory. An appropriate licence and accurate maintained data are required. A genuine road-routing graph can eventually be hosted on infrastructure under Whitfield's control, with deployment and maintenance costs assessed before use.

The Google Maps URL is an optional external directions link, not a Google Maps API call or in-app map renderer. Verify waypoint coverage and limits on the target device.

## Suggested next build order

1. Review V1 visual design and offline tools with realistic **non-personal** test data.
2. Confirm authentication and access policy, then implement a secure backend and role enforcement.
3. Establish approved ServiceM8 API credentials and read-only adapter, live customer matching and linked job screens.
4. Build/verify Android caller companion and secure desktop presence.
5. Validate dashboard KPI definitions and calculations before showing expected revenue.
6. Add operations, commercial, finance and growth connectors one by one, each with tests and an explicit cost assessment.

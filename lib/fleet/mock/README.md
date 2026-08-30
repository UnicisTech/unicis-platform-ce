# Fleet development mock

This module provides an opt-in, in-browser Fleet API mock for Asset Management UI development. It uses synthetic data only and does not require a running Fleet backend.

## Enable it

Add the following to `.env.local` and restart `npm run dev`:

```dotenv
NEXT_PUBLIC_FLEET_MODE=mock
NEXT_PUBLIC_FLEET_MOCK_SCENARIO=default
```

The mock is deliberately guarded by both conditions below:

```ts
process.env.NODE_ENV === 'development' &&
  process.env.NEXT_PUBLIC_FLEET_MODE === 'mock';
```

Consequently, setting `NEXT_PUBLIC_FLEET_MODE=mock` in a production build cannot enable the mock. When enabled, a fixed `Fleet mock · {scenario}` badge appears in the lower-right corner of Asset Management views.

## Scenarios

- `default`: representative queries, packs, tags, assets, distributed tasks, results, logs, configuration, identity, secret, analysis, and auditor statistics.
- `empty`: empty Fleet collections and zero-valued statistics; identity, team access, and the fake enrollment secret remain available.
- `unconfigured`: representative Fleet collections with no active Fleet access or enrollment secret; a bootstrap request activates access and creates the secret for reproducing the first-time setup flow. A full browser reload restores the initial unconfigured state, even if the previous bootstrap token is still stored in a browser cookie.
- `long-content`: intentionally long names, SQL, hostname, and tag values for responsive/mobile layout testing.
- `many-rows`: 80 queries and 65 assets for table, search, and pagination testing.
- `error`: every Fleet transport request returns a simulated HTTP 503 response.

An unset or unsupported scenario name resolves to `default`.

## Request handling and persistence

`lib/fleet/apiBase.ts` intercepts requests before Fleet base URL resolution. This covers both SWR GET requests (`fleetFetcher`) and direct create/update/delete calls to `fleetV1` or `fleetV2`.

Fleet-related platform calls (access verification, connection state, enrollment-secret access, bootstrap, and account checks) go through `platformFleet` in `lib/fleet/apiBase.ts`. It mirrors the `fleetV1`/`fleetV2` transport contract: hooks provide an endpoint and `RequestInit`, while the transport centrally selects real `fetch` or the platform mock handler. Hooks do not contain environment checks or mock fixtures.

The handler keeps an in-memory session state for the selected scenario. Queries, packs, tags, assets, and distributed queries support the mutations used by the current UI. A subsequent SWR `mutate` reads the updated collection. A full browser refresh may restore the original fixtures.

Unknown external Fleet and platform Fleet endpoints fail with a message that names the method and endpoint. They never fall back to a real backend while mock mode is enabled.

The platform's RBAC, team permissions, and subscription-plan checks are intentionally outside this mock and remain real. Only Fleet access verification, Fleet connection status, and the enrollment secret are replaced for development.

## Fixture safety

All fixture identities use the reserved `.example.test` domain. Tokens, enrollment secrets, node keys, certificates, and GUIDs contain explicit `MOCK` or `NOT_REAL` markers. Do not replace them with copied production or customer data.

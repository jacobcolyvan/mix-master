# AGENTS.md

## What this is

Mix Master is a client-side React SPA that uses the Spotify Web API to help DJs and producers build playlists with smooth key/tempo transitions (Circle of Fifths / Camelot Wheel). There is **no backend**: auth and Spotify requests happen in the browser. Deployed on Netlify (https://mix-master.netlify.app/).

Fetched media and minimal profile data are cached locally in **IndexedDB**, surviving reloads and browser restarts. Credentials are separate from the query cache. Logout clears the in-memory cache and attempts to delete persisted data; storage failures can prevent a disk wipe.

## Commands

Use **pnpm** and **Node 22** (`.nvmrc`).

- `pnpm dev` / `pnpm start` — Vite on **port 3000**; auto-opens the browser.
- `pnpm build` — production output in **`build/`**, not `dist/`.
- `pnpm preview` — serve the production build.
- `pnpm check` — ESLint, Prettier and TypeScript checks.
- `pnpm test` — Vitest; does not lint or type-check.
- `pnpm fix` — auto-fix lint and formatting.

Run **both `pnpm check` and `pnpm test`** before handing off code changes; neither covers the other.

Client-side environment variables must use the `VITE_` prefix and be read through `import.meta.env.VITE_*`.

## State ownership

- **TanStack Query** (`src/queries/`) owns Spotify server data, including the current-user profile. Pages consume query hooks and handle loading, offline and error states.
- **URL/history** owns submitted searches, selected resource IDs, applied recommendation tuning, and sorting/key notation for playlists, search/album tracks and recommendations (`useViewOptions`). Default options are omitted from URLs. Fresh resource destinations start with defaults; recommendation Apply and next-seed navigation carry both options. Keep drafts distinct from applied inputs; results belong to Query.
- **Auth** (`src/auth/`) owns credentials and signed-in status. Tokens stay in auth's memory and `spotify_auth` cookie, never Query. `src/hooks/useSignedIn.ts` adapts the auth subscription for React.
- **Local React state** owns search drafts in `Search.tsx`, transient UI state, startup readiness, and recommendation tuning drafts (`src/hooks/useRecommendationTuning.ts`). Search drafts initialize/reset from the URL at navigation boundaries; edits do not submit. Recommendation Apply pushes history; sort and notation changes replace history. Only presentation-only REPLACE navigation preserves recommendation drafts; all other navigation (including Back/Forward and seed changes) discards them.

Derive sorting/grouping from existing data rather than storing duplicate state. Shared pure collection transformations live in `src/utils/collectionTransforms.ts`.

## Important boundaries

### Spotify requests

All authenticated HTTP goes through **`spotifyApi`** from `src/auth/`. It handles token refresh on 401 and honours `Retry-After` on 429. Query retries are disabled deliberately: another retry layer would multiply requests against a rate-limited API.

Reuse `fetchOffsetPages` in `src/utils/spotifyFetch.ts` for pagination and `getTrackAndArtistFeatures` in `src/utils/requestUtils.ts` for track enrichment instead of duplicating those flows.

### Startup and persistence

`src/index.tsx` starts `src/queries/cacheLifecycle.ts` once, outside React rendering. The lifecycle coordinates auth bootstrap, cache restoration, persistence and logout. `App` observes its `ready` promise before mounting pages; React effects must not start another lifecycle.

After lifecycle readiness, a single signed-in `App` boundary fetches and validates the profile before mounting any signed-in page; the lifecycle does not fetch profiles.

`src/queries/persister.ts` owns IndexedDB storage and queued writes. Keep persistence shutdown coordinated through the lifecycle. Bump `CACHE_SCHEMA_VERSION` when persisted shapes or keys change, and keep persisted queries' `gcTime >= maxAge`. Search and recommendations are not persisted. Query-specific keys and cache timings live in `src/queries/`.

Cross-tab support is **logout notification only** through BroadcastChannel. It is not durable cross-tab invalidation, live cache synchronisation or account-per-tab isolation; suspended tabs and cross-tab write races are not fully covered.

Playlist tracks are cached by Spotify snapshot ID. Snapshots track membership/order, not enrichment changes; freshness must still be bounded separately.

### UI and domain conventions

Routing is **React Router v5** (`Switch`, `Redirect`, `useHistory`), not v6. Styling is **global SCSS**, imported in `src/index.tsx`, alongside MUI theming—not CSS modules.

Before changing key/tempo logic, read `src/utils/commonFunctions.ts` and `src/utils/commonVariables.ts`. They contain the Camelot/standard key mappings, relative major/minor logic and harmonic sorting.

## Code map

- `src/pages/` — route components and page-level data consumption.
- `src/components/` — feature composites.
- `src/atoms/` — UI primitives; `atoms/info/` contains About-page explainers.
- `src/queries/` — resource hooks, cache policy and persistence lifecycle.
- `src/auth/` — self-contained client-side Authorization Code + PKCE auth; no imports from components.
- `src/utils/` — music theory, collection transformations and Spotify data helpers.
- `src/types.ts` — shared application types.

Follow existing TypeScript conventions. ESLint enforces import sorting; use the configured lint/format tools rather than maintaining ordering manually.

## Testing

Vitest tests live in `src/__tests__/`; resource-hook suites are in `src/__tests__/queries/`, and shared helpers/fixtures in `src/__tests__/helpers/`.

Read `.agents/skills/testing/SKILL.md` before adding, changing or reviewing tests. It defines test boundaries, helper conventions and readability rules.

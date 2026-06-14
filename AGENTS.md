# AGENTS.md

## What this is

Mix Master is a client-side-only React SPA that uses the Spotify Web API to help DJs and producers build playlists with smooth key/tempo transitions (Circle of Fifths / Camelot Wheel). There is **no backend** — all Spotify auth and data fetching happen in the browser, so user data never leaves it. Deployed on Netlify (https://mix-master.netlify.app/).

## Commands

Package manager is **pnpm** (enforced via `preinstall: only-allow pnpm`); Node 22 (`.nvmrc`). Do not use npm/yarn.

- `pnpm dev` / `pnpm start` — Vite dev server on **port 3000** (auto-opens browser)
- `pnpm build` — production build to `build/` (not `dist/`)
- `pnpm preview` — serve the production build
- `pnpm check` — run lint + prettier + tsc together (the canonical pre-commit gate)
- `pnpm fix` — auto-fix lint + format
- `pnpm lint:check` / `pnpm lint:fix` — ESLint only
- `pnpm format:check` / `pnpm format:fix` — Prettier only
- `pnpm ts:check` — `tsc --noEmit` type-check only

There is **no test runner configured** — no `test` script, no test files. Don't assume Jest/Vitest is available.

## Environment variables

Vite env vars, **`VITE_`-prefixed** (read via `import.meta.env.VITE_*`):

- `VITE_SPOTIFY_CLIENT_ID`
- `VITE_SPOTIFY_CALLBACK_URI`

Copy `.env.example` to `.env` and fill in your Spotify client ID (register an app at https://developer.spotify.com).

## Architecture

### State: three Redux Toolkit slices (`src/slices/`)

State management is the spine of the app. All async Spotify work lives in **thunks at the bottom of each slice file**, not in components. Components dispatch thunks and read via typed selectors (`useAppSelector`/`useAppDispatch` from `src/app/store.ts`).

- **`settingsSlice`** — auth/token/user/key-display. Holds `spotifyToken`, `authError`, `username`, `keyDisplayOption` (`"camelot"` | standard). `handleAuthError` reconciles the Redux token against the `token` cookie.
- **`itemsSlice`** — all Spotify media objects (playlists, albums, tracks, recommendation seed). This is where the heavy data-fetching thunks live: `getUserPlaylists`, `getTracks`, `getAlbumTracks`, `getSearchResults`, `getRecommendedTracks`, plus `sortTracksByAudioFeatures`. Note the dual `tracks` + `sortedTracks` pattern: `tracks` is the canonical fetch result, `sortedTracks` is the display copy that sort operations mutate.
- **`controlsSlice`** — UI filter/search controls: current search queries, search results, `seedAttributes` (recommendation tuning), `sortTracksBy`, `matchRecsToSeedTrackKey`. Several thunks here are marked `// TODO: delete this` / "half works" (browser-history sync) — they are known-flaky; don't rely on them.

Cross-slice imports between `itemsSlice` and `controlsSlice` are normal here and intentionally circular-ish — both reference each other's actions/selectors.

### Auth flow (Implicit Grant, client-side)

`createSpotifyAuthHREF()` (`utils/requestUtils.ts`) builds the Spotify authorize URL with `response_type=token`. On redirect back, `pages/SpotifyAuth.tsx` parses the access token out of `location.hash`, stores it in Redux **and** a `token` cookie (`maxAge: 3600`). `App.tsx` gates all routes on token presence: no token → only `SpotifyAuth`; token + no error → app routes; `authError` → `TokenExpired`. A `401` from any request dispatches `handleAuthError()`.

### Spotify requests

All HTTP goes through `spotifyBaseRequest(token)` in `utils/requestUtils.ts` — an axios factory bound to `https://api.spotify.com/v1/` with the bearer header. Paginated fetches (playlists, playlist tracks) loop with `offset`/`limit=50`. `getTrackAndArtistFeatures()` is the key enrichment step: it batches `audio-features` + `artists` lookups and maps raw Spotify items into the app's `Track` shape via `createTrackObject()`.

### Music theory core (`utils/commonFunctions.ts` + `commonVariables.ts`)

This is the domain heart. `commonVariables.ts` holds the key dictionaries: `keyDict` (pitch class → note name), `camelotMajorKeyDict`/`camelotMinorKeyDict` (Spotify key index → Camelot wheel number). `getKeyInfoArray()` returns `[camelotKey, standardKey, inverseKey]` for a track — the `inverseKey` (relative major/minor, ±9/±3 semitones) is what drives the "also match the relative scale" recommendation logic in `getRecommendedTracks`. `camelotKeySort`/`standardKeySort` implement the actual harmonic ordering. When touching anything key/tempo-related, read these two files first.

### UI layering (atomic design)

- `src/pages/` — route components (`UserPlaylists`, `Playlist`, `Search`, `RecommendedTracks`, `About`, `SpotifyAuth`); they dispatch thunks and own data fetching
- `src/components/` — feature composites (`SearchOptions`, `SearchResults`, `Tracks`, `Albums`, `RecTweaks*`, `CurrentTrackRec`)
- `src/atoms/` — UI primitives (`Navbar`, `SortBy`, `KeySelect`, `TrackTooltip`, etc.) and `atoms/info/` (the About-page explainer sections)

Styling is **global SCSS**, imported once in `src/index.tsx` (`global.scss`, `pages.scss`, `components.scss`) — not CSS modules. MUI components are themed alongside. Routing is **React Router v5** (`Switch`/`Redirect`/`useHistory`), not v6 — keep to v5 APIs.

## Conventions

- ESLint flat config enforces: `eqeqeq` (always `===`), `no-var`, and `simple-import-sort` for both imports and exports — import order is auto-fixable, so run `pnpm fix` before committing. `@typescript-eslint/no-explicit-any` is **off** (lots of `any` on raw Spotify payloads is accepted). Unused vars allowed only when prefixed `_`.
- TypeScript is `strict` but with `noImplicitAny: false` and `noEmitOnError: true`.
- Shared types live in `src/types.ts`.

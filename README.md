# rocketflare.dev

The marketing site for [Rocketflare](https://github.com/rocketflare-dev/rocketflare) — a static
Astro site served from a Cloudflare Worker.

```bash
npm install
npm run dev       # http://localhost:4321 — Astro only; the /api route is not served
npm run build     # astro check && tsc (worker) && astro build → dist/
npm run deploy    # build, then wrangler deploy
npm run types     # regenerate worker-configuration.d.ts after editing wrangler.jsonc
npx wrangler dev  # the real Worker: static assets AND /api/github-stars
```

## Layout

| Path | What it is |
|---|---|
| `src/pages/index.astro` | the landing page |
| `src/pages/concepts/*` | one page per subsystem, plus the index |
| `src/data/concepts.ts` | the concept list — order, numbering, accent and icon |
| `src/data/site.ts` | every external URL in one place |
| `src/layouts/BaseLayout.astro` | the design tokens; **every colour on the site is a token here** |
| `src/layouts/ConceptLayout.astro` | the concept page shell (sidebar, prose styles, pager) |
| `src/components/SkyScene.astro` | the animated hero illustration |
| `worker/index.ts` | the only server code: `GET /api/github-stars`, everything else falls through to the static assets |

## Conventions

- **No raw hex outside `BaseLayout.astro`.** Colours are CSS custom properties, referenced with
  `var()` — including inside inline SVG, which is what lets the illustrations re-theme themselves.
  The one exception is `components/LogoMark.astro`, whose brand fills are fixed.
- Every animation is disabled under `prefers-reduced-motion`.
- No UI framework and no client-side JavaScript beyond the nav toggle, the theme toggle and one
  IntersectionObserver for scroll reveals.

## Adding a concept page

1. Add an entry to `src/data/concepts.ts` (slug, number, title, blurb, tone, icon, and the
   `docs/CONCEPTS.md` anchor — leave `anchor` empty if it has no counterpart there).
2. Create `src/pages/concepts/<slug>.astro` using `ConceptLayout`. Copy the shape of
   `tenancy.astro`: `<h2>` sections of prose, `<div class="why">` for a decision and its reasoning,
   `<div class="note">` for a caveat, and `source={[...]}` listing real repo paths.
3. `npm run build`.

## The star counter

`worker/index.ts` proxies the repository's stargazer count at
`GET /api/github-stars`, so the browser never calls GitHub directly — an
unauthenticated GitHub request is rate-limited per client IP, and one shared
call is kinder than one per visitor. The subrequest is edge-cached for an hour
through `cf.cacheTtl`, so there is **no KV namespace to provision** and a colo
makes at most 24 upstream calls a day. `components/GitHubStars.astro` renders a
plain "GitHub" link and upgrades it to a count when the fetch resolves, so the
nav never shifts and the link still works without JavaScript.

The Worker and the Astro site cannot share one TypeScript program (workerd types
versus DOM types), so the Worker has its own `worker/tsconfig.json` and its own
check — both run in `npm run build`.

## Deployment

Pushes to `main` deploy through `.github/workflows/deploy.yml`, which needs the repository secrets
`CLOUDFLARE_API_TOKEN` (Workers Scripts: Edit, plus Zone → DNS: Edit for the custom domains) and
`CLOUDFLARE_ACCOUNT_ID`. The Worker is `rocketflare-www` and serves `rocketflare.dev` and
`www.rocketflare.dev` as custom domains.

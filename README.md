# rocketflare.dev

The marketing site for [Rocketflare](https://github.com/rocketflare-dev/rocketflare) — a static
Astro site served from a Cloudflare Worker.

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # astro check && astro build → dist/
npm run deploy    # build, then wrangler deploy
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

## Deployment

Pushes to `main` deploy through `.github/workflows/deploy.yml`, which needs the repository secrets
`CLOUDFLARE_API_TOKEN` (Workers Scripts: Edit, plus Zone → DNS: Edit for the custom domains) and
`CLOUDFLARE_ACCOUNT_ID`. The Worker is `rocketflare-www` and serves `rocketflare.dev` and
`www.rocketflare.dev` as custom domains.

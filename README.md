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
| `src/pages/tour.astro` | the tour — thirteen stops, one `stops` array drives the index and the sections |
| `src/pages/who-is-it-for.astro` | three "what would I build" sketches, the not-for list, the two doors out |
| `src/pages/get-started.astro` | placeholder until its content lands |
| `src/pages/concepts/*` | one page per subsystem, plus the index |
| `src/pages/llms.txt.ts` | the llms.txt map, generated from the page and concept lists |
| `src/data/pages.ts` | the page registry — nav, footer, llms.txt and the sitemap filter read it |
| `src/data/concepts.ts` | the concept list — order, numbering, accent and icon |
| `src/data/site.ts` | every external URL in one place |
| `src/layouts/BaseLayout.astro` | the design tokens; **every colour on the site is a token here** |
| `src/layouts/ConceptLayout.astro` | the concept page shell (sidebar, prose styles, pager) |
| `src/components/SectionHead.astro` · `Callout` · `Steps` · `Terminal` · `AgentChat` · `Tabs` | content blocks |
| `src/components/Screenshot.astro` | a day + night screenshot pair in a browser frame |
| `src/components/Diagram{Stack,Cascade,Steps,Parity,Sequence}.astro` | inline-SVG diagrams that re-theme |
| `src/components/ConceptIcon.astro` | the icon set |
| `src/components/SkyScene.astro` | the animated hero illustration |
| `src/assets/screens/` | screenshot sources, `MANIFEST.md` (what each shows, kit commit, known noise) and `capture.sh` (the helpers a capture pass sources) |
| `public/install.sh` | a byte copy of the kit's `scripts/install.sh`, served at `/install.sh` for `curl -fsSL https://rocketflare.dev/install.sh \| bash` |
| `worker/index.ts` | the only server code: `GET /api/github-stars`, everything else falls through to the static assets |
| `CLAUDE.md` | the working rules — tokens, motion, scripts, the registry, screenshots, branches |

## Conventions

- **No raw hex outside `BaseLayout.astro`.** Colours are CSS custom properties, referenced with
  `var()` — including inside inline SVG, which is what lets the illustrations re-theme themselves.
  The one exception is `components/LogoMark.astro`, whose brand fills are fixed.
- Every animation is disabled under `prefers-reduced-motion`.
- No UI framework and no client bundles: a handful of small inline `<script>`s (nav toggle, theme
  toggle, scroll reveals, the copy button, tabs), each progressive — everything works without them.
- Fonts are self-hosted at build time by Astro's Fonts API (`astro.config.mjs`); nothing is fetched
  from Google at runtime.
- Top-level pages are listed in `src/data/pages.ts`; nav, footer and `llms.txt` are generated from it.

## Adding a concept page

1. Add an entry to `src/data/concepts.ts` (slug, number, title, blurb, tone, icon, and the
   `docs/CONCEPTS.md` anchor — leave `anchor` empty if it has no counterpart there).
2. Create `src/pages/concepts/<slug>.astro` using `ConceptLayout`. Copy the shape of
   `tenancy.astro`: `<h2>` sections of prose, `<div class="why">` for a decision and its reasoning,
   `<div class="note">` for a caveat, and `source={[...]}` listing real repo paths.
3. `npm run build`.

## Screenshots

Product screenshots are `src/assets/screens/<stem>.light.png` + `<stem>.dark.png` pairs rendered by
`components/Screenshot.astro` (AVIF/WebP at two widths, one picture per theme). Desktop captures
are 1440×900 at 2× (2880×1800), mobile ones (`m-*`) 390×844 at 3×.

[`src/assets/screens/MANIFEST.md`](src/assets/screens/MANIFEST.md) is the record: the kit commit
and date of the pass, the table of every stem with its route and the state on screen, the two
snippets a capture needs (the theme flip and the hide-dev-chrome step), and the list of known noise
in the current frames. `capture.sh` beside it holds the shell helpers the pass sources (`nav`,
`waitfor`, `hide`, `theme`, `shot`, `both`) over the `chrome-devtools` CLI daemon. Retaking a frame:

1. Run the kit's dev stack from a clean demo seed (`bash scripts/bootstrap.sh` in the kit — the
   manifest names the account and organisation the frames are signed in as).
2. Source `capture.sh`, navigate to the route in the manifest, wait for the text it lists, then
   `both <stem>` — light, then dark, hiding dev-only chrome before each shot.
3. Drop the two PNGs into `src/assets/screens/`, update the stem's row and the kit commit in the
   manifest, and check the frame in both themes on the page that uses it.

Which page uses what: the tour (`/tour/`) walks through `login`, `home`, `people`, `settings-ai`,
`chat`, `agents-run`, `documents`, `search`, `agents-research`, `analytics` + `analytics-explore`,
`usage`, and the phone pair `m-home` + `m-chat`; who-is-it-for reuses `people`, `agents-research`
and `analytics` cropped to their top. `admin-tenants` is not captured yet (the manifest says why),
so the tour's Admin stop is text only.

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
`www.rocketflare.dev` as custom domains. A pull request is built and uploaded as a preview version
(`wrangler versions upload --preview-alias pr-<n>`), and the preview URL is commented on the PR —
never commit to `main` directly.

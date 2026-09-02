# rocketflare.dev — the marketing site

A static Astro 6 site for [Rocketflare](https://github.com/rocketflare-dev/rocketflare), served from
one Cloudflare Worker (`worker/index.ts` adds a single `/api/github-stars` route). No UI framework,
no client bundles, one design-token file. `README.md` is the human overview; this file is the
working rules.

## Commands

```bash
npm install
npm run dev        # http://localhost:4321 (Astro only; /api is not served)
npm run build      # astro check → tsc (worker) → astro build → dist/   ← the gate, run before every push
npm run preview    # serve dist/ locally
npx wrangler dev   # the real Worker: assets + /api/github-stars
npm run types      # regenerate worker-configuration.d.ts after editing wrangler.jsonc
```

Verification after any change (all four must be clean):

```bash
npm run build
grep -rn '#[0-9a-fA-F]\{3,6\}\|rgba(' src --include='*.astro' | grep -v BaseLayout | grep -v LogoMark   # nothing
ls dist/_astro/*.js 2>/dev/null   # nothing — scripts are inlined, never bundled
grep -rl "fonts.googleapis" dist  # nothing — fonts are self-hosted by the Fonts API
```

## Layout

| Path | What it is |
|---|---|
| `astro.config.mjs` | `site`, the sitemap filter, the two font families (Fonts API) |
| `src/layouts/BaseLayout.astro` | **every token**, both themes, the global utilities, the theme boot script |
| `src/layouts/ConceptLayout.astro` | the concept page shell (sidebar, prose styles, pager) |
| `src/data/pages.ts` | the page registry — nav, footer, llms.txt and the sitemap filter read it |
| `src/data/concepts.ts` | the concept list; `CONCEPT_COUNT`, `numberWord()` |
| `src/data/site.ts` | every external URL |
| `src/pages/index.astro` | the landing page |
| `src/pages/{tour,get-started,who-is-it-for}.astro` | placeholders until their content lands (`ready: false`) |
| `src/pages/concepts/*` | one page per subsystem, plus the index |
| `src/pages/kitchen.astro` | every component with sample props; `noindex`; **delete before merge** |
| `src/pages/llms.txt.ts` | the llms.txt map, generated from `pages.ts` + `concepts.ts` |
| `src/components/SectionHead.astro` | eyebrow / h2 / lede, optional audience tag |
| `src/components/Callout.astro` | boxed aside with an icon chip (`tone`, `title`, `icon` slot) |
| `src/components/Steps.astro` | numbered or dotted steps on a timeline; row ≥ 760px |
| `src/components/Terminal.astro` | command transcript with a JS-only copy button |
| `src/components/AgentChat.astro` | you/agent bubbles, optional ✔ checklist, CSS-only stagger |
| `src/components/Tabs.astro` | tab strip over named slots; stacked without JS |
| `src/components/Screenshot.astro` | day + night `<Picture>` pair in a browser frame |
| `src/components/Diagram{Stack,Cascade,Steps,Parity,Sequence}.astro` | inline-SVG diagrams |
| `src/components/ConceptIcon.astro` | the icon set (add a glyph before using a new name) |
| `src/components/{SkyScene,CloudDivider,LogoMark,Nav,Footer,GitHubStars}.astro` | the shell |
| `src/assets/screens/` | screenshot sources + `MANIFEST.md` |
| `public/` | `favicon.svg` (3-fill mark) + PNGs, `logo.svg` (full mark), `og-image.png`, `site.webmanifest` |
| `worker/index.ts` | the only server code |
| `.github/workflows/deploy.yml` | main → deploy; PR → build + preview version |

## Rules

### Tokens only
Every colour is a custom property declared in **both** themes in `BaseLayout.astro` and used as
`var(--…)` — in CSS, in inline SVG attributes, everywhere. The only file allowed a raw hex outside
BaseLayout is `LogoMark.astro` (fixed brand fills). Binary assets (PNG) are not covered. The grep
above enforces it. Don't write `&#123;`-style numeric entities either (they trip the grep); use
`&lbrace;` / `&rbrace;`.

The palette: `--blue --blue-bright --cyan --cyan-soft --yellow --yellow-bright --orange --red
--purple --green`; sky `--sky-top/mid/bottom --cloud --cloud-soft --cloud-shade`; surfaces `--bg
--card --card-alt --code-bg --code-text --border --border-bright --text --text-muted --text-bright
--shadow --shadow-sm`; tints `--tint-<colour>`; `--sun --star`. Added by the overhaul:

| Token | Use |
|---|---|
| `--on-accent` | text on a solid accent (buttons, step numbers) |
| `--shadow-ink` | a colour for `drop-shadow()` (filters can't take `--shadow`) |
| `--frame`, `--frame-dots` | browser chrome around a screenshot |
| `--terminal-bg/-text/-prompt/-ok` | the Terminal component |
| `--bubble-user`, `--bubble-agent` | chat bubbles |
| `--band-bg`, `--band-ink`, `--band-muted` | a dark band section |
| `--step-1 … --step-4` | fluid type; h1 = step-4, h2 = step-3 |
| `--font-outfit`, `--font-mono` | emitted by the Fonts API; `--sans`/`--mono` wrap them |

Utilities (global): `.bg-sky` `.bg-band` `.bg-lift` `.measure` (62ch) `.tone-<colour>` (sets
`--accent` + `--tint`; defined once, never copy the block into a page). Themes are
`html[data-theme='day' | 'night']` — **never `prefers-color-scheme` in CSS**; the choice is
persisted by the boot script and the OS preference only seeds it.

### Motion
Every animation and transition is neutralised by the global `prefers-reduced-motion` rule in
BaseLayout. Any new animation must end in its visible state (`animation-fill-mode: both`) so a
near-zero duration lands on the right frame. Components may add their own `animation: none` too.

### No framework, no bundles
No UI framework, no `client:*` islands, no dependency that ships JS. Client behaviour is small
`<script>` blocks (< 40 lines each), progressive — everything must work with scripts off. The boot
script adds `html.js`; anything that only makes sense with a script is hidden until then
(`:global(html:not(.js)) .copy { display: none }`). Use a plain `<script>` (type-checked, deduped
per page, inlined by Astro because it's small) — `is:inline` only for the pre-paint boot. If
`dist/_astro/*.js` ever appears, a script crossed the inline limit: shrink it.

### Styles
Astro scoped `<style>` per component; `:global()` only to reach slotted content or `html`. Respect
the existing rhythm (`.wrap` 1140px, `.wrap-narrow` 860px, section padding ≈ 5rem, radii 12–20px).

### The page registry
`src/data/pages.ts` is the list of top-level pages. Nav, Footer, `llms.txt` and the sitemap filter
read it. Adding a page: an entry there (`ready: false` while it's a placeholder → `noindex`, no
sitemap, still linked) + `src/pages/<slug>.astro`. Flip `ready` when the content lands.
`astro.config.mjs` imports `SITEMAP_EXCLUDED_PATHS` from it — a `.ts` import from an `.mjs` file, which works
because Astro bundles its config with esbuild before evaluating it; plain Node could not load it.

### Adding a concept page (+ diagram)
1. Entry in `src/data/concepts.ts` (slug, num, title, blurb, tone, icon, `docs/CONCEPTS.md` anchor).
   Counts in copy derive from `CONCEPT_COUNT` — never type "thirteen".
2. `src/pages/concepts/<slug>.astro` with `ConceptLayout`; copy `tenancy.astro`'s shape: `<h2>`
   sections, `<div class="why">` for a decision, `<div class="note">` for a caveat, `source={[…]}`.
3. A diagram is one of the `Diagram*` components with a data table or list beneath it; pass the
   table's id as `describedBy` (it becomes `aria-describedby`, and the `<title>` id derives from it —
   so it must be unique on the page). Inline SVG only, `var()` fills, `role="img"`. Stay under ~120
   lines per diagram; keep labels to three words. Non-numeric props are plain strings.

### Screenshots
`<Screenshot light={…} dark={…} alt="…" url="app…/path" caption="…" />` with two imports from
`src/assets/screens/<stem>.light.png` / `<stem>.dark.png` (1440×900). The component emits AVIF/WebP
at 720/1440 for both and shows one per theme; `priority` makes the day image eager (night stays
lazy); `crop="top"` for tall pages; `frame="none"` for a bare image. Every capture is a row in
`src/assets/screens/MANIFEST.md` (stem · kit URL · kit commit · captured on) — follow the procedure
written there so a stale capture can be retaken.

### Branches, previews, deploys
**Never commit to `main`** — a push to main deploys to rocketflare.dev. Work on a branch, open a PR:
CI builds it and uploads a preview version at `pr-<n>-rocketflare-www.<subdomain>.workers.dev`
(`wrangler versions upload --preview-alias`, needs `preview_urls: true` in `wrangler.jsonc` and a
workers.dev subdomain on the account — if the account has none, that step fails and can be
removed; PRs from forks skip it because they have no secrets). The URL is posted as a PR comment.
Merging deploys. `npm run deploy` from a laptop is an escape hatch, not the path.

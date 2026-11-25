# Rocketflare product screenshots

## The kit frames (current pass)

Every kit frame except `analytics`, `analytics-explore` and `settings-mcp` was retaken on 2026-11-25 in the kit's **new default look** (the warm palette, the dark sidebar, the new Home dashboard, run pages, grouped search and provenance on answers). The older passes are summarised under "Earlier passes" below.

- Kit commit: `b71c9093` (branch `feat/default-design-guard`, clean tree)
- Captured: 2026-11-25, against the kit's local dev stack (Vite http://localhost:3200, wrangler http://localhost:3201), demo-seeded (the demo seed re-dates its runs to the last 14 days)
- Signed in as Olivia Bennett, owner of "Acme Logistics" (`/login?as=owner@example.test`, dev-only auto login); `admin-tenants` and `feature-flags` as the **global admin** (`/login?as=admin@rocketflare.local`), who holds a `support` membership in Acme Logistics — hence the full sidebar and the Support badge in those two frames
- Files: `<stem>.<light|dark>.png`, PNG, viewport only (not full page)
- Desktop: 1440×900 @2 → 2880×1800 px. Mobile (`m-*`): 390×844 @3, mobile + touch emulation → 1170×2532 px
- Tool: headless Chrome driven over CDP with a throw-away profile (`Emulation.setDeviceMetricsOverride` with `deviceScaleFactor` 2, or 3 and `mobile: true` plus `Emulation.setTouchEmulationEnabled` for `m-*`). Before each shot: the hide-chrome step below (plus `#dev-design-panel` if present), `document.fonts.ready`, no `.loading-spinner`/`.skeleton` left. `capture.sh` (the chrome-devtools CLI daemon) does the same job
- **Two agent runs were started through the UI for this pass**, nothing else written: `agents-approval` is a `summarize-text` run with *Index the result* ticked over an October returns review (run `2eb77e70`, left parked on purpose — answering it settles the run and the frame cannot be retaken from it; it also holds the one `summarize-text` slot), and `agents-run` is a `research-topic` run (`37e1ec4c`) asking what a new carrier must provide before its first load. The demo seed has no parked run, and its research runs carry no timeline steps
- **Retouched in the DOM before capture, nothing saved**: on `chat` and `m-chat` the conversation list hides 15 dev probe threads ("Reply with exactly: pong", "probe glm", "llama stream", "hello"…) and keeps the four logistics threads; on `search` the two maintenance notices ("4 documents were indexed with a different model…", "8 documents have no search context yet…") are hidden — both are leftovers of this dev database, not of the seed

## Retaking a frame

1. Run the kit from a clean demo seed (`bash scripts/bootstrap.sh`) and sign in as the account above. Expect to start a parked `summarize-text` run (Index the result ticked) for `agents-approval` and a `research-topic` run for `agents-run` through the UI — the seed has neither
2. `. capture.sh`, then `nav <route>` from the table, `waitfor "<text>"` for the text the row lists, and `both <stem>` — light, then dark, hiding the dev-only chrome before each shot.
3. Copy the pair here, update the row and the kit commit above, and look at the frame in both themes on the page that uses it (`/tour/`, `/who-is-it-for/`).

Theme flip (persisted by the app in `localStorage.theme`; done by clicking the app's own toggle so its icon stays in sync, with a manual fallback):

```js
() => { const want = 'rocketflare-dark' /* or 'rocketflare-light' */;
  if (document.documentElement.dataset.theme !== want) {
    const b = document.querySelector('button[aria-label^="Switch to"]');
    if (b) b.click();
    else { localStorage.setItem('theme', want); document.documentElement.dataset.theme = want }
  }
  return document.documentElement.dataset.theme }
```
then wait ~400 ms. drizzle-cube surfaces (`analytics`, `analytics-explore`) mirror the theme into a `dark` class: for `analytics` the dark frame was taken after flipping and re-navigating to the page; for `analytics-explore` the live flip re-themed the chart (verified `classList.contains('dark') === true`).

Hide dev-only chrome (run after the page's data rendered, right before each screenshot):

```js
() => { const hide = el => { if (el) el.style.display = 'none' };
  document.querySelectorAll('div[role="status"].alert-warning, .tsqd-parent-container, .tsqd-open-btn-container, #react-query-devtools, vite-error-overlay, .toast, [title^="Dev environment"], [title^="Staging environment"], #dev-design-panel').forEach(hide);
  document.querySelectorAll('button').forEach(b => { if (/tanstack/i.test(b.getAttribute('aria-label') || '')) hide(b) });
  return 'hidden' }
```
(covers `ConnectionBanner`, the TanStack Query devtools button, the Vite error overlay, toasts, and the `DEV` environment badge in the header — the badge is a real feature, hidden for marketing frames; drop the `[title^="Dev environment"]` selector from `HIDE_JS` in `capture.sh` to show it.)

Wait strategy: poll `document.body.innerText.includes('<text>')` once a second (e.g. "Recent activity", "Pending invitations", "Workers AI", "Organisation Overview"), then 1.5–6 s extra for TanStack / charts.

## Shots

| Stem | Route | State | Viewport | Used by |
|---|---|---|---|---|
| `login` | `/login` | signed out: the Example SSO (development only) work-email field and button, the magic-link form, and the Dev quick login panel with Owner, Admin, Member and Global admin; the rocket illustration on the right | 1440×900 @2 | tour `#sign-in` |
| `home` | `/` | the new Home dashboard: "Good evening, Olivia", the Ask anything box with three suggested prompts, Agent runs (21 runs in 14 days · 81% succeeded · 3 failed) as a stacked daily bar chart over the latest runs, Knowledge (9 documents · 1 indexing) beside it, the Team card starting below | 1440×900 @2 | tour `#home`, get-started |
| `people` | `/settings?tab=people` | Members, 9 people (the eight seeded plus Platform Admin as Support) with role selects, groups, joined and last sign-in; the Pending invitations panel (empty) starting at the bottom | 1440×900 @2 | tour `#people`, landing, who-is-it-for, internal-tool |
| `groups` | `/settings?tab=groups` | Settings → Groups with the Finance **Members dialog open** (click the first `Members` button): 4 people not in the group on the left, the 5 in it on the right; group types Department (3) and Team (0) behind the overlay | 1440×900 @2 | tour `#groups` |
| `settings-ai` | `/settings?tab=ai` | Readiness, four cards all Ready: Chat = Anthropic · claude-haiku-5-5 · platform default; Embeddings = Workers AI · bge-m3 · platform default; Decisions = TypeSafe (Jev) · jev-latest · this workspace; Reranking = Workers AI · bge-reranker-base · platform default. Chat providers empty below | 1440×900 @2 | tour `#ai-settings` |
| `chat` | `/chat/9a3e7c07-…` ("What documents related to MOTs?") | 4 conversations in the list (dev probes hidden, see above), the thread scrolled to its top: the answer about MOTs with **Source 1 · Fleet maintenance schedule · 6 passages** and thumbs, the next question below | 1440×900 @2 | tour `#chat` |
| `agents-run` | `/agents/runs/37e1ec4c-…` | Research a topic, **Succeeded**, 9 s, run for this pass: the question, the timeline (Searching the knowledge base · 3 turns, 2 documents consulted · 3 model calls · 3 tools; Answer and Sources artifacts; Writing the answer · 2 citations), and the Output tab with the answer's short answer and its table of the six onboarding gates and who signs each off | 1440×900 @2 | tour `#agents`, landing |
| `agents-research` | `/agents/runs/9be4d5cc-…` | Research a topic (seeded, Succeeded, 52 s), **scrolled to the bottom**: the Markdown answer listing the five documents an EU shipment needs and who signs each, then **Source 1 · Customs paperwork: EU shipments · Text · 8 passages** and "Read 1 document in 3 model turns" | 1440×900 @2 | tour `#research`, who-is-it-for, customer-portal |
| `agents-approval` | `/agents/runs/2eb77e70-…` | Summarize text **Awaiting input** (run for this pass, left parked): the "Index this summary?" panel above everything (Index it / Cancel the run, "expires in 7 days"), the input, the timeline ending on "Asked for a decision" and "Waiting for an answer" with the note box, the Output tab reading "No answer yet"; the Agents nav item carries a badge of 1 | 1440×900 @2 | tour `#approval`, who-is-it-for |
| `documents` | `/documents` | Knowledge: 9 documents — Returns policy Indexing, five seeded logistics documents, two "Summary <date>" documents written by the Summarize text agent, `README` (Markdown, restricted to Finance) and `Diversen` (PDF) with download icons; the Paste text form below | 1440×900 @2 | tour `#knowledge`, customer-portal |
| `search` | `/search` | query "customs paperwork EU shipments" typed and run (the page does not read `?q=`): "10 passages from 3 documents", the first group Customs paperwork: EU shipments with highlighted matches, the filters panel (document, source, type, date) on the left; the two maintenance notices hidden (see above) | 1440×900 @2 | tour `#search` |
| `analytics` | `/analytics/1b2364b4-…` (Organisation Overview, default template) | **Not retaken in this pass** (needs the analytics plugin; older look). KPI strip (Members 8 / Owners 1 / Admins 2 / Active users 2), Sign-ups over time line, Members by role proportion bar, Daily activity below the fold | 1440×900 @2 | tour `#analytics`, who-is-it-for |
| `analytics-explore` | `/analytics/explore` | **Not retaken in this pass** (older look). Query built: metric `ActivityEvents.count`, breakdown `ActivityEvents.type`, chart type "Bar Chart" (15 rows) | 1440×900 @2 | tour `#analytics` (second frame) |
| `usage` | `/settings?tab=usage` | AI usage, 30 days (26 Oct – 25 Nov): 16 calls, 12,032 in / 1,469 out, $0.0030 estimated; three rows — anthropic claude-haiku-5-5 chat, workers_ai bge-m3 knowledge.embeddings, workers_ai bge-reranker-base knowledge.rerank | 1440×900 @2 | tour `#usage` |
| `admin-tenants` | `/admin/tenants` | Admin → Organisations, 5 total: Acme Logistics (8 members), Northwind Freight, Bluebird Clinics, and two organisations made in earlier dev sessions (Brightside Grounds & Gardens Ltd, Empty Home Check) | 1440×900 @2 | tour `#admin` |
| `feature-flags` | `/admin/feature-flags` | Admin → Feature flags at the top of the page: Knowledge facts (`knowledge-facts`) set to On with its **Per-organisation overrides (2) expanded** — Acme Logistics forced off, Brightside Grounds & Gardens Ltd forced on (dev data, not seed) — and Contextual search below | 1440×900 @2 | tour `#feature-flags`, internal-tool |
| `m-home` | `/` | mobile Home: greeting, Ask anything with its three prompts, Agent runs (23 runs — includes this pass's two, the in-progress one in blue) and the chart | 390×844 @3 | tour, phone pair |
| `m-chat` | `/chat/9a3e7c07-…` | mobile chat thread scrolled to the end of the first answer: Source 1 · Fleet maintenance schedule, thumbs, the next question and the start of the second answer | 390×844 @3 | tour, phone pair |
| `m-agents` | `/agents` | mobile Agents: "1 waiting on you" and All runs, the Last 30 days table — the table is wider than the phone and its status column is cut off at the right edge | 390×844 @3 | unused — the cut-off table |

`settings-mcp` (row at the end of this file) was **not retaken**: this dev server leaves `FEATURES_ENABLED` blank, so the MCP tab is not offered; its frame is still the old look.

Every stop with a frame now has one; the tour's CLI stop is text only by choice (it is a terminal, and `Terminal.astro` renders that better than a screenshot would).

## What looked wrong in the app during the 2026-11-25 pass

1. **Stale decision notification**: the bell carried "Summarize text needs your decision" for run `d6565412`, which had already been answered and succeeded. It counts towards the badge (2 in the frames after this pass started a new parked run).
2. **A waited run's duration includes the wait**: `d6565412` reads "Duration 1082m 27s" and its "Checking the input" step "1082m 26s"; minutes are not rolled up into hours either.
3. **Modal backdrop leaves the sidebar undimmed** (`groups`): the overlay dims the header and content but the sidebar stays at full brightness.
4. **Mobile Agents table overflows** (`m-agents`): the status column is clipped at 390 px.
5. **Mobile chat card stops short** (`m-chat`): the card ends ~60 px above the bottom of the viewport.
6. Agent-indexed summaries are titled `Summary 2026-09-17 08:31`, and research answers cite them by that name.
7. Seeded research runs have no timeline steps (Started → Finished) while their footer says "Read 1 document in 3 model turns".
8. Home says "8 people" (Team) while People says "9 people" (the support membership counts on one and not the other).

## Earlier passes

- The first pass: kit commit `39790e4`, captured 2026-09-02 on the dev stack at :3000/:3001, same account. `groups` (`3fa71eb`, 2026-09-14), `feature-flags` and `admin-tenants` (`cffb14a`, 2026-09-15), the agents frames (`d9e4937`, 0.4.0, 2026-09-16) and `settings-mcp` (`8fb720f`, 2026-11-20) followed. The viewport must be set with the device pixel ratio (`emulate --viewport 1440x900x2` with the CLI) — `resize_page` alone gives a 1440×900 file
- `analytics` and `analytics-explore` are still from the first pass (`39790e4`, 2026-09-02)

## SSO plugin captures (`sso-*`, used by `/plugins/` and `/plugins/sso/`)

The commercial `sso` plugin 0.1.0, installed in a kit checkout at `002b095`, captured 2026-11-09.

- Settings frames: the dev stack through its tunnel (signing in on `localhost` fails while `APP_URL` is the tunnel), signed in as Marcus Adeyemi, admin of Acme Logistics, on a live test connection to an Okta Integrator org
- `sso-login`: a separate non-dev Worker, built UI, `APP_ENV=staging` (`devLogin: false`, so no quick login and no Example SSO): `wrangler dev --name rf-sso-login-shot --port 3302 --inspector-port 9339 --persist-to <tmp> --var APP_ENV:staging --var APP_URL:http://localhost:3302`. The email field is filled in
- Tool: the chrome-devtools MCP browser, `emulate --viewport 1440x900x2`, viewport only
- **The settings frames are retouched in the DOM before capture, and nothing is saved.** These are a public site's images: replace the tunnel host with `app.acme-logistics.example`, the verified domain with `acme-logistics.example`, the connection id with `7f3a2c91`, the Okta org and app ids with `acme` placeholders, the group with `Logistics Admins`, the certificate body and fingerprint with placeholders, and the SCIM token prefix with bullets. Hide the second test connection and the `DEV` / `vdev` chrome

| Stem | Route | State | Used by |
|---|---|---|---|
| `sso-login` | `/login` | Non-dev login: Sign in with SSO above the email link form | `/plugins/` card, `/plugins/sso/` hero and `#sign-in` |
| `sso-connection` | `/settings?tab=sso` | Scrolled to the active Okta connection, step 1 | `#connect` |
| `sso-domains` | `/settings?tab=sso` | Steps 2 and 3, one verified domain and one group → role mapping, the top of step 4 | `#domains` |
| `sso-scim` | `/settings?tab=sso` | The end of step 3, step 4 with one token, step 5 with Require single sign-on **off** | `#scim` |

## Sites plugin captures (`sites-*`, used by `/plugins/` and `/plugins/sites/`)

The commercial `sites` plugin as merged to the commercial plugins repository's `main` at `dcd584b` (manifest 0.2.0, unreleased; needs kit 0.30.0), installed in a demo app at `~/tmp/sites-demo-app` (commit `b570410`), captured 2026-11-10.

- Stack: the demo's `wrangler dev` on `http://localhost:3421`, signed in with `/login?as=owner@example.test` (owner of the one workspace). Site hosts from `SITES_HOSTS`: `www.localhost:3421` and `docs.localhost:3421`. Content is the fictional company Pellorin
- Tool: `playwright-core` driving the installed Google Chrome headless, 1440×900 at `deviceScaleFactor: 2` → 2880×1800, viewport only. The theme is set by writing `localStorage.theme` (`rocketflare-light` / `rocketflare-dark`) in an init script before load
- **Read-only.** Nothing was typed into a saved field, published, built or translated: a block was selected from the Outline tab, a preview width was switched, the Publish menu and the Build with AI dialog were opened and closed, and the editor still read "No changes" afterwards. The Build with AI description was typed into the unsent dialog
- Retouched in the DOM before capture, nothing saved: the `DEV` badge and the `vdev` release label hidden (`visibility: hidden`), and on `sites-elements` a scratch element named "Blah" hidden
- `sites-public` is the public site, which has no dark theme: the page passes the same image as both `light` and `dark`. Its frame's URL bar says `www.pellorin.example`; the app frames say `app.pellorin.example`

| Stem | Route | State | Used by |
|---|---|---|---|
| `sites-editor` | `/sites/www/pages/<about>/en` | Outline tab, the Hero block selected, its fields in the right panel | `/plugins/` card and the `/plugins/sites/` hero |
| `sites-palette` | `/sites/docs/pages/<home>/en` | Tablet preview, the Hero block selected (from Outline), then the Blocks tab showing the palette | `#editor` |
| `sites-pages` | `/sites/www?tab=pages` | Four pages with en/fr state badges | `#pages` |
| `sites-publish` | `/sites/www/pages/<about>/en` | Publish menu open: Publish now, schedule, Unpublish | `#publishing` |
| `sites-language` | `/sites/www/pages/<about>/fr` | The French About page, language switch on fr, Translate from en in the toolbar | `#languages` |
| `sites-elements` | `/sites/www?tab=elements` | Site header and Site footer regions | `#blocks` |
| `sites-public` | `http://www.localhost:3421/` | The published English home page, light only | `#public` |
| `sites-build` | `/sites/www?tab=pages` → New page → Build with AI | Description filled in, Choose sources expanded, **not submitted** | `#ai` |
| `sites-forms` | `/sites/www/forms` → View | 0.4.0 pass (below): the contact submission's view, Workflow Succeeded with View run, the Summary and the Reply draft | `#forms` |

`sites-forms` was added in a later pass: the sites plugin 0.4.0 (commercial plugins PR #3, branch `feat/sites-form-events`, unreleased; needs kit 0.32.1), installed in a host at `~/tmp/sites-040-host` (kit 0.32.0 commit `750b36b` plus the plugin, uncommitted), captured 2026-11-10.

- Stack: `pnpm dev` on `http://localhost:3440` (API :3441), dev Postgres `sites-040-dev-pg` on :5745, signed in with `/login?as=owner@example.test`. The host's `app/index.ts` declared no site, which left the plugin dormant; `www` (`en` only, matching its data) was declared for the pass and the file restored afterwards
- Same tool and format as above: `playwright-core`, Chrome headless, 1440×900 at `deviceScaleFactor: 2`, theme by `localStorage.theme` in an init script
- **Read-only**: no new submission and no new agent run. The submission ("Ada Lovelace", a nonprofit-discount question) and its succeeded `sites.form-reply` run were made by an earlier pass on Workers AI
- Retouched in the DOM, nothing saved: the `DEV` badge, the `vdev` label and the TanStack Query devtools button hidden (`visibility: hidden`), and in the dialog only, the host organisation's name `Rocketflare` in the model's summary and reply replaced with `Pellorin`
- Also captured, not used (a feature has one frame): the Form block's **On submit, start** picker set to Draft a reply, on `/sites/www/pages/<contact>/en`

## Rocketflare Launch captures (`launch-*`, used by `/launch/`)

Not the kit: these are frames of Rocketflare Launch (`rocketflare-dev/rocketflare-launch`), the company
console the `/launch/` overview describes.

- Launch commit: `ae81e3d` (`main`), captured 2026-10-05
- Instance: the local dev Launch at `https://local.clewro.com` (`pnpm dev` + `pnpm dev:tunnel`), signed in
  with the dev quick login **Owner** (Olivia Bennett, Acme Logistics)
- Tool: the chrome-devtools MCP browser, `emulate --viewport 1440x900x2` → 2880×1800 PNG, viewport only
- Theme: Launch's own toggle (`button[aria-label^="Switch to"]`, `data-theme` = `launch-light` /
  `launch-dark`), then the `DEV` badge hidden (`visibility: hidden` on the header element whose text is `DEV`)
- The page URL bar in the deck says `launch.your-company.com/…`; the frames themselves show `clewro.com` hosts

| Stem | Route | State | Used by |
|---|---|---|---|
| `launch-create` | `/apps` → **Create app** | Dialog filled in, **not submitted**: Name "Expense approvals", slug `expense-approvals` with its staging/production hosts, owner team Finance (Department), description "Submit receipts, route them to a manager, export the month to Finance.", Deploy staging now on. The two real apps (Gate check, hola world) behind the overlay | `#create` |
| `launch-session` | `/apps/hola-world/sessions/652579a8-…` | The "Upgrade kit 0.15.5 → 0.17.0" session, Ready: chat scrolled so the agent's porting-notes summary and the follow-up "make sure you look at all the other upgrade versions" are in view (the scroll container moved so that message sits ~470 px below the top of the pane — the bottom of the thread holds push errors), Ship panel with lint / typecheck / tests passed on Neon gate branch `gate-waq6tezmnnf7-1`, live preview of the app's sign-in page | `#build` |
| `launch-approval` | `/approvals/72e15ad0-…` | Production deploy of Gate check, **Approved**: why they asked, what would go to production, Who decides (owners or admins, 1 of 1, self-approval not allowed), the decision by Marcus Adeyemi | `#ship` |
| `launch-audit` | `/audit` | Integrity panel (Verify / CSV / JSON Lines, **before** pressing Verify — the result line reports unsealed events on a dev instance whose sealing cron is idle) and the event table: session, upgrade and setting events | `#control` |
| `launch-app` | `/apps/hola-world` | Overview: Staging v0.15.8 up, "1 change not live" with **Ship v0.15.8 live**, Live v0.15.7 up, Kit "Requires upgrade → 0.17.0" with the upgrade session needing its owner, Active sessions | `#fleet` (`crop="top"`) |
| `plugin-guide` | `/guide` on a demo app with the **guide** plugin (3.10.0, kit 0.31.0) installed | Getting started open; Ask the Guide pane asked "How do I invite a colleague?" and answered in numbered steps (no raw footnote marks — retake if the model leaves `[^n]` in the text). Captured 2026-11-10 by the CLI daemon, same viewport and sign-in as above | 1440×900 @2 | `/plugins/guide/` hero |

Not captured: **Secrets / grants** (the deck's fleet slide describes grants in text instead).
| `settings-mcp` | `/settings?tab=mcp` | Settings → MCP with Allow MCP clients on: the server URL `http://localhost:3600/mcp/t/acme` (dev ports 3600/3601, `APP_URL` set to localhost for the capture) and the Connect a client card for Claude, Claude Code and ChatGPT. Kit commit `8fb720f` (the 0.41.0 branch), captured 2026-11-20, same account | 1440×900 @2 | tour `#mcp` |

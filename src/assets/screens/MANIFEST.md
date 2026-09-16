# Rocketflare product screenshots

- Kit commit: `39790e4` (`git -C <kit> rev-parse --short HEAD` at capture time; working tree carried uncommitted doc/rules edits)
- `groups` was added in a later pass: kit commit `3fa71eb` (clean tree), captured 2026-09-14, same stack and same signed-in account. The viewport is set with `emulate --viewport 1440x900x2` — `resize_page` alone leaves the device pixel ratio at 1 and produces a 1440×900 file rather than 2880×1800
- `feature-flags` and `admin-tenants` were added in a later pass again: kit commit `cffb14a` (clean tree), captured 2026-09-15, same stack, signed in as the **global admin** (`/login?as=admin@rocketflare.local`) rather than Olivia Bennett — both are `/admin` screens. That account holds a `support` membership in Acme Logistics from an earlier dev session, which is why the sidebar is full and the footer carries a Support badge; signed in with no membership at all the nav is only Home + Admin and the frames read as empty
- `agents-run`, `agents-research` and the new `agents-approval` were retaken in a later pass again: kit commit `d9e4937` (release 0.4.0, clean tree), captured 2026-09-16, same stack and same signed-in account. **0.4.0 deleted the run drawer** — a run is now its own page at `/agents/runs/:id`, so the two older frames showed a UI that no longer exists. The runs list no longer sits behind them, which also retires known-noise 2 below for these frames
- Captured: 2026-09-02, against the kit's local dev stack (Vite http://localhost:3000, wrangler http://localhost:3001), read-only
- Signed in as Olivia Bennett, owner of "Acme Logistics" (`/login?as=owner@example.test`, dev-only auto login)
- Files: `<stem>.<light|dark>.png`, PNG, viewport only (not full page)
- Desktop: 1440×900 @2 → 2880×1800 px. Mobile (`m-*`): 390×844 @3, mobile + touch emulation → 1170×2532 px
- Tool: the `chrome-devtools` CLI daemon from the chrome-devtools-mcp package (`chrome-devtools start --headless --isolated --allowUnrestrictedPaths`) — a headless Chrome with a throw-away profile. `capture.sh` in this directory holds the helpers a pass sources (`nav`, `waitfor`, `hide`, `theme`, `shot`, `both`, `errs`); it writes to `/tmp/rf-screens/`, so copy the PNGs here afterwards

## Retaking a frame

1. Run the kit from a clean demo seed (`bash scripts/bootstrap.sh`) and sign in as the account above.
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
  document.querySelectorAll('div[role="status"].alert-warning, .tsqd-parent-container, .tsqd-open-btn-container, #react-query-devtools, vite-error-overlay, .toast, [title^="Dev environment"], [title^="Staging environment"]').forEach(hide);
  document.querySelectorAll('button').forEach(b => { if (/tanstack/i.test(b.getAttribute('aria-label') || '')) hide(b) });
  return 'hidden' }
```
(covers `ConnectionBanner`, the TanStack Query devtools button, the Vite error overlay, toasts, and the `DEV` environment badge in the header — the badge is a real feature, hidden for marketing frames; drop the `[title^="Dev environment"]` selector from `HIDE_JS` in `capture.sh` to show it.)

Wait strategy: poll `document.body.innerText.includes('<text>')` once a second (e.g. "Recent activity", "Pending invitations", "Workers AI", "Organisation Overview"), then 1.5–6 s extra for TanStack / charts.

## Shots

| Stem | Route | State | Viewport | Used by |
|---|---|---|---|---|
| `login` | `/login` | signed out: magic-link form + the four DEV QUICK LOGIN buttons (Owner, Admin, Member, Global admin) | 1440×900 @2 | tour `#sign-in` |
| `home` | `/` | Home: Acme Logistics · Owner, quick links, 5 recent activity rows | 1440×900 @2 | tour `#home`, landing |
| `people` | `/settings?tab=people` | Members table, 8 people with roles, plus the "Pending invitations" panel (`invited@example.test`) at the bottom | 1440×900 @2 | tour `#people`, who-is-it-for |
| `groups` | `/settings?tab=groups` | Settings → Groups with the Finance **Members dialog open** (click the first `Members` button): group types Department (3) and Team (0) behind the overlay, dialog showing 3 people not in the group and the 5 in it | 1440×900 @2 | tour `#groups` |
| `settings-ai` | `/settings?tab=ai` | Readiness: Chat = Cloudflare Workers AI · llama-3.3-70b-instruct-fp8-fast · platform default (Ready); Embeddings = Workers AI · bge-m3 (Ready); no tenant providers | 1440×900 @2 | tour `#ai-settings` |
| `chat` | `/chat/eb7c618a-…` ("Late deliveries on the Rotterdam lane") | 3 conversations in the list, thread open, scrolled to the last two turns with token counts | 1440×900 @2 | tour `#chat` |
| `agents-run` | `/agents/runs/50e1bef0-…` | Summarize text run (29 Aug, Succeeded) on its own page: input block, timeline (input check, summarising), output + key points in the Output tab, Artifacts 1. Output-major split — the run is settled | 1440×900 @2 | tour `#agents`, landing |
| `agents-research` | `/agents/runs/c9672156-…` | Research a topic run (30 Aug, Succeeded) on its own page; the Markdown answer with the "Sources → Customs paperwork: EU shipments" citation rendered as a one-line document link | 1440×900 @2 | tour `#research`, who-is-it-for |
| `agents-approval` | `/agents/runs/d6565412-…` | Summarize text **Awaiting input**: the action panel above the timeline asks "Index this summary?" (Index it / Cancel the run, "expires in 7 days"), the timeline ends on "Asked for a decision", the Output tab reads "No answer yet" and the **Agents nav item carries a badge of 1**. Timeline-major split — the run is active | 1440×900 @2 | tour `#approval` |
| `documents` | `/documents` | Knowledge table: 6 documents, "Returns policy" shown as Indexing, download icon on the uploaded Markdown file; Paste text form below | 1440×900 @2 | tour `#knowledge` |
| `search` | `/search` | query "customs paperwork EU shipments" typed and run (the page does not read `?q=`); hit #1 = Customs paperwork: EU shipments with dense/lexical rank badges | 1440×900 @2 | tour `#search` |
| `analytics` | `/analytics/1b2364b4-…` (Organisation Overview, default template) | KPI strip (Members 8 / Owners 1 / Admins 2 / Active users 2), Sign-ups over time line, Members by role proportion bar, Daily activity below the fold | 1440×900 @2 | tour `#analytics`, who-is-it-for |
| `analytics-explore` | `/analytics/explore` | Query built: metric `ActivityEvents.count`, breakdown `ActivityEvents.type`, chart type "Bar Chart" (15 rows) | 1440×900 @2 | tour `#analytics` (second frame) |
| `usage` | `/settings?tab=usage` | AI usage, last 30 days: 40 calls, 134,788 in / 10,112 out, $0.1498 estimated; 9 priced rows across anthropic and workers_ai | 1440×900 @2 | tour `#usage` |
| `admin-tenants` | `/admin/tenants` | Admin → Organisations: 3 total — Acme Logistics (8 members, active 34 minutes ago), Northwind Freight (1), Bluebird Clinics (1) | 1440×900 @2 | tour `#admin` |
| `feature-flags` | `/admin/feature-flags` | Admin → Feature flags: the one shipped flag `example-feature` set to **Rollout 50%** counting organisations, **overrides expanded** showing Bluebird Clinics forced off and Northwind Freight forced on. The sidebar shows the “Example feature” nav item the flag gates | 1440×900 @2 | tour `#feature-flags` |
| `m-home` | `/` | mobile Home | 390×844 @3 | tour, phone pair |
| `m-chat` | `/chat/eb7c618a-…` | mobile chat thread, scrolled to the last assistant turn | 390×844 @3 | tour, phone pair |
| `m-agents` | `/agents` | mobile Agents: available agents + runs list | 390×844 @3 | unused — dev noise in the runs list (see below) |

Every stop with a frame now has one; the tour's CLI stop is text only by choice (it is a terminal, and `Terminal.astro` renders that better than a screenshot would).

## Known noise — what to fix in the seed before the next pass

1. ~~**`admin-tenants` could not be captured.**~~ **Fixed.** `/admin/*` is now `ProtectedRoute`'s one exemption, so a global admin with no membership reaches it; the junk-named `asdcasdcsdcsdac` tenant is also gone, and the list is the three the tour copy names. Captured 2026-09-15.
2. **Agents runs list is cluttered by ad-hoc dev runs**: 22 runs, most from 1 Sep by user `49604981` (Failed / Cancelled research runs, a 14m47s cancelled run…). The two seeded runs (29–30 Aug) are at the bottom, so the list views behind `agents-run` / `agents-research` and all of `m-agents` show the noisy rows — which is why `m-agents` is not used. "Requested by" renders a short user id rather than a name (known gap in CONCEPTS §9).
3. **Search results 2–4 come from a dev upload** (`interviewing-techniques-review.md`, 24 chunks) rather than the seeded logistics documents (1–2 chunks each). The seeded docs are small, so dense retrieval fills the list with the big off-topic file. `search` is used anyway — hit #1 and the rank badges are the point. Either remove that document or seed longer logistics texts.
4. **Knowledge page**: the same `interviewing-techniques-review` Markdown row sits second in the table (created 1 Sep 17:46, uploaded file). Not seed data.
5. **Analytics "Daily Activity" KPI reads `Events 0 / +0 since 2026-06-05`** (below the fold): the fact table is fresh but activity is sparse in the last-90-days window; the Sign-ups chart is a single spike at end of August. Fine for the top half; the bottom half is not impressive.
6. **Settings → AI shows two empty-state panels** ("No chat providers configured", "No embeddings providers configured") under the readiness cards — expected for the zero-key default, but the lower two-thirds of the frame are empty states.
7. **Mobile Home**: recent-activity actor names truncate to "Olivia B…", "Mar…" at 390 px.
8. **Chat**: the third seeded conversation is titled "In one short sentence, what is Cloudflare Workers AI?" (a test prompt) — a dev leftover next to the two logistics threads.
9. Cosmetic: the theme toggle keeps a component-local icon state — flipping via `localStorage` + `data-theme` alone leaves the icon out of sync, which is why the frames flip through the button.
10. No console errors on any captured page except the expected 401 from `/auth/session` on the signed-out login page. The very first load through the Vite proxy took ~19 s (one-off).
11. **`/search` is not deep-linkable**: `SearchPage` reads only `?documentId=`, not `?q=`, so `/search?q=…` renders an empty page. The `search` frames were produced by filling the box and pressing Search.
12. The `DEV` environment badge was hidden in every frame after `login` by the hide-chrome step (see above).
13. **`groups`: two rows behind the dialog are not seed data** — a `Sales` group (1 person) and an empty `Team` group type, both created by hand in dev. The demo seed makes one type, `Department`, with `Finance` and `Operations` only. They sit behind the dimmed overlay in the captured frame and read as ordinary data; delete them before any frame that shows the Groups page *without* the dialog open.
14. **`feature-flags`: both per-organisation overrides are hand-made dev data**, not seed data — the demo seed ships `example-feature` with no overrides. They were created through the admin UI to show the panel doing the thing it exists for (one organisation forced on, one forced off). Clear them before any frame that is meant to show the default state.

15. **`agents-approval` is a run created for the frame**, not seed data: `summarize-text` with
    `index: true` over a Q3 carrier-onboarding review written to match the Acme Logistics workspace.
    It is **left parked on purpose** — answering it settles the run and the frame cannot be retaken
    from it. It also holds the exclusive slot for `summarize-text`, so cancel it before starting
    another run of that agent. The demo seed ships no parked run; seeding one would be the way to
    make this frame reproducible without a manual step.
16. `agents-approval`'s timeline renders the raw status string **`awaiting_input`** in its last row,
    where the badge above says "Awaiting input". Cosmetic, visible in a marketing frame, and a kit
    fix rather than a capture one.

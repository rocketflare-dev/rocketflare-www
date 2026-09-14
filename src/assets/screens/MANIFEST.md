# Rocketflare product screenshots

- Kit commit: `39790e4` (`git -C <kit> rev-parse --short HEAD` at capture time; working tree carried uncommitted doc/rules edits)
- `groups` was added in a later pass: kit commit `3fa71eb` (clean tree), captured 2026-09-14, same stack and same signed-in account. The viewport is set with `emulate --viewport 1440x900x2` — `resize_page` alone leaves the device pixel ratio at 1 and produces a 1440×900 file rather than 2880×1800
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
| `agents-run` | `/agents/runs/50e1bef0-…` | Summarize text run (29 Aug, Succeeded) drawer over the runs list; timeline with the "Submit summary" Details expanded; output + key points | 1440×900 @2 | tour `#agents` |
| `agents-research` | `/agents/runs/c9672156-…` | Research a topic run (30 Aug, Succeeded); drawer scrolled so the Markdown answer and the "Sources → Customs paperwork: EU shipments" citation are visible | 1440×900 @2 | tour `#research`, who-is-it-for |
| `documents` | `/documents` | Knowledge table: 6 documents, "Returns policy" shown as Indexing, download icon on the uploaded Markdown file; Paste text form below | 1440×900 @2 | tour `#knowledge` |
| `search` | `/search` | query "customs paperwork EU shipments" typed and run (the page does not read `?q=`); hit #1 = Customs paperwork: EU shipments with dense/lexical rank badges | 1440×900 @2 | tour `#search` |
| `analytics` | `/analytics/1b2364b4-…` (Organisation Overview, default template) | KPI strip (Members 8 / Owners 1 / Admins 2 / Active users 2), Sign-ups over time line, Members by role proportion bar, Daily activity below the fold | 1440×900 @2 | tour `#analytics`, who-is-it-for |
| `analytics-explore` | `/analytics/explore` | Query built: metric `ActivityEvents.count`, breakdown `ActivityEvents.type`, chart type "Bar Chart" (15 rows) | 1440×900 @2 | tour `#analytics` (second frame) |
| `usage` | `/settings?tab=usage` | AI usage, last 30 days: 40 calls, 134,788 in / 10,112 out, $0.1498 estimated; 9 priced rows across anthropic and workers_ai | 1440×900 @2 | tour `#usage` |
| `m-home` | `/` | mobile Home | 390×844 @3 | tour, phone pair |
| `m-chat` | `/chat/eb7c618a-…` | mobile chat thread, scrolled to the last assistant turn | 390×844 @3 | tour, phone pair |
| `m-agents` | `/agents` | mobile Agents: available agents + runs list | 390×844 @3 | unused — dev noise in the runs list (see below) |

Not produced: `admin-tenants` — see below. The tour's Admin stop is text only until it exists.

## Known noise — what to fix in the seed before the next pass

1. **`admin-tenants` could not be captured.** The seeded global admin (`admin@rocketflare.local`, quick-login "Global admin") has no tenant membership, so the UI's `ProtectedRoute` (requireTenant) redirects every shell route including `/admin` and `/admin/tenants` to `/no-access`. The API works (`GET /api/admin/tenants` → 200 with 4 tenants); the page is simply unreachable in the UI for that user. Either give the global admin a membership in the seed, or let `/admin` bypass the tenant requirement. (The admin API lists four tenants — `Acme Logistics`, `Northwind Freight`, `Bluebird Clinics`, and a junk-named `asdcasdcsdcsdac` with 1 member, presumably created by hand in dev. Delete it before any admin screenshot; the tour copy says three.)
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

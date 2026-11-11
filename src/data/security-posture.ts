/**
 * "What every copy enforces" on /security/: the security properties of the kit, grouped, one plain
 * statement each, and the gaps a security reader should know.
 *
 * **Every line must be something the kit's own docs state**, at the ref the security docs are
 * synced from (`src/content/security/*.md` frontmatter): docs/CONCEPTS.md (its sections and their
 * Known gaps), docs/THREAT-MODEL.md, docs/RLS.md, docs/DEPLOY.md, docs/SECURITY-AUDIT.md,
 * SECURITY.md, the CLAUDE.md Non-Negotiables and .claude/rules/*.md. Claim nothing they do not.
 * When the kit changes one of these, change the line here in the same commit as the re-sync.
 *
 * `href` is the site page that explains the mechanism: a concept page or a vendored security doc.
 */
export interface PostureItem {
	text: string
	href: string
}

export interface PostureGroup {
	id: string
	title: string
	icon: string
	tone: 'blue' | 'orange' | 'green' | 'purple' | 'cyan' | 'yellow' | 'red'
	items: PostureItem[]
}

const AUTH = '/concepts/auth/'
const TENANCY = '/concepts/tenancy/'
const DATABASE = '/concepts/database/'
const API = '/concepts/api/'
const FILES = '/concepts/email-and-files/'
const AI = '/concepts/ai/'
const PLUGINS = '/concepts/plugins/'
const DEPLOYMENT = '/concepts/deployment/'
const CLI = '/concepts/cli/'
const CONTRACTS = '/concepts/contracts/'
const FLAGS = '/concepts/feature-flags/'
const BACKGROUND = '/concepts/background-work/'
const THREAT_MODEL = '/security/threat-model/'
const AUDIT = '/security/audit/'

export const POSTURE: PostureGroup[] = [
	{
		id: 'sign-in',
		title: 'Sign-in and sessions',
		icon: 'lock',
		tone: 'blue',
		items: [
			{ text: 'A session is a database row with a 30-day sliding expiry, held in a `__Host-session` cookie that is HttpOnly, SameSite=Lax and Secure outside development.', href: AUTH },
			{ text: 'A blocked person is refused by every sign-in method, by the session check on each request and on their API keys.', href: PLUGINS },
			{ text: 'Magic links are 256-bit, single-use tokens that expire after 15 minutes and are stored only as SHA-256 hashes.', href: AUTH },
			{ text: 'Opening a magic link spends nothing. Only the confirm button, a same-origin POST, signs in, so a mail scanner that fetches every link cannot use one up.', href: AUTH },
			{ text: 'After five sign-in emails to one mailbox in 15 minutes, the request gets the same answer but nothing is minted or sent. Plus-tags, and dots in a Gmail address, count as the same mailbox.', href: AUTH },
			{ text: 'In production a magic-link URL is never written to the logs, even with no mail provider configured.', href: AUTH },
			{ text: 'Google, Microsoft and any OIDC issuer use the authorization-code flow with PKCE. The flow cookie is a `__Host-` cookie carrying the state, the PKCE verifier and a nonce.', href: AUTH },
			{ text: 'An OIDC issuer’s id_token is verified against its published keys (issuer, audience, expiry, nonce), and its discovery document is refused unless the issuer matches exactly.', href: AUTH },
			{ text: 'Accounts link by verified email only. An address the provider marks unverified cannot match or admit an account, and an OIDC issuer that does not assert verification is treated as unverified unless the operator opts that issuer in.', href: AUTH },
			{ text: 'A Microsoft work address is trusted only when its domain is one of the signing-in directory’s verified domains.', href: AUTH },
			{ text: 'Login routes have a KV sliding-window rate limit. Cookie requests pass a CSRF check against an origin allow-list.', href: AUTH },
			{ text: 'Dev login answers 404 in production.', href: AUTH },
			{ text: 'CLI login accepts only a loopback redirect, creates nothing until the person confirms in the browser, and the CLI ignores a callback without its random per-login state.', href: CLI },
			{ text: 'When a plugin says a domain requires single sign-on, every other sign-in method refuses that domain’s addresses, and a policy check that fails refuses rather than lets them through. Only the operator’s bootstrap admins are exempt.', href: AUTH },
			{ text: 'Identity webhooks are verified by signature over the raw body, with five minutes’ tolerance, and an event older than the row it would change is skipped.', href: AUTH },
		],
	},
	{
		id: 'tenancy',
		title: 'Organisations and tenancy',
		icon: 'building',
		tone: 'green',
		items: [
			{ text: 'The organisation comes from the signed-in session or key, never from the request. Background work takes it from a payload the server wrote and re-reads rows with it.', href: THREAT_MODEL },
			{ text: 'Every domain query filters by the organisation. A test fails any function that queries a tenant table without naming one, and each exception it allows carries a reason.', href: DATABASE },
			{ text: 'Every tenant table, a plugin’s included, carries a row-level security policy. A coverage test fails a tenant table without one, and a table without a tenant column unless its exclusion is listed with a reason.', href: DATABASE },
			{ text: 'A restricted document’s visibility is a SQL predicate added to the organisation filter, never put in its place. An empty grant list means owners and admins only, never everyone.', href: TENANCY },
			{ text: 'A row hidden from someone answers the same 404 as a row that does not exist.', href: TENANCY },
			{ text: 'Single and multi mode share one schema. In single mode every multi-organisation route answers 404.', href: TENANCY },
			{ text: 'New sign-ups are invite-only by default. Uninvited people wait on a pending page, and someone whose access request is pending or rejected cannot create an organisation.', href: TENANCY },
			{ text: 'A suspended organisation is refused on every path in: cookie, API key, websocket and the identity seam. Its sockets close, new agent runs are refused whoever asks, queued and waiting runs are cancelled, and a running one stops at its next cancellation check.', href: TENANCY },
			{ text: 'Plugins are told when an organisation is suspended or reactivated, so one that publishes outside the sign-in check can stop serving it.', href: PLUGINS },
			{ text: 'One person may own at most ten organisations by default, counted under a lock, on every path that grants ownership: creating one, a promotion and an accepted owner invitation.', href: TENANCY },
			{ text: 'Only an owner-level person may issue an owner invitation. An invitation is accepted only while its issuer could still issue it, and a role change or removal ends the invitations the person could no longer send.', href: TENANCY },
			{ text: 'Invitation email is capped: a five-minute resend cooldown, and daily limits per person and per organisation.', href: TENANCY },
			{ text: 'Deleting an organisation removes its database rows by cascade, then a job removes its stored files and runs each plugin’s clean-up.', href: TENANCY },
			{ text: 'Realtime sockets check the Origin, and removing a member, signing out, blocking someone or suspending an organisation closes the affected sockets. Events carry ids, and the page re-reads the data itself.', href: BACKGROUND },
		],
	},
	{
		id: 'api-keys',
		title: 'API keys and the CLI',
		icon: 'key',
		tone: 'orange',
		items: [
			{ text: 'Keys are stored hashed, expire and can be revoked.', href: AUTH },
			{ text: 'A key belongs to one organisation and acts with its creator’s role, and the role check still applies on top.', href: AUTH },
			{ text: 'Scopes are checked on every request: a read key may only GET, HEAD and OPTIONS, and an unknown scope is refused.', href: AUTH },
			{ text: 'A key cannot reach the admin area, which accepts a session cookie only.', href: CLI },
			{ text: 'A key cannot list or act in its creator’s other organisations, invitations or access requests. Beyond its organisation it reaches only its creator’s own profile.', href: AUTH },
			{ text: 'A key stops working in an organisation its creator no longer belongs to.', href: PLUGINS },
			{ text: 'The CLI keeps its key in a file only its user can read, and never prints a full key.', href: CLI },
			{ text: 'The CLI drops terminal control characters from server text before printing it.', href: CLI },
		],
	},
	{
		id: 'roles',
		title: 'Roles and permissions',
		icon: 'users',
		tone: 'purple',
		items: [
			{ text: 'Owner, admin, member and support are a CASL permission matrix checked on the server. “Your own row” is a query predicate, never a CASL condition.', href: TENANCY },
			{ text: 'Deleting an organisation and changing an owner need an explicit owner check, not a general manage permission.', href: TENANCY },
			{ text: 'The admin area is the only cross-organisation surface, behind a global-admin check.', href: TENANCY },
			{ text: 'Support enters an organisation as a real support membership its people can see. When the global-admin role goes, every support membership goes in the same transaction.', href: TENANCY },
			{ text: 'Memberships an identity provider manages are read-only in the app, and managed tenancy never grants owner or support.', href: TENANCY },
			{ text: 'Feature flags are configuration, never permissions, so a global admin’s full access does not switch one on. A disabled feature answers 404, and the release list is fail-closed.', href: FLAGS },
		],
	},
	{
		id: 'data',
		title: 'Data, secrets and files',
		icon: 'database',
		tone: 'cyan',
		items: [
			{ text: 'Tenant AI keys, OAuth tokens and plugin credentials are encrypted with AES-GCM under the deployment’s key.', href: AI },
			{ text: 'A stored credential is never returned or logged: the API answers whether one is set. Errors have secrets redacted.', href: AI },
			{ text: 'A stored AI key stays with the provider and base URL it was entered for. Changing either needs the key again.', href: AI },
			{ text: 'Files are stored under the organisation’s own prefix, and another organisation’s file answers 404.', href: FILES },
			{ text: 'File bytes stream through the Worker with no presigned URLs, and the browser can only name a file by its database row.', href: FILES },
			{ text: 'Uploads are checked for type and size per kind of upload.', href: FILES },
			{ text: 'Only allowlisted file types display in the browser; everything else downloads.', href: FILES },
			{ text: 'Request bodies are capped at 1 MB before any parsing. Upload paths allow up to 10 MB, and each upload route sets its own tighter limit.', href: API },
		],
	},
	{
		id: 'ai',
		title: 'AI and agents',
		icon: 'sparkles',
		tone: 'yellow',
		items: [
			{ text: 'One resolver is the only place model credentials are decrypted, and they never leave the server.', href: AI },
			{ text: 'Tools run with the access of the person asking, read when the tool runs. The model never chooses an organisation.', href: THREAT_MODEL },
			{ text: 'The server owns the chat transcript. The client sends only the new message, and tools sent by the client are refused.', href: AI },
			{ text: 'A tool that needs approval runs only in an agent run, never in chat, and an approval runs exactly the call the person was shown: that tool, those arguments or their edit, once.', href: AI },
			{ text: 'A tool can be refused by rule before it runs, and the model is told why.', href: AI },
			{ text: 'A tool that fetches the web reads only addresses the person wrote or its own search returned, so text in a page, document or email cannot point it elsewhere.', href: PLUGINS },
			{ text: 'Model output renders as Markdown with raw HTML off and links opened with `noopener`. Images show as links, so a model or document cannot make the browser fetch anything.', href: AI },
			{ text: 'Run details go to the people who may see that run, never over the organisation-wide socket.', href: AI },
			{ text: 'Thumbs feedback is accepted only on an answer the person can read. Another member’s thread is a 404, for admins too.', href: AI },
			{ text: 'Agent runs can be capped by tokens and cost per run, by a daily cost per organisation and by the number active at once. Every model call in a run is metered as it returns.', href: AI },
			{ text: 'While a cost cap applies to a model the deployment pays for, a call to a model with no known price is refused before it is made.', href: AI },
			{ text: 'Traces record prompts and completions only when the operator turns that on. Only admins can read traces, and they are kept 14 days by default.', href: AI },
		],
	},
	{
		id: 'web',
		title: 'The web surface',
		icon: 'globe',
		tone: 'blue',
		items: [
			{ text: 'Every return path after sign-in passes one rule: no control characters or backslashes, then same-origin only.', href: AUTH },
			{ text: 'Security headers are set early, so error responses carry them too. Framing is denied unless a route has proved the file is a PDF, and then only by the same origin.', href: FILES },
			{ text: 'CORS, CSRF and the websocket share one origin allow-list derived from the app’s URL.', href: API },
			{ text: 'Sign-in is checked per mount, so the public surface is a short list. An unknown API path answers a JSON 404, never the app’s HTML.', href: API },
			{ text: 'A plugin’s public site runs on its own hosts under a strict Content Security Policy: no script, frame, connection or form target unless declared, and inline script refused.', href: PLUGINS },
			{ text: 'On a public site’s host the app’s API, sign-in and websocket routes cannot be reached, the host comes from the request URL rather than a forwarded header, and a cached page is fetched without cookies or authorisation.', href: PLUGINS },
		],
	},
	{
		id: 'plugins',
		title: 'Plugins',
		icon: 'puzzle',
		tone: 'orange',
		items: [
			{ text: 'A plugin reaches the kit only through declared entries and the context it is handed. The plugin check refuses an import past them.', href: PLUGINS },
			{ text: 'Everything a plugin adds carries its id: tables, jobs, routes, query keys and events, never `kit.`. Two plugins declaring one table fails the check.', href: PLUGINS },
			{ text: 'A plugin’s tenant table must carry an isolation test, and the check refuses one without. A plugin that adds its own query surface owns the test that proves it stays in one organisation.', href: THREAT_MODEL },
			{ text: 'Public plugin routes live only under `/api/hooks/<id>`, rate-limited per IP and body-capped before the plugin runs, and get no organisation until the handler proves the caller.', href: PLUGINS },
			{ text: 'Plugin routes that need sign-in are mounted after the kit’s, so a plugin cannot shadow a kit route.', href: API },
			{ text: 'Signed state is HMAC with a purpose and an expiry, and the kit gives a callback one call that re-checks the person’s membership, role, block and organisation status.', href: PLUGINS },
			{ text: 'A plugin signs people in through the identity seam and never writes a session. Linking by email needs a proved domain, and the operator’s bootstrap admins are never created or linked through it.', href: PLUGINS },
			{ text: 'An event emitted in a request’s context cannot name another organisation, and its payload is re-read under the organisation filter on delivery.', href: PLUGINS },
			{ text: 'A plugin’s skills cannot shadow the kit’s, and its coding-agent hooks may only run scripts the plugin ships.', href: PLUGINS },
		],
	},
	{
		id: 'engineering',
		title: 'How the code is kept this way',
		icon: 'terminal',
		tone: 'green',
		items: [
			{ text: 'Contracts first: every API input and output is a zod schema shared by the server, UI and CLI, and routes validate input against it.', href: CONTRACTS },
			{ text: 'Secrets never go in a config file, in git or in a response. gitleaks scans the full history in CI, and only test fixtures are allowlisted, by path and pattern.', href: DEPLOYMENT },
			{ text: 'Provisioning tokens never reach the Worker, and every line the provisioning scripts print is redacted.', href: DEPLOYMENT },
			{ text: 'The Worker code may not read `process.env` or use Node-only APIs, and the build fails if it does.', href: API },
			{ text: 'Staging and production use different names for account-wide resources, and a parity test refuses a collision, so one environment cannot run against the other’s data.', href: DEPLOYMENT },
			{ text: 'An optional external deployer lets CI deploy with no Cloudflare token and no database credential.', href: DEPLOYMENT },
			{ text: 'The gate (lint, typecheck, test, build) passes before every commit and is the same command CI runs.', href: DATABASE },
			{ text: 'Each fixed audit finding keeps its proof as a permanent regression test, named for the behaviour.', href: AUDIT },
			{ text: 'Findings stay outside the repository until the fix ships, and a fix commit describes the behaviour, not the attack.', href: AUDIT },
		],
	},
]

/**
 * "Where the design stops": the Known gaps a security reader should weigh. Same rule: each is
 * stated in the kit's docs.
 */
export const GAPS: PostureItem[] = [
	{ text: 'Row-level security ships switched off, and the trial that would let you turn it on has not been run. Isolation is the query filter alone: one missed filter would be a cross-organisation read, and the tests are what catch it.', href: DATABASE },
	{ text: 'The unscoped-query test does not prove the admin area is the only cross-organisation surface.', href: DATABASE },
	{ text: 'A plugin runs in the same Worker with no sandbox, review or signing, so installing one is as trusting as merging its code. The isolation check proves a test exists, not that it is right.', href: PLUGINS },
	{ text: 'The kit takes a plugin’s word for the identity it signs in: subject, email, verification and organisation.', href: AUTH },
	{ text: 'Rate limits are approximate sliding windows in KV and do nothing when the KV binding is missing. On plugin routes they are keyed by IP, so senders behind one address share a limit.', href: AUTH },
	{ text: 'Chat has no spend cap: budgets and the daily cap cover agent runs only. A budget is checked before a call, so a run can go over by its last call, and the active-run cap can be overshot in a burst.', href: AI },
	{ text: 'There is no audit log beyond the activity feed, and the activity feed has no retention limit.', href: TENANCY },
	{ text: 'Group restrictions cover knowledge documents only. Agent runs, prompts and other files have none.', href: TENANCY },
	{ text: 'Keys belong to an organisation (there are no personal keys), CLI logout does not revoke the key, and the only session control in the UI is “log out everywhere”.', href: AUTH },
	{ text: 'With one OIDC issuer there is no back-channel logout. Without the identity webhook, a removal at the issuer waits for the next sign-in or the session’s end, and suspending a person at the issuer does not revoke their API keys in organisations they joined by hand.', href: AUTH },
	{ text: 'Turning on required single sign-on does not end sessions or API keys that already exist.', href: AUTH },
	{ text: 'Signed plugin state has no replay ledger: a token is reusable until it expires unless the plugin records it.', href: PLUGINS },
	{ text: 'Code behind a feature flag still ships in the bundle; the server is the protection.', href: FLAGS },
	{ text: 'Shared platform documents can be read by every organisation by design, so no tenant data may go in one.', href: PLUGINS },
	{ text: 'Deployed configuration, your Cloudflare account and your secrets are yours to get right. The audit reads code.', href: AUDIT },
]

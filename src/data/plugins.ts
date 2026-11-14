/**
 * The first-party plugins, in catalogue order — one list that the catalogue
 * (/plugins/), the tour and the personas all read, so no plugin is described
 * twice in two places that can drift apart.
 *
 * A Rocketflare plugin is a git repository *copied into* an app, never an npm
 * package (see /concepts/plugins/). So the version here is the plugin's own
 * release, `minKit` is the oldest kit release its manifest accepts, and the
 * install command is the repository URL at a tag.
 *
 * Every field is transcribed from the plugin's own `rocketflare-plugin.json`
 * and README — update them together.
 *
 * A commercial plugin (`availability: 'partners'`) lives in a private repository that partners
 * are given access to. It has no repository, changelog or README fields at all, so nothing here
 * can link to that repository, sync its README or print a public install command for it.
 */
/**
 * What /plugins/ groups the open-source catalogue by: the capability a plugin gives an app, so a
 * reader looking for "connect our accounting" finds FreeAgent beside Connectors, not by release
 * order. Each group's tone colours its icon chips.
 */
export const PLUGIN_GROUPS = [
	{ key: 'knowledge', title: 'Search and knowledge', lede: 'Help people and the assistant find things: across the app, on the web, and in a guide to the app itself.', tone: 'blue' },
	{ key: 'connect', title: 'Connect your other systems', lede: 'Bring in what already lives elsewhere: a Microsoft 365 directory and calendars, your accounts, inbound email.', tone: 'cyan' },
	{ key: 'insight', title: 'Insight and feedback', lede: 'See how the app is used and hear what people want from it next.', tone: 'orange' },
	{ key: 'build', title: 'Write your own', lede: 'The reference plugin ships inside the kit: one small, complete example of every slot the seam has.', tone: 'green' },
] as const
export type PluginGroupKey = (typeof PLUGIN_GROUPS)[number]['key']

interface PluginBase {
	/** The id in `rocketflare-plugin.json`, the folder name, and the `#anchor` on /plugins/. */
	id: string
	/** The manifest's `label`. */
	label: string
	/** The manifest's `minKit`: the oldest kit release it installs into. */
	minKit: string
	/** The plugin's own latest release. */
	version: string
	/**
	 * Whether a fresh clone already has it: in the kit's `.rocketflare.json`
	 * `defaultPlugins`, so the bootstrap installs it (`installed`); vendored in
	 * the kit's own tree (`vendored`); or not at all — you add it when you want
	 * it (`optional`).
	 */
	shipsAs: 'installed' | 'vendored' | 'optional'
	/** One sentence: what it is for. */
	summary: string
	/** What installing it adds, each `<strong>Label</strong> — one sentence`. */
	adds: string[]
	/** Plugin ids that must be installed first (the manifest's `requires.plugins`). */
	requires?: string[]
	/** The concept page that explains it, when it has one. */
	concept?: string
	/** The agent skills it installs into `.claude/skills/` (the manifest's `skills`). */
	skills?: string[]
	/**
	 * `false` when the manifest's `schema.tables` is empty: no migration to generate after install,
	 * so the page must not say there is one. Absent means it has tables.
	 */
	tables?: false
	/** The capability it is listed under on /plugins/ (a `PLUGIN_GROUPS` key). */
	group: PluginGroupKey
	/** Its glyph on the catalogue card: a name `ConceptIcon` draws. */
	icon: string
	/** Who built it, when that is not the Rocketflare team — credited on the card and the page. */
	contributedBy?: { name: string; url: string }
}

/** A plugin anyone can install from a public repository, MIT licensed. */
export interface PublicPlugin extends PluginBase {
	availability?: 'public'
	/** The repository the plugin is copied from. */
	repo: string
	/** Human form of the repo, for a link's text. */
	repoLabel: string
	/**
	 * Where the plugin sits inside its repository, when it is not the root of one. A repository may
	 * hold several plugins released in lockstep, so the install command needs the directory as well
	 * as the tag.
	 */
	subdir?: string
	/** The plugin's own changelog. */
	changelogUrl: string
	/** Its README or docs, when that is a different page from the repo root. */
	docsUrl?: string
	/**
	 * The plugin's README, repository-relative. `npm run sync:plugins` copies it into
	 * `src/content/plugins/<id>.md`, and /plugins/<id>/ renders it below the facts. Absent for a
	 * plugin with no README (the vendored one); the build fails when it is set and not synced.
	 */
	readme?: string
}

/**
 * A commercial plugin, available to Rocketflare partners only: proprietary, in a private
 * repository. The site names no repository for it — not its URL, not an install command — and
 * sends the reader to /partners/ instead.
 */
export interface PartnerPlugin extends PluginBase {
	availability: 'partners'
	/** The npm packages it adds to the app, `name version`. */
	dependencies?: string[]
	repo?: never
	repoLabel?: never
	subdir?: never
	changelogUrl?: never
	docsUrl?: never
	readme?: never
}

export type Plugin = PublicPlugin | PartnerPlugin

const PLUGINS_REPO = 'https://github.com/rocketflare-dev/rocketflare-plugins'
const KIT_REPO = 'https://github.com/rocketflare-dev/rocketflare'

export const PLUGINS: Plugin[] = [
	{
		id: 'analytics',
		group: 'insight',
		icon: 'chart',
		label: 'Analytics',
		repo: PLUGINS_REPO,
		repoLabel: 'rocketflare-dev/rocketflare-plugins',
		subdir: 'plugins/analytics',
		minKit: '0.29.0',
		version: '3.12.0',
		shipsAs: 'optional',
		summary:
			'Dashboards, cubes, fact tables and the drizzle-cube query API — everything that used to be part of the kit, now a repository of its own.',
		adds: [
			'<strong>Dashboards</strong> — one row per dashboard, stored whole as JSON, with a unique slug per organisation and the option to restrict it to a group. A list page, a view page with inline editing and autosave, and an explore page.',
			'<strong>Templates</strong> — one ships, Organisation Overview, copied into every organisation when it is created and repaired lazily on every read, so a template added later still reaches the customers you already have.',
			'<strong>Cubes</strong> — <code>ActivityEvents</code>, <code>TenantActivityDaily</code>, <code>TenantUsers</code> and <code>Users</code>, served at <code>/cubejs-api</code> and <code>/mcp</code>. Every cube scopes its own query by organisation.',
			'<strong>Fact tables</strong> — <code>analytics_tenant_activity_daily_facts</code>, rebuilt one organisation at a time by an hourly schedule, in one transaction each.',
			'<strong>Permissions</strong> — a dashboard subject (admin and above manage, members read) and an analytics subject (every role reads; the query API is read-only by nature).',
			'<strong>Commands</strong> — <code>rocketflare analytics pages list</code>, <code>check-facts</code> (exit 1 when a table is stale) and <code>refresh-facts</code>.',
			'<strong>Four agent skills</strong> — <code>analytics</code> checks the plugin is healthy and routes; <code>analytics-cubes</code> adds measures, cubes and fact tables with the isolation test; <code>analytics-queries</code> queries the cubes and connects Claude Code or Claude Desktop to <code>/mcp</code>; <code>analytics-dashboards</code> builds, shares and templates dashboards.',
		],
		concept: 'analytics',
		changelogUrl: `${PLUGINS_REPO}/blob/main/CHANGELOG.md`,
		docsUrl: `${PLUGINS_REPO}/tree/main/plugins/analytics`,
		readme: 'plugins/analytics/README.md',
		skills: ['analytics', 'analytics-cubes', 'analytics-queries', 'analytics-dashboards'],
	},
	{
		id: 'web-knowledge',
		group: 'knowledge',
		icon: 'globe',
		label: 'Web knowledge',
		repo: PLUGINS_REPO,
		repoLabel: 'rocketflare-dev/rocketflare-plugins',
		subdir: 'plugins/web-knowledge',
		minKit: '0.9.0',
		version: '3.12.0',
		shipsAs: 'optional',
		summary:
			'Lets agents and chat search the public web and read pages, on each organisation’s own search key — and only for the organisations that turn it on.',
		adds: [
			'<strong>Five providers</strong> — Tavily, Brave Search, Exa, Serper and Firecrawl. Each organisation picks one and brings its own key, so the provider bills the customer rather than you.',
			'<strong>Two agent tools</strong> — <code>web_search</code> for ranked results with URLs, and <code>fetch_page</code> to read one page as text, a window at a time. An organisation without search turned on is never offered either, so a model is never shown a tool that could only fail.',
			'<strong>A settings tab</strong> — Settings → Web search: choose the provider, paste the key, test it live, and the first key turns search on. Members see it read-only.',
			'<strong>A sealed key</strong> — <code>web_search_settings</code>, one row per organisation with the same row-level-security policy as everything else. The key is encrypted at rest and never sent back to the browser.',
			'<strong>Guard rails</strong> — <code>fetch_page</code> refuses localhost, IP addresses and private hostnames and checks every redirect again, and page text reaches the model marked as untrusted.',
			'<strong>A command</strong> — <code>rocketflare web-knowledge status</code>, read-only, because a key does not belong in shell history.',
		],
		changelogUrl: `${PLUGINS_REPO}/blob/main/CHANGELOG.md`,
		docsUrl: `${PLUGINS_REPO}/tree/main/plugins/web-knowledge`,
		readme: 'plugins/web-knowledge/README.md',
	},
	{
		id: 'connectors',
		group: 'connect',
		icon: 'link',
		label: 'Connectors',
		repo: PLUGINS_REPO,
		repoLabel: 'rocketflare-dev/rocketflare-plugins',
		subdir: 'plugins/connectors',
		minKit: '0.29.0',
		version: '3.12.0',
		shipsAs: 'optional',
		summary:
			'Connects an organisation’s own Microsoft 365 to your app: an admin grants consent once, and its directory and calendars sync in. It holds the rows, routes and schedules; a provider plugin (today, m365) does the talking.',
		adds: [
			'<strong>A connection per organisation</strong> — Settings → Connections: pick a provider, send the organisation’s admin through consent, and watch the sync. Disconnecting deletes everything that was synced.',
			'<strong>The directory and calendars</strong> — people, groups and memberships, plus the calendars of people who are members of your app, matched to them by email. Members see only their own events; admins see everyone’s.',
			'<strong>Delta sync on a schedule</strong> — every 15 minutes, each resource resumes from where the provider’s own change feed left off, with a claim row so two runs never sync the same thing at once.',
			'<strong>Seven tables</strong> — installations, connections, sync cursors, users, groups, memberships and events, each with the same row-level-security policy as everything else. Secrets are encrypted at rest and never sent back.',
			'<strong>Commands</strong> — <code>rocketflare connectors status</code> for counts and sync progress, and <code>rocketflare connectors sync</code> to run one now.',
			'<strong>An agent skill</strong> — <code>connectors</code> registers the Entra app for you with the Azure CLI, stores the secret without printing it, walks a customer’s admin through consent, and turns an <code>AADSTS</code> error into the fix.',
		],
		concept: 'connectors',
		changelogUrl: `${PLUGINS_REPO}/blob/main/CHANGELOG.md`,
		docsUrl: `${KIT_REPO}/blob/0.12.0/docs/CONNECTORS.md`,
		readme: 'plugins/connectors/README.md',
		skills: ['connectors'],
	},
	{
		id: 'm365',
		group: 'connect',
		icon: 'building',
		label: 'Microsoft 365',
		repo: PLUGINS_REPO,
		repoLabel: 'rocketflare-dev/rocketflare-plugins',
		subdir: 'plugins/m365',
		minKit: '0.29.0',
		version: '3.12.0',
		shipsAs: 'optional',
		summary:
			'Microsoft 365 as a provider for the connectors plugin, which it requires — install connectors first. One multi-tenant Entra app for your whole deployment; each customer’s admin consents to it once.',
		adds: [
			'<strong>Admin consent, once</strong> — a customer’s admin clicks Connect, consents in Microsoft’s own screen, and is sent back. No app registration on their side, no secret to paste.',
			'<strong>App-only access</strong> — a client-credentials token per organisation, cached encrypted, with read-only permissions for users, groups and calendars.',
			'<strong>Graph delta queries</strong> — users, groups with their memberships, and each member’s calendar over a rolling window from 30 days back to 90 ahead. A throttled call waits as long as Microsoft asks; an expired change token starts a full pass.',
			'<strong>Two secrets</strong> — <code>M365_CLIENT_ID</code> and <code>M365_CLIENT_SECRET</code>, your Entra app. An organisation can bring its own app instead.',
		],
		requires: ['connectors'],
		concept: 'connectors',
		changelogUrl: `${PLUGINS_REPO}/blob/main/CHANGELOG.md`,
		docsUrl: `${PLUGINS_REPO}/tree/main/plugins/m365`,
		readme: 'plugins/m365/README.md',
		tables: false,
	},
	{
		id: 'issue-reports',
		group: 'insight',
		icon: 'message',
		label: 'Issue reports',
		repo: PLUGINS_REPO,
		repoLabel: 'rocketflare-dev/rocketflare-plugins',
		subdir: 'plugins/issue-reports',
		minKit: '0.29.0',
		version: '3.12.0',
		shipsAs: 'optional',
		summary:
			'Ideas & issues: anyone on the team talks a bug or an idea through with an agent, which asks until it is clear and logs it on GitHub once they approve the draft.',
		adds: [
			'<strong>An Ideas & issues page</strong> — under Feedback in the sidebar: describe a problem or an idea in your own words, answer the agent’s questions one at a time, review the draft, and see the conversations you have shared.',
			'<strong>An agent that asks before it files</strong> — <code>issue-reports</code> asks plain-language questions until it understands what the person needs, searches the repository for an existing issue, and files nothing until they pick Log it on GitHub. A confirmed duplicate becomes a comment on the existing issue.',
			'<strong>No tables</strong> — each conversation is one agent run, parked on the person’s answers, so the run is the record and there is no migration. Many conversations can be in progress at once.',
			'<strong>Safe to retry</strong> — every question and the filing are keyed by round, so a replayed or retried step never asks twice or opens the issue twice.',
			'<strong>GitHub over plain fetch</strong> — four REST calls and no Octokit, on a fine-grained token with Issues access to one repository. The token never appears in an error, a log line, a response or a prompt.',
			'<strong>A prompt you can override</strong> — <code>issue-reports</code>, per organisation in Settings → Prompts, with its model chosen in Settings → agent models. Its model calls land in the usage ledger.',
		],
		changelogUrl: `${PLUGINS_REPO}/blob/main/CHANGELOG.md`,
		docsUrl: `${PLUGINS_REPO}/tree/main/plugins/issue-reports`,
		readme: 'plugins/issue-reports/README.md',
		tables: false,
		contributedBy: { name: 'Mosaic Data', url: 'https://mosaicdata.ai/' },
	},
	{
		id: 'freeagent',
		group: 'connect',
		icon: 'receipt',
		label: 'FreeAgent',
		repo: PLUGINS_REPO,
		repoLabel: 'rocketflare-dev/rocketflare-plugins',
		subdir: 'plugins/freeagent',
		minKit: '0.29.0',
		version: '3.12.0',
		shipsAs: 'optional',
		summary:
			'Mirrors each organisation’s FreeAgent company (UK accounting) into your app, for pages, agents, analytics and the plugins you build on top. An admin approves it once, over OAuth.',
		adds: [
			'<strong>A connection per organisation</strong> — Settings → FreeAgent: one company each, approved once over OAuth, with its tokens stored sealed. A refused refresh token marks the connection as needing to be reconnected.',
			'<strong>Incremental sync</strong> — every 30 minutes, after connecting and on Sync now: bank accounts, transactions, explanations, categories, contacts, bills and invoices. The first sync reaches back about 400 days.',
			'<strong>A FreeAgent page</strong> — unexplained transactions and invoices, with an overdue filter. Every member can see it; owners and admins connect, disconnect and sync.',
			'<strong>Agent tools</strong> — five that read the mirror, and two that write: <code>freeagent_explain_transaction</code> and <code>freeagent_create_bill</code>, offered only to admins and waiting for a person to approve each call.',
			'<strong>A service API and an extension</strong> — other plugins explain transactions, attach receipts and create bills through exported functions, and hear about every sync through <code>freeagent:sync-listeners</code>.',
			'<strong>Analytics cubes</strong> — when the analytics plugin is installed: spend and income by month and category, unexplained count and amount, outstanding and overdue. Inert without it.',
			'<strong>Nine tables</strong> — a connection, a sync state and seven mirror tables, all with row-level security, and money stored as <code>numeric</code>.',
			'<strong>Commands and a skill</strong> — <code>rocketflare freeagent status</code> and <code>sync</code>, and <code>/freeagent</code>, which walks through registering the app, secrets, connecting and troubleshooting.',
		],
		changelogUrl: `${PLUGINS_REPO}/blob/main/CHANGELOG.md`,
		docsUrl: `${PLUGINS_REPO}/tree/main/plugins/freeagent`,
		readme: 'plugins/freeagent/README.md',
		skills: ['freeagent'],
	},
	{
		id: 'inbox',
		group: 'connect',
		icon: 'inbox',
		label: 'Inbox',
		repo: PLUGINS_REPO,
		repoLabel: 'rocketflare-dev/rocketflare-plugins',
		subdir: 'plugins/inbox',
		minKit: '0.29.0',
		version: '3.12.0',
		shipsAs: 'optional',
		summary:
			'Inbound email for your app: forward receipts, invoices and notices to an address on your domain, and they arrive parsed, with their attachments, ready for other plugins to act on.',
		adds: [
			'<strong>An address per organisation</strong> — mail reaches the Worker through Cloudflare Email Routing. Each organisation picks a local part, and <code>receipts+anything@</code> reaches it too.',
			'<strong>Checked before it is accepted</strong> — against the organisation’s sender allow-list and the SPF, DKIM and DMARC verdicts Cloudflare recorded. Anything refused is bounced with a reason the forwarding mailbox shows.',
			'<strong>An Inbox page</strong> — messages, sender and forwarder, authentication verdicts, text body and attachments, with reprocess and delete. Settings → Inbox holds the address, the allow-list and the on/off switch.',
			'<strong>Forwards split apart</strong> — each email forwarded as an attachment becomes a message of its own, linked to the forward it came in. Gmail and Proton forwarding confirmations are let through, with their code and link shown.',
			'<strong>Searchable from chat</strong> — each message and its PDF, Office, HTML and text attachments are indexed into the knowledge base, which it needs the kit’s knowledge surface for. Switchable in Settings.',
			'<strong>Agent tools and an extension</strong> — <code>inbox_list_messages</code> and <code>inbox_get_message</code>, both read-only, and <code>inbox:consumers</code> so a plugin is called once per parsed message.',
			'<strong>Three tables and R2</strong> — settings, messages and attachments, all with row-level security. The bytes live in R2 per organisation and are purged with it.',
			'<strong>Commands and a skill</strong> — <code>rocketflare inbox list</code> and <code>status</code>, and <code>/inbox</code>, which covers Email Routing setup, forwarding, testing and troubleshooting.',
		],
		changelogUrl: `${PLUGINS_REPO}/blob/main/CHANGELOG.md`,
		docsUrl: `${PLUGINS_REPO}/tree/main/plugins/inbox`,
		readme: 'plugins/inbox/README.md',
		skills: ['inbox'],
	},
	{
		id: 'guide',
		group: 'knowledge',
		icon: 'document',
		label: 'User guide',
		repo: PLUGINS_REPO,
		repoLabel: 'rocketflare-dev/rocketflare-plugins',
		subdir: 'plugins/guide',
		minKit: '0.31.0',
		version: '3.12.0',
		shipsAs: 'optional',
		summary:
			'An in-app user guide about your app itself: your coding agent writes it from the code, a Claude Code hook says when a change may have made it stale, and members search it and ask it questions from any screen.',
		adds: [
			'<strong>A guide reader</strong> — <code>/guide</code>: contents with search, the page and Ask the Guide side by side, with a User guide nav item and Home link. Admin pages are invisible to members: not in the contents, a 404 by URL and never in search.',
			'<strong>Ask the Guide</strong> — a <strong>?</strong> button in the header, or the <kbd>?</kbd> key, opens it over any screen. It answers from the guide only, knows which screen you asked from, and cites the sections it used.',
			'<strong>Search by meaning</strong> — each section is stored once as platform knowledge, the same for every organisation and always embedded, so search is semantic as well as keyword. Chat and agents can search the guide too.',
			'<strong>Pages you own</strong> — markdown in <code>docs/guide/</code>, seeded with four starter pages and never touched by an upgrade. Each page names the code it describes and the commit it was last checked at.',
			'<strong>A skill</strong> — <code>/guide</code> with <code>init</code>, <code>write</code>, <code>sync</code> and <code>audit</code>: your coding agent writes the pages from your screens and routes, a separate sub-agent fact-checks them, and sync rewrites only what changed.',
			'<strong>A stale-docs hook</strong> — a Claude Code Stop hook that prints one line when a session changed code a guide page describes, so the guide is swept before the commit rather than after a customer notices.',
		],
		changelogUrl: `${PLUGINS_REPO}/blob/main/CHANGELOG.md`,
		docsUrl: `${PLUGINS_REPO}/tree/main/plugins/guide`,
		readme: 'plugins/guide/README.md',
		skills: ['guide'],
		tables: false,
	},
	{
		id: 'global-search',
		group: 'knowledge',
		icon: 'search',
		label: 'Global search',
		repo: PLUGINS_REPO,
		repoLabel: 'rocketflare-dev/rocketflare-plugins',
		subdir: 'plugins/global-search',
		minKit: '0.31.0',
		version: '3.12.0',
		shipsAs: 'optional',
		summary:
			'One ⌘K palette to go anywhere, run a command or find anything a person may see in your app — people, agents, chats and documents — and any installed plugin can add its own results and commands.',
		adds: [
			'<strong>A ⌘K palette</strong> — from any page, or the search box in the header: keyboard navigation, recent items, and a Search everything link to <code>/search/all</code>, the full ranked list with filters by kind.',
			'<strong>Instant Go to and Commands</strong> — every page and settings tab you may open, and commands such as New chat and Invite people, matched in the browser as you type, with no request.',
			'<strong>Four providers</strong> — people for owners and admins, agents, your own chats, and documents through the kit’s keyword-and-meaning search, each behind the permission of the page it opens.',
			'<strong>Fused ranking</strong> — Reciprocal Rank Fusion over every provider’s list, with optional re-ranking of the top 50 by a Cohere, Voyage AI, Fireworks AI or compatible endpoint on the organisation’s own key, set in Settings → Search.',
			'<strong>An extension point</strong> — another plugin adds results by declaring a provider and commands by declaring them on its UI entry, without importing this one, so an app without it still compiles.',
			'<strong>One table</strong> — <code>global_search_settings</code>, one row per organisation with row-level security. The re-ranker key is sealed at rest and never sent back.',
		],
		changelogUrl: `${PLUGINS_REPO}/blob/main/CHANGELOG.md`,
		docsUrl: `${PLUGINS_REPO}/tree/main/plugins/global-search`,
		readme: 'plugins/global-search/README.md',
	},
	{
		id: 'sso',
		group: 'connect',
		icon: 'key',
		label: 'Single sign-on (SAML + SCIM)',
		availability: 'partners',
		minKit: '0.29.0',
		version: '0.7.1',
		shipsAs: 'optional',
		summary:
			'SAML sign-in and SCIM provisioning for each organisation, against its own identity provider: verify the email domain, require SSO for it, and let the directory add, change and remove the people.',
		adds: [
			'<strong>A SAML 2.0 service provider</strong> — native, with no broker in between. Sign-in starts from your app; an organisation imports its identity provider’s metadata as XML or from a URL. IdP-initiated sign-in is there too, off by default.',
			'<strong>Hardened verification</strong> — the identity provider’s certificate is pinned when the connection is saved, and the one inside a response is never trusted. Signature wrapping is refused, every sign-in request is single-use, a replayed assertion is caught, and the audience, recipient and time window are all checked.',
			'<strong>Verified email domains</strong> — an organisation proves it owns a domain with a DNS TXT record — <code>_rocketflare-sso.example.com</code> for <code>example.com</code> — checked over DNS-over-HTTPS. One domain belongs to one organisation.',
			'<strong>SSO required</strong> — set per verified domain. Those addresses can then no longer sign in by magic link, Google, Microsoft, OIDC or dev login. Bootstrap admins stay exempt, so there is always a way back in.',
			'<strong>SCIM 2.0 provisioning</strong> — in both the Okta and the Entra dialect: users created and updated, groups pushed and mapped to roles. Deactivating someone removes their membership and ends their sessions at once.',
			'<strong>Sign in with SSO</strong> — on the login page: type an email, and its domain finds the organisation’s identity provider.',
			'<strong>Eight tables</strong> — all prefixed <code>sso_</code>, with the migration generated by the host. It works in both tenancy modes, multi and single.',
			'<strong>Tried against real providers</strong> — verified live against Okta, for SAML and SCIM, and against Mock SAML. Its README has setup guides for Okta, Microsoft Entra ID and Google Workspace.',
		],
		dependencies: ['xml-crypto 6.4.0', '@xmldom/xmldom 0.9.12'],
	},
	{
		id: 'sites',
		group: 'build',
		icon: 'window',
		label: 'Sites',
		availability: 'partners',
		minKit: '0.36.0',
		version: '0.7.1',
		shipsAs: 'optional',
		summary:
			'Public websites run from your app: pages in several languages, edited visually inside the app and served from the same Worker on hosts of their own, from blocks and a theme your developers own in code.',
		adds: [
			'<strong>Sites on their own hosts</strong> — <code>www.example.com</code> and <code>docs.example.com</code> beside the app, from the same Worker. Pages are rendered on the server, cached at the edge and kept in R2: a visit that misses the edge cache still makes no database query, the last good page is served if the database is down, and a publish is live within about a minute.',
			'<strong>A strict CSP on every page</strong> — by default a page loads no script. Site CSS is a build of its own, and the public CSP refuses the admin bundle.',
			'<strong>A visual editor</strong> — Puck, inside the app: type on the canvas, switch between desktop, tablet and phone, change language from the toolbar, and publish now, on a schedule or through a review.',
			'<strong>Pages in several languages</strong> — each with its own translated slug, SEO fields and <code>hreflang</code>. AI translation writes a draft in the background and asks before it replaces anyone’s edits.',
			'<strong>Blocks and themes in code</strong> — <code>defineBlock</code> and <code>defineSite</code> in a directory the app owns, which a plugin upgrade never touches. Reusable elements, header and footer regions, menus, templates and redirects on top.',
			'<strong>Media and site settings</strong> — images through Cloudflare Images, from a library per site and one shared across sites, and a favicon and social-sharing image for the whole site chosen from them.',
			'<strong>A forms library</strong> — forms built once and placed on any page, with conditions, steps, file uploads and text in every language. They sit behind Turnstile, work without JavaScript, and each submission can start an agent.',
			'<strong>Collections</strong> — lists your editors keep up to date, such as offices or a price list, with the fields defined in code. Entries are translated and published like pages, and can fill a form’s options.',
			'<strong>Knowledge and types to build on</strong> — published pages go into the knowledge base, so chat can answer from the site, and every contract, schema and event payload is exported for the app’s own code.',
			'<strong>An AI page builder</strong> — Build with AI writes a new draft from a description, from the site’s own blocks, library images and knowledge. It never publishes.',
			'<strong>A CLI and eight agent skills</strong> — <code>rocketflare sites</code> for export, import (and publish), audit and authoring; skills for Claude Code that set a site up, copy a design, migrate an existing site live, write pages, and build forms and collections.',
		],
		skills: [
			'sites-setup',
			'sites-copy-design',
			'sites-migrate',
			'sites-new-page',
			'sites-forms',
			'sites-migrate-forms',
			'sites-collections',
			'sites-form-component',
		],
		dependencies: [
			'@dnd-kit/react 0.4.0',
			'@puckeditor/core 0.24.0',
			'@tiptap/core 3.33.0',
			'@tiptap/pm 3.33.0',
			'@tiptap/react 3.33.0',
			'@tiptap/starter-kit 3.33.0',
		],
	},
	{
		id: 'example-feature',
		group: 'build',
		icon: 'puzzle',
		label: 'Example feature',
		repo: KIT_REPO,
		repoLabel: 'rocketflare-dev/rocketflare',
		minKit: '0.8.0',
		version: '0.1.0',
		shipsAs: 'vendored',
		summary:
			'The reference plugin: a notes list that touches every slot the seam has, so you can read one small thing instead of a large one. It ships in the kit and exists to be deleted.',
		adds: [
			'<strong>A table</strong> — <code>example_notes</code>, organisation-scoped with the same row-level-security policy as everything else, and its migration generated by the host.',
			'<strong>A gated route</strong> — <code>/api/example-feature</code> behind a feature flag, on the mount rather than route by route, answering 404 rather than 403 when the flag is off.',
			'<strong>A job, an agent tool and two hooks</strong> — the shortest job handler in the repository, a tool on every agent run, a welcome note for a new organisation and two more for the demo seed.',
			'<strong>A page and two commands</strong> — a nav item and a lazy route sharing one guard with the mount, plus <code>rocketflare example-feature ping</code> and <code>… notes list</code>.',
			'<strong>Its own tests</strong> — API, UI and config, discovered by the host, including the one that proves one organisation cannot read another’s notes.',
			'<strong>A skill</strong> — <code>example-feature</code>, which walks your coding agent through the flag, the notes, the queued ping job and the signed public link, so you can see each slot work before you delete it.',
		],
		changelogUrl: `${KIT_REPO}/blob/main/CHANGELOG.md`,
		docsUrl: `${KIT_REPO}/blob/main/apps/web/src/plugins/example-feature/CLAUDE.md`,
		skills: ['example-feature'],
	},
]

export const pluginById = (id: string) => {
	const p = PLUGINS.find((x) => x.id === id)
	if (!p) throw new Error(`Unknown plugin id: ${id}`)
	return p
}

/** A commercial plugin: partners only, from a private repository the site never names. */
export const isPartnerOnly = (p: Plugin): p is PartnerPlugin => p.availability === 'partners'

/**
 * A plugin that must be public — for a page that links its repository or prints its install
 * command. Throws for a commercial one, so such a page fails the build instead of linking nowhere.
 */
export const publicPluginById = (id: string): PublicPlugin => {
	const p = pluginById(id)
	if (isPartnerOnly(p)) throw new Error(`Plugin '${id}' is partners-only and has no public repository`)
	return p
}

/**
 * The command that installs a plugin — the repository at its tag. A vendored
 * plugin has none: it is already in the tree. Nor does a commercial one: its
 * repository is private, and its page sends the reader to /partners/ instead.
 */
export const installCommand = (p: Plugin) =>
	isPartnerOnly(p) || p.shipsAs === 'vendored'
		? null
		: `pnpm plugin add ${p.repo}.git@${p.version}${p.subdir ? ` --subdir ${p.subdir}` : ''}`

/** The plugin's page on this site. */
export const pluginPath = (p: Plugin | string) => `/plugins/${typeof p === 'string' ? p : p.id}/`

/** How many first-party plugins there are — use this, never a literal, in copy. */
export const PLUGIN_COUNT = PLUGINS.length

/** The catalogue's two groups: MIT and installable by anyone, or commercial and for partners. */
export const OPEN_SOURCE_PLUGINS = PLUGINS.filter((p): p is PublicPlugin => !isPartnerOnly(p))
export const COMMERCIAL_PLUGINS = PLUGINS.filter(isPartnerOnly)

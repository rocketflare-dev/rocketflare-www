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
 */
export interface Plugin {
	/** The id in `rocketflare-plugin.json`, the folder name, and the `#anchor` on /plugins/. */
	id: string
	/** The manifest's `label`. */
	label: string
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
	/** The plugin's own changelog. */
	changelogUrl: string
	/** Its README or docs, when that is a different page from the repo root. */
	docsUrl?: string
}

const PLUGINS_REPO = 'https://github.com/rocketflare-dev/rocketflare-plugins'
const KIT_REPO = 'https://github.com/rocketflare-dev/rocketflare'

export const PLUGINS: Plugin[] = [
	{
		id: 'analytics',
		label: 'Analytics',
		repo: PLUGINS_REPO,
		repoLabel: 'rocketflare-dev/rocketflare-plugins',
		subdir: 'plugins/analytics',
		minKit: '0.8.0',
		version: '3.1.0',
		shipsAs: 'installed',
		summary:
			'Dashboards, cubes, fact tables and the drizzle-cube query API — everything that used to be part of the kit, now a repository of its own.',
		adds: [
			'<strong>Dashboards</strong> — one row per dashboard, stored whole as JSON, with a unique slug per organisation and the option to restrict it to a group. A list page, a view page with inline editing and autosave, and an explore page.',
			'<strong>Templates</strong> — one ships, Organisation Overview, copied into every organisation when it is created and repaired lazily on every read, so a template added later still reaches the customers you already have.',
			'<strong>Cubes</strong> — <code>ActivityEvents</code>, <code>TenantActivityDaily</code>, <code>TenantUsers</code> and <code>Users</code>, served at <code>/cubejs-api</code> and <code>/mcp</code>. Every cube scopes its own query by organisation.',
			'<strong>Fact tables</strong> — <code>analytics_tenant_activity_daily_facts</code>, rebuilt one organisation at a time by an hourly schedule, in one transaction each.',
			'<strong>Permissions</strong> — a dashboard subject (admin and above manage, members read) and an analytics subject (every role reads; the query API is read-only by nature).',
			'<strong>Commands</strong> — <code>rocketflare analytics pages list</code>, <code>check-facts</code> (exit 1 when a table is stale) and <code>refresh-facts</code>.',
		],
		changelogUrl: `${PLUGINS_REPO}/blob/main/CHANGELOG.md`,
		docsUrl: `${PLUGINS_REPO}/tree/main/plugins/analytics`,
	},
	{
		id: 'web-knowledge',
		label: 'Web knowledge',
		repo: PLUGINS_REPO,
		repoLabel: 'rocketflare-dev/rocketflare-plugins',
		subdir: 'plugins/web-knowledge',
		minKit: '0.9.0',
		version: '3.1.0',
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
	},
	{
		id: 'example-feature',
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
		],
		changelogUrl: `${KIT_REPO}/blob/main/CHANGELOG.md`,
		docsUrl: `${KIT_REPO}/blob/main/apps/web/src/plugins/example-feature/CLAUDE.md`,
	},
]

export const pluginById = (id: string) => {
	const p = PLUGINS.find((x) => x.id === id)
	if (!p) throw new Error(`Unknown plugin id: ${id}`)
	return p
}

/**
 * The command that installs a plugin — the repository at its tag. A vendored
 * plugin has none: it is already in the tree.
 */
export const installCommand = (p: Plugin) =>
	p.shipsAs === 'vendored'
		? null
		: `pnpm plugin add ${p.repo}.git@${p.version}${p.subdir ? ` --subdir ${p.subdir}` : ''}`

/** How many first-party plugins there are — use this, never a literal, in copy. */
export const PLUGIN_COUNT = PLUGINS.length

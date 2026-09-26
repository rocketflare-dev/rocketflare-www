/**
 * The subsystems, in the order they are presented — `CONCEPT_COUNT` of them,
 * and every page that says how many derives it from here. Each has its own
 * page under /concepts/<slug>; `anchor` points at the matching section of
 * docs/CONCEPTS.md on GitHub for the full reference.
 *
 * `tone` selects an accent from the palette in BaseLayout.
 */
export interface Concept {
	slug: string
	num: string
	title: string
	/** One line, used on the index grid and as the page's lead. */
	blurb: string
	tone: 'blue' | 'purple' | 'orange' | 'cyan' | 'red' | 'green' | 'yellow'
	icon: string
	/** Section anchor in docs/CONCEPTS.md; empty when the page has no counterpart there. */
	anchor: string
	/** Which heading the index files it under; order inside a group is the array order (`num`). */
	group: ConceptGroupKey
}

export type ConceptGroupKey = 'foundation' | 'platform' | 'product'

export interface ConceptGroup {
	key: ConceptGroupKey
	title: string
	/** One line under the heading on the index. */
	lede: string
}

/** The three headings on /concepts, in display order. */
export const CONCEPT_GROUPS: ConceptGroup[] = [
	{
		key: 'foundation',
		title: 'Foundation',
		lede: 'The shape of the code — how it is organised, validated, shipped and kept honest.',
	},
	{
		key: 'platform',
		title: 'Platform',
		lede: 'What every organisation gets — sign-in, members, background work, mail, files and a command line.',
	},
	{
		key: 'product',
		title: 'Product',
		lede: 'What you build the product on — the AI layer, analytics, and connections to the tools your customers already use.',
	},
]

/** The concepts under one heading, in their numbered order. */
export const conceptsInGroup = (key: ConceptGroupKey) => CONCEPTS.filter((c) => c.group === key)

export const CONCEPTS: Concept[] = [
	{
		slug: 'agent-first',
		num: '01',
		title: 'Agent-first by design',
		blurb: 'Built to be worked on by a coding agent: the rules, the per-directory guides and the test gate are the interface it reads and the check it cannot skip.',
		tone: 'orange',
		icon: 'robot',
		anchor: '',
		group: 'foundation',
	},
	{
		slug: 'tenancy',
		num: '02',
		title: 'Tenancy and access',
		blurb: 'Every row belongs to an organisation, and one schema serves a single tenant or a thousand — changing modes needs no migration.',
		tone: 'blue',
		icon: 'building',
		anchor: '1-tenancy',
		group: 'platform',
	},
	{
		slug: 'auth',
		num: '03',
		title: 'Authentication',
		blurb: 'Sign in with nothing configured: magic links, Google or Microsoft, and API keys, all over sessions stored as database rows.',
		tone: 'purple',
		icon: 'key',
		anchor: '2-auth',
		group: 'platform',
	},
	{
		slug: 'api',
		num: '04',
		title: 'The API shell',
		blurb: 'One Worker runs one Hono app with one validated config, and every middleware sits where it does for a stated reason.',
		tone: 'cyan',
		icon: 'layers',
		anchor: '3-api-shell',
		group: 'foundation',
	},
	{
		slug: 'database',
		num: '05',
		title: 'Database',
		blurb: 'Postgres through one driver and one client per request, with row-level security already wired and waiting to be switched on.',
		tone: 'green',
		icon: 'database',
		anchor: '4-database',
		group: 'foundation',
	},
	{
		slug: 'background-work',
		num: '06',
		title: 'Background work and realtime',
		blurb: 'Long work never runs inside a request — it goes to a queue or a durable workflow, and the WebSocket only tells the browser to look again.',
		tone: 'orange',
		icon: 'bolt',
		anchor: '5-background-work-and-realtime',
		group: 'platform',
	},
	{
		slug: 'email-and-files',
		num: '07',
		title: 'Email and file storage',
		blurb: 'Mail that logs instead of failing when no provider is set, and file storage on R2 behind a small interface with a table in front of it.',
		tone: 'red',
		icon: 'inbox',
		anchor: '6-email-and-storage',
		group: 'platform',
	},
	{
		slug: 'ui',
		num: '08',
		title: 'The UI shell',
		blurb: 'A React shell with design tokens instead of colours, one guard for pages and navigation alike, and a data layer that never shadows the server.',
		tone: 'purple',
		icon: 'window',
		anchor: '7-ui-shell',
		group: 'foundation',
	},
	{
		slug: 'analytics',
		num: '09',
		title: 'Analytics and dashboards',
		blurb: 'Dashboards over a semantic layer that scopes every query to the tenant, fact tables rebuilt hourly, templates kept as code — shipped as a plugin, installed by default.',
		tone: 'green',
		icon: 'chart',
		anchor: '8-analytics',
		group: 'product',
	},
	{
		slug: 'ai',
		num: '10',
		title: 'The AI layer',
		blurb: 'Chat, agents and search behind one resolver that picks the model, traced and evaluated — and it works on a fresh clone with no key at all.',
		tone: 'red',
		icon: 'sparkles',
		anchor: '9-ai-layer',
		group: 'product',
	},
	{
		slug: 'deployment',
		num: '11',
		title: 'Deployment',
		blurb: 'Staging and production as two wrangler files a test keeps identical, and a release you ship by pushing a tag.',
		tone: 'blue',
		icon: 'cloud',
		anchor: '10-deployment',
		group: 'foundation',
	},
	{
		slug: 'cli',
		num: '12',
		title: 'The CLI',
		blurb: 'A browser sign-in that ends with a tenant API key on your machine, and commands that parse the server’s own schemas.',
		tone: 'yellow',
		icon: 'terminal',
		anchor: '11-cli',
		group: 'platform',
	},
	{
		slug: 'contracts',
		num: '13',
		title: 'Shared contracts',
		blurb: 'One zod package the API validates with and the UI and CLI parse with — no build step, so the three can never drift.',
		tone: 'cyan',
		icon: 'link',
		anchor: '12-shared-package',
		group: 'foundation',
	},
	{
		slug: 'feature-flags',
		num: '14',
		title: 'Feature flags',
		blurb: 'Ship a surface to production dark, then turn it on for one customer at a time — a percentage or an override, with no redeploy.',
		tone: 'yellow',
		icon: 'gauge',
		anchor: '15-feature-flags',
		group: 'platform',
	},
	{
		slug: 'plugins',
		num: '15',
		title: 'Plugins',
		blurb: 'A capability is a git repository copied into your app, not an npm package — it lands as ordinary source, reaches the app through five lines, and deleting the folder uninstalls it.',
		tone: 'cyan',
		icon: 'puzzle',
		anchor: '16-plugins',
		group: 'foundation',
	},
	{
		slug: 'connectors',
		num: '16',
		title: 'Connectors',
		blurb: 'An organisation’s admin connects its Microsoft 365 once, and its directory and calendars sync in on a schedule — a connection for the organisation, not a login for one person.',
		tone: 'green',
		icon: 'plug',
		anchor: '17-connectors',
		group: 'product',
	},
]

export const conceptBySlug = (slug: string) => CONCEPTS.find((c) => c.slug === slug)

/** How many concepts there are — use this, never a literal, in copy. */
export const CONCEPT_COUNT = CONCEPTS.length

const WORDS = [
	'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
	'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen',
	'nineteen', 'twenty',
]

/**
 * A small number as a word ("thirteen"), for prose that counts things. Past
 * twenty it falls back to digits — by then a word reads worse anyway.
 */
export function numberWord(n: number, opts: { capital?: boolean } = {}): string {
	const word = Number.isInteger(n) && n >= 0 && n < WORDS.length ? WORDS[n] : String(n)
	return opts.capital ? word.charAt(0).toUpperCase() + word.slice(1) : word
}

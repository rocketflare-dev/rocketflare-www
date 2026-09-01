/**
 * The twelve subsystems, in the order they are presented. Each has its own
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
}

export const CONCEPTS: Concept[] = [
	{
		slug: 'agent-first',
		num: '01',
		title: 'Agent-first by design',
		blurb: 'Written from the start to be worked on by a coding agent — the rules, the per-directory guides and the gate are the interface.',
		tone: 'orange',
		icon: 'robot',
		anchor: '',
	},
	{
		slug: 'tenancy',
		num: '02',
		title: 'Tenancy and access',
		blurb: 'Every row belongs to a tenant, and the schema is the same whether you run one or a thousand.',
		tone: 'blue',
		icon: 'building',
		anchor: '1-tenancy',
	},
	{
		slug: 'auth',
		num: '03',
		title: 'Authentication',
		blurb: 'Magic links, OAuth and API keys over database-backed sessions — signable in with nothing configured.',
		tone: 'purple',
		icon: 'key',
		anchor: '2-auth',
	},
	{
		slug: 'api',
		num: '04',
		title: 'The API shell',
		blurb: 'One Worker, one Hono app, one validated config, and a middleware order chosen on purpose.',
		tone: 'cyan',
		icon: 'layers',
		anchor: '3-api-shell',
	},
	{
		slug: 'database',
		num: '05',
		title: 'Database',
		blurb: 'One driver, one client per request, and row-level security waiting in reserve.',
		tone: 'green',
		icon: 'database',
		anchor: '4-database',
	},
	{
		slug: 'background-work',
		num: '06',
		title: 'Background work and realtime',
		blurb: 'Routes enqueue and never run. Long work is a queue or a workflow; the socket is only a nudge.',
		tone: 'orange',
		icon: 'bolt',
		anchor: '5-background-work-and-realtime',
	},
	{
		slug: 'email-and-files',
		num: '07',
		title: 'Email and file storage',
		blurb: 'Mail that logs instead of failing, and R2 storage behind a seam with an indexed table in front of it.',
		tone: 'red',
		icon: 'inbox',
		anchor: '6-email-and-storage',
	},
	{
		slug: 'ui',
		num: '08',
		title: 'The UI shell',
		blurb: 'Design tokens, one guard primitive, one data layer, and a provider order that is not accidental.',
		tone: 'purple',
		icon: 'window',
		anchor: '7-ui-shell',
	},
	{
		slug: 'analytics',
		num: '09',
		title: 'Analytics and dashboards',
		blurb: 'A semantic layer scoped to the tenant inside every cube, fact tables on a cron, dashboards as code.',
		tone: 'green',
		icon: 'chart',
		anchor: '8-analytics',
	},
	{
		slug: 'ai',
		num: '10',
		title: 'The AI layer',
		blurb: 'Chat, agents and retrieval behind one resolver — with a floor that needs no key at all.',
		tone: 'red',
		icon: 'sparkles',
		anchor: '9-ai-layer',
	},
	{
		slug: 'deployment',
		num: '11',
		title: 'Deployment',
		blurb: 'Two environments, two wrangler files kept identical by a test, and a release you trigger with a tag.',
		tone: 'blue',
		icon: 'cloud',
		anchor: '10-deployment',
	},
	{
		slug: 'cli',
		num: '12',
		title: 'The CLI',
		blurb: 'A browser handoff that ends in a tenant API key, and commands that parse the server’s own schemas.',
		tone: 'yellow',
		icon: 'terminal',
		anchor: '11-cli',
	},
	{
		slug: 'contracts',
		num: '13',
		title: 'Shared contracts',
		blurb: 'One zod package the API validates with and the UI and CLI parse with. No build step, no drift.',
		tone: 'cyan',
		icon: 'link',
		anchor: '12-shared-package',
	},
]

export const conceptBySlug = (slug: string) => CONCEPTS.find((c) => c.slug === slug)

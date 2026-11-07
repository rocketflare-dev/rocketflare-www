/**
 * The comparison pages under /compare/, in the order the hub lists them.
 *
 * The hub's cards, its A–Z index of alternatives, the pager at the foot of
 * each page and the anchor ids on each competitor's heading all read this
 * list, so a competitor cannot be listed on the hub without having a section
 * to land on (CompareLayout throws when a page's profiles and this list
 * disagree).
 *
 * Every page also has an entry in src/data/pages.ts (title, description,
 * llms.txt, sitemap). This file holds only what the comparison section needs.
 */
export interface Competitor {
	name: string
	/** The id of the competitor's heading on its page: /compare/<slug>/#<anchor>. */
	anchor: string
}

export type Tone = 'blue' | 'purple' | 'orange' | 'cyan' | 'red' | 'green' | 'yellow'

export interface Comparison {
	slug: string
	/** The category, as a reader would name it. */
	category: string
	/** One sentence for the hub card: the verdict, not a teaser. */
	verdict: string
	/** "You want…" — the line in the hub's "which page is yours" list. */
	situation: string
	competitors: Competitor[]
	tone: Tone
	icon: string
}

/** When the facts about other products were last checked against their own sites. */
export const CHECKED_ON = 'November 2026'

export const COMPARISONS: Comparison[] = [
	{
		slug: 'agentic-workflow-platforms',
		category: 'AI agent and workflow platforms',
		verdict:
			'They give you agents in someone else’s workspace, or a framework you still have to build an app around. Rocketflare gives you the whole agentic app as one thing you own and deploy.',
		situation: 'AI agents doing real work inside your business, with people approving the steps that matter',
		competitors: [
			{ name: 'Dust', anchor: 'dust' },
			{ name: 'Microsoft Copilot Studio', anchor: 'copilot-studio' },
			{ name: 'Microsoft Fabric', anchor: 'fabric' },
			{ name: 'n8n', anchor: 'n8n' },
			{ name: 'Mastra', anchor: 'mastra' },
			{ name: 'LangGraph', anchor: 'langgraph' },
			{ name: 'CrewAI', anchor: 'crewai' },
			{ name: 'Relevance AI', anchor: 'relevance-ai' },
		],
		tone: 'purple',
		icon: 'robot',
	},
	{
		slug: 'ai-app-builders',
		category: 'Hosted AI app builders',
		verdict:
			'They get you from a prompt to a demo faster than anything. Rocketflare is where you start when the demo has to become a product with customers, roles and data that must not leak.',
		situation: 'to describe an app and have AI build it, but end up with something you can run as a business',
		competitors: [
			{ name: 'Lovable', anchor: 'lovable' },
			{ name: 'Replit', anchor: 'replit' },
			{ name: 'Bolt', anchor: 'bolt' },
			{ name: 'v0', anchor: 'v0' },
			{ name: 'Base44', anchor: 'base44' },
		],
		tone: 'orange',
		icon: 'sparkles',
	},
	{
		slug: 'saas-starter-kits',
		category: 'Paid SaaS starter kits',
		verdict:
			'The paid kits are good at sign-in and Stripe. Rocketflare has no billing, and instead ships test-enforced multi-tenancy, an AI layer with agents and a knowledge base, and an MIT licence with no conditions on client work.',
		situation: 'a SaaS boilerplate so you can skip the first month of plumbing',
		competitors: [
			{ name: 'ShipFast', anchor: 'shipfast' },
			{ name: 'Supastarter', anchor: 'supastarter' },
			{ name: 'Makerkit', anchor: 'makerkit' },
			{ name: 'SaaS Pegasus', anchor: 'saas-pegasus' },
		],
		tone: 'blue',
		icon: 'rocket',
	},
	{
		slug: 'open-source-saas-starters',
		category: 'Open-source B2B starters',
		verdict:
			'The good free starters show you the shape of an app. Rocketflare is free too, and is the whole app: tenancy, SSO, jobs, AI, dashboards and an admin area, all tested.',
		situation: 'an open-source starting point you can fork without paying anyone',
		competitors: [
			{ name: 'BoxyHQ SaaS Starter Kit', anchor: 'boxyhq' },
			{ name: 'Open SaaS', anchor: 'open-saas' },
			{ name: 'Next.js SaaS Starter', anchor: 'nextjs-saas-starter' },
			{ name: 'Epic Stack', anchor: 'epic-stack' },
			{ name: 'Bullet Train', anchor: 'bullet-train' },
			{ name: 'Better-T-Stack', anchor: 'better-t-stack' },
			{ name: 'create-t3-app', anchor: 't3' },
		],
		tone: 'green',
		icon: 'puzzle',
	},
	{
		slug: 'internal-tool-builders',
		category: 'Internal tool builders',
		verdict:
			'They are quickest for a screen over a database your team already has. Rocketflare is for when the tool becomes a product: your own code, no per-seat bill, and room for customers as well as staff.',
		situation: 'an internal tool for your team, without paying per user forever',
		competitors: [
			{ name: 'Retool', anchor: 'retool' },
			{ name: 'Appsmith', anchor: 'appsmith' },
			{ name: 'Budibase', anchor: 'budibase' },
			{ name: 'ToolJet', anchor: 'tooljet' },
			{ name: 'Superblocks', anchor: 'superblocks' },
		],
		tone: 'cyan',
		icon: 'window',
	},
	{
		slug: 'backend-platforms',
		category: 'Backend platforms',
		verdict:
			'They give you a database, auth and storage as a service, and the app is still yours to build. Rocketflare is the app, on a plain Postgres database you can take anywhere.',
		situation: 'a backend you do not have to run, so you can get to the product',
		competitors: [
			{ name: 'Supabase', anchor: 'supabase' },
			{ name: 'Firebase', anchor: 'firebase' },
			{ name: 'Convex', anchor: 'convex' },
			{ name: 'Appwrite', anchor: 'appwrite' },
		],
		tone: 'yellow',
		icon: 'database',
	},
	{
		slug: 'build-your-own',
		category: 'Building your own starter',
		verdict:
			'You could write all of it, and sometimes you should. Here is the work an in-house starter kit really involves, and what you give up by taking a copy of this one instead.',
		situation: 'to build your own platform or internal starter kit, so every team starts from the same place',
		competitors: [{ name: 'an in-house starter kit', anchor: 'in-house' }],
		tone: 'red',
		icon: 'building',
	},
]

export const comparisonBySlug = (slug: string) => COMPARISONS.find((c) => c.slug === slug)

const nameList = (names: string[]) =>
	names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names.at(-1)}` : names[0]

/**
 * A link to one comparison, labelled with the products it names, for use on
 * other pages ("Rocketflare vs Dust, Microsoft Copilot Studio and Microsoft
 * Fabric"). `count` is how many product names go in the label.
 */
export function compareLink(slug: string, count = 3): { href: string; label: string } {
	const c = comparisonBySlug(slug)
	if (!c) throw new Error(`Unknown comparison: ${slug}`)
	const href = `/compare/${c.slug}/`
	if (c.slug === 'build-your-own') return { href, label: 'Building your own starter kit, or starting from this' }
	return { href, label: `Rocketflare vs ${nameList(c.competitors.slice(0, count).map((x) => x.name))}` }
}

/**
 * The footer's direct comparison links: the first two products of each
 * category, each linking to its own section, so the best-known alternatives
 * are one click from every page.
 */
export const FOOTER_COMPARISONS = COMPARISONS.filter((c) => c.slug !== 'build-your-own').flatMap((c) =>
	c.competitors.slice(0, 2).map((x) => ({ name: x.name, href: `/compare/${c.slug}/#${x.anchor}` }))
)

/** Concept page → the comparison a reader of it is most likely weighing. */
export const COMPARE_FOR_CONCEPT: Record<string, string> = {
	ai: 'agentic-workflow-platforms',
	connectors: 'agentic-workflow-platforms',
	tenancy: 'saas-starter-kits',
	auth: 'saas-starter-kits',
	'background-work': 'agentic-workflow-platforms',
	analytics: 'backend-platforms',
	database: 'backend-platforms',
	'agent-first': 'ai-app-builders',
	ui: 'internal-tool-builders',
	plugins: 'open-source-saas-starters',
	deployment: 'build-your-own',
}

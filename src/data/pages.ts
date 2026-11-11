/**
 * The site's top-level pages, in navigation order. Nav, Footer and llms.txt
 * are generated from this list so a page cannot be added without appearing
 * everywhere — and cannot be linked to before it exists (`ready`).
 *
 * `audience` records who a page is written for: `builder` (someone who wants
 * the product shipped), `engineer` (someone who wants to know how it works),
 * or `both`.
 */
export interface SitePage {
	/** Absolute path with a trailing slash, e.g. `/tour/`. */
	path: string
	/** The <title> / h1. */
	title: string
	/** The short label used in the nav and footer. */
	nav: string
	description: string
	audience: 'builder' | 'engineer' | 'both'
	/** Position in the nav, ascending. */
	order: number
	/**
	 * False while the page is only a placeholder. Placeholders still render
	 * (so no link 404s) but are `noindex` and left out of the sitemap.
	 */
	ready: boolean
	/**
	 * Whether the page appears in the top nav. Default true. The use
	 * cases and the costs page are set false: they are written for someone
	 * arriving from a search with a specific question, and are linked from the
	 * pages that raise that question. Putting all of them in the nav would
	 * double its length and bury the five links that suit a first visit.
	 * They are still in the sitemap and in llms.txt, which read this list.
	 */
	inNav?: boolean
	/**
	 * Whether the page appears in the footer. Default true. The footer carries
	 * more than the nav on purpose: it is where the pages a returning reader
	 * wants live (the changelog) and where a crawler finds everything.
	 */
	inFooter?: boolean
}

export const PAGES: SitePage[] = [
	{
		path: '/',
		title: 'Rocketflare — the open-source SaaS starter kit you copy and ship',
		nav: 'Home',
		description:
			'A free, open-source SaaS starter kit: sign-in, teams and permissions, an AI assistant over your documents, dashboards and background jobs are already built. Copy it, rename it, ship your product — running on your laptop in about two minutes.',
		audience: 'both',
		order: 0,
		ready: true,
	},
	{
		path: '/tour/',
		title: 'Tour — every screen you get on day one',
		nav: 'Tour',
		description:
			'See what is already built before you commit a weekend to it: sign-in, people and roles, chat, AI agents, document search, usage and the admin area — every screen, as it looks on the first run — and the dashboards you add as a plugin.',
		audience: 'builder',
		order: 1,
		ready: true,
	},
	{
		path: '/plugins/',
		title: 'Plugins — capabilities you copy in, and take back out',
		nav: 'Plugins',
		description:
			'A Rocketflare plugin is a git repository copied into your app, not an npm package. The first-party catalogue: what each one adds, the kit release it needs, and the one command that installs it.',
		audience: 'both',
		order: 6,
		ready: true,
	},
	{
		path: '/get-started/',
		title: 'Get started — your SaaS running locally in two minutes',
		nav: 'Get started',
		description:
			'One command takes you from an empty folder to an app you are signed in to, with demo data. No accounts, no keys, no config. Then deploy it for real with three free accounts and one more command.',
		audience: 'both',
		order: 7,
		ready: true,
		inNav: false,
	},
	{
		path: '/who-is-it-for/',
		title: 'Who it’s for — AI workflow apps, internal tools, customer portals, B2B products',
		nav: "Who it's for",
		description:
			'Four products people build on it — an agentic workflow app, an internal operations tool, a customer portal with AI over documents, an analytics-heavy B2B app — what is already done for each, what you add, and when to pick something else.',
		audience: 'both',
		order: 4,
		ready: true,
	},
	{
		path: '/concepts/',
		title: 'How it works — the parts of a multi-tenant SaaS, explained',
		nav: 'Concepts',
		description:
			'One short page per part of the app — teams, sign-in, files, background jobs, AI, dashboards — what it does, and the decision behind it. Written to be read before you build on it.',
		audience: 'engineer',
		order: 5,
		ready: true,
	},
	{
		path: '/changelog/',
		title: 'Changelog — every Rocketflare release',
		nav: 'Changelog',
		description:
			'What each release added, and the one command that brings it into a copy you have already renamed and made your own — so starting from a kit does not mean falling behind it.',
		audience: 'both',
		order: 8,
		ready: true,
		inNav: false,
	},
	{
		path: '/use-cases/internal-tool/',
		title: 'Build an internal tool without building the platform first',
		nav: 'Internal tools',
		description:
			'An operations tool your team opens every morning. Sign-in, roles, invitations, an audit trail and background jobs are already built and tested, so the first thing you write is a table that belongs to your business.',
		audience: 'builder',
		order: 9,
		ready: true,
		inFooter: false,
		inNav: false,
	},
	{
		path: '/use-cases/customer-portal/',
		title: 'A customer portal with AI over each customer’s documents',
		nav: 'Customer portals',
		description:
			'Every customer uploads their own documents, asks questions about them, and never sees anyone else’s. Upload, conversion, search, chat and citations are built in, and isolation is enforced by tests rather than by care.',
		audience: 'builder',
		order: 10,
		ready: true,
		inFooter: false,
		inNav: false,
	},
	{
		path: '/use-cases/analytics-product/',
		title: 'An analytics product where the numbers are the product',
		nav: 'Analytics products',
		description:
			'Dashboards per customer over their own data, a semantic layer so a measure is defined once, summary tables rebuilt on a schedule, and a query endpoint for the questions you did not anticipate.',
		audience: 'builder',
		order: 11,
		ready: true,
		inFooter: false,
		inNav: false,
	},
	{
		path: '/costs/',
		title: 'What it costs to run',
		nav: 'Costs',
		description:
			'Free on your laptop. Deployed, it starts small on a paid Cloudflare account and grows with use. The four lines on the bill, what makes them grow, and how to have us run the app for you.',
		audience: 'both',
		order: 2,
		ready: true,
		inNav: false,
	},
	{
		path: '/compare/',
		title: 'How Rocketflare compares — the alternatives, side by side',
		nav: 'Compare',
		description:
			'Rocketflare next to the other ways to get an AI-native business app: agent platforms like Dust, Copilot Studio and n8n, AI app builders like Lovable and Replit, SaaS starter kits, internal tool builders like Retool, backend platforms like Supabase, and building your own.',
		audience: 'both',
		order: 3,
		ready: true,
		inNav: false,
	},
	{
		path: '/compare/agentic-workflow-platforms/',
		title: 'Rocketflare vs Dust, Copilot Studio, n8n and Mastra',
		nav: 'vs agent platforms',
		description:
			'An alternative to Dust, Microsoft Copilot Studio and Fabric, n8n, Mastra, LangGraph, CrewAI and Relevance AI: an agentic business app you own and deploy as one unit — agents, durable workflows with human approval, a knowledge base, the UI, users and an activity log in one repository.',
		audience: 'both',
		order: 13,
		ready: true,
		inNav: false,
		inFooter: false,
	},
	{
		path: '/compare/ai-app-builders/',
		title: 'Rocketflare vs Lovable, Replit, Bolt, v0 and Base44',
		nav: 'vs AI app builders',
		description:
			'An alternative to Lovable, Replit, Bolt, v0 and Base44 for when a prototype has to become a product: build with Claude Code or Codex on a tested multi-tenant foundation, in your own repository and your own cloud account.',
		audience: 'builder',
		order: 14,
		ready: true,
		inNav: false,
		inFooter: false,
	},
	{
		path: '/compare/saas-starter-kits/',
		title: 'Rocketflare vs ShipFast, Supastarter, Makerkit and SaaS Pegasus',
		nav: 'vs SaaS starter kits',
		description:
			'A free, MIT-licensed alternative to ShipFast, Supastarter, Makerkit and SaaS Pegasus: what each paid SaaS boilerplate includes, where Rocketflare goes further (tenancy, AI agents, licence terms) and where it does not (billing).',
		audience: 'both',
		order: 15,
		ready: true,
		inNav: false,
		inFooter: false,
	},
	{
		path: '/compare/open-source-saas-starters/',
		title: 'Rocketflare vs open-source SaaS starters: BoxyHQ, Open SaaS, T3',
		nav: 'vs open-source starters',
		description:
			'An alternative to the BoxyHQ SaaS Starter Kit, Open SaaS, the Next.js SaaS Starter, Epic Stack, Bullet Train, Better-T-Stack and create-t3-app: what each free starter gives you, how actively it is maintained, and what a whole app with tenancy, SSO, agents and dashboards adds.',
		audience: 'engineer',
		order: 16,
		ready: true,
		inNav: false,
		inFooter: false,
	},
	{
		path: '/compare/internal-tool-builders/',
		title: 'Rocketflare vs Retool, Appsmith, Budibase and ToolJet',
		nav: 'vs internal tool builders',
		description:
			'An alternative to Retool, Appsmith, Budibase, ToolJet and Superblocks: an internal tool that is your own code, with no per-user bill, SSO included, and room to open it to customers later.',
		audience: 'builder',
		order: 17,
		ready: true,
		inNav: false,
		inFooter: false,
	},
	{
		path: '/compare/backend-platforms/',
		title: 'Rocketflare vs Supabase, Firebase, Convex and Appwrite',
		nav: 'vs backend platforms',
		description:
			'An alternative to Supabase, Firebase, Convex and Appwrite: a backend-as-a-service gives you the parts, Rocketflare gives you the app — organisations, roles, AI and dashboards over a plain Postgres database you can move.',
		audience: 'engineer',
		order: 18,
		ready: true,
		inNav: false,
		inFooter: false,
	},
	{
		path: '/compare/build-your-own/',
		title: 'Build your own SaaS starter kit, or start from this',
		nav: 'vs building your own',
		description:
			'What an in-house platform or internal starter kit really costs to build and keep up, when writing it yourself is the right call, and what you give up by taking a copy of Rocketflare instead.',
		audience: 'both',
		order: 19,
		ready: true,
		inNav: false,
		inFooter: false,
	},
	{
		path: '/security/',
		title: 'Security — what the kit enforces, how it is audited, and what was fixed',
		nav: 'Security',
		description:
			'What every copy of Rocketflare enforces by design, the threat model behind it, the multi-agent audit it is tested with, every finding fixed in a released version, and how to report a vulnerability privately.',
		audience: 'both',
		order: 12,
		ready: true,
		inNav: false,
	},
	{
		path: '/license/',
		title: 'License terms — what is free, what is commercial, and why',
		nav: 'License terms',
		description:
			'The kit and the public plugins are MIT: copy them, build on them, sell what you make. Launch is source-available, and partners can license closed-source commercial plugins and support. What each licence lets you do, in plain English, and why it is split this way.',
		audience: 'both',
		order: 12,
		ready: true,
		inNav: false,
	},
	{
		path: '/partners/',
		title: 'Partners — the companies that can build Rocketflare apps for you',
		nav: 'Partners',
		description:
			'Companies that build and run Rocketflare apps for their clients, with commercial plugins and support from the people who build the kit. Who our partners are, and how to become one.',
		audience: 'both',
		order: 2,
		ready: true,
	},
]

/** The pages that appear in the nav and footer, in order — the home link is the logo. */
export const NAV_PAGES = PAGES.filter((p) => p.path !== '/' && p.inNav !== false).sort(
	(a, b) => a.order - b.order
)

/** The footer's list, which is the nav's plus the pages demoted out of it. */
export const FOOTER_PAGES = PAGES.filter(
	(p) => p.path !== '/' && p.ready && p.inFooter !== false
).sort((a, b) => a.order - b.order)

export const pageByPath = (path: string) => PAGES.find((p) => p.path === path)

/**
 * Paths left out of the sitemap: every not-yet-ready page, plus `/og/` — the
 * 1200×630 template `public/og-image.png` is screenshotted from (noindex, not
 * in this registry so it never reaches the nav; see CLAUDE.md "The OG image") —
 * and `/launch/`, the Rocketflare Launch overview, shared by link only.
 */
export const SITEMAP_EXCLUDED_PATHS: string[] = [
	'/og/',
	'/launch/',
	...PAGES.filter((p) => !p.ready).map((p) => p.path),
]

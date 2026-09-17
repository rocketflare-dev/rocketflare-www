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
			'See what is already built before you commit a weekend to it: sign-in, people and roles, chat, AI agents, document search, dashboards, usage and the admin area — every screen, as it looks on the first run.',
		audience: 'builder',
		order: 1,
		ready: true,
	},
	{
		path: '/get-started/',
		title: 'Get started — your SaaS running locally in two minutes',
		nav: 'Get started',
		description:
			'One command takes you from an empty folder to an app you are signed in to, with demo data. No accounts, no keys, no config. Then deploy it for real with three free accounts and one more command.',
		audience: 'both',
		order: 6,
		ready: true,
		inNav: false,
	},
	{
		path: '/who-is-it-for/',
		title: 'Who it’s for — internal tools, customer portals, B2B products',
		nav: "Who it's for",
		description:
			'Three products people build on it — an internal operations tool, a customer portal with AI over documents, an analytics-heavy B2B app — what is already done for each, what you add, and when to pick something else.',
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
		order: 7,
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
		order: 8,
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
		order: 9,
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
		order: 10,
		ready: true,
		inFooter: false,
		inNav: false,
	},
	{
		path: '/costs/',
		title: 'What it costs to run',
		nav: 'Costs',
		description:
			'Running it on your laptop is free. Running it for real starts at about five dollars a month. Every line of that bill, with the price each vendor publishes and the date it was checked.',
		audience: 'both',
		order: 2,
		ready: true,
	},
	{
		path: '/compare/',
		title: 'Build it yourself, or start from this',
		nav: 'Compare',
		description:
			'What the platform work actually is, when writing it yourself is the right call, how this differs from the Next.js starter kits, and what you give up by taking a copy.',
		audience: 'both',
		order: 3,
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
 * in this registry so it never reaches the nav; see CLAUDE.md "The OG image").
 */
export const SITEMAP_EXCLUDED_PATHS: string[] = [
	'/og/',
	...PAGES.filter((p) => !p.ready).map((p) => p.path),
]

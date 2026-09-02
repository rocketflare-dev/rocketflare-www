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
}

export const PAGES: SitePage[] = [
	{
		path: '/',
		title: 'Rocketflare — ship the product, not the platform',
		nav: 'Home',
		description:
			'A ready-made multi-tenant web app you copy and make your own — sign-in, teams, an AI assistant over your documents, dashboards and background jobs on one Cloudflare Worker. Running on your laptop in about two minutes.',
		audience: 'both',
		order: 0,
		ready: true,
	},
	{
		path: '/tour/',
		title: 'Tour — what you get on the first run, screen by screen',
		nav: 'Tour',
		description:
			'What you get on the first run, screen by screen: sign-in, people and roles, AI settings, chat, agents, knowledge and search, analytics, usage, the admin area and the CLI.',
		audience: 'builder',
		order: 1,
		ready: true,
	},
	{
		path: '/get-started/',
		title: 'Get started — running in about two minutes',
		nav: 'Get started',
		description:
			'From git clone to a running app you are signed in to — ask your coding agent, run one script, or do it by hand — then deploy it with three tokens.',
		audience: 'both',
		order: 2,
		ready: true,
	},
	{
		path: '/who-is-it-for/',
		title: 'Who Rocketflare is for — and who it isn’t',
		nav: "Who it's for",
		description:
			'Three things you would build on it — an internal operations tool, a customer portal with AI over documents, an analytics-heavy B2B product — what is already done for each, and when to pick something else.',
		audience: 'both',
		order: 3,
		ready: true,
	},
	{
		path: '/concepts/',
		title: 'Concepts — how a multi-tenant SaaS on Cloudflare Workers fits together',
		nav: 'Concepts',
		description:
			'One page per subsystem: what it does, the invariant it protects, and the decision behind it.',
		audience: 'engineer',
		order: 4,
		ready: true,
	},
]

/** The pages that appear in the nav and footer, in order — the home link is the logo. */
export const NAV_PAGES = PAGES.filter((p) => p.path !== '/').sort((a, b) => a.order - b.order)

export const pageByPath = (path: string) => PAGES.find((p) => p.path === path)

/** Paths left out of the sitemap: every not-yet-ready page. */
export const SITEMAP_EXCLUDED_PATHS: string[] = PAGES.filter((p) => !p.ready).map((p) => p.path)

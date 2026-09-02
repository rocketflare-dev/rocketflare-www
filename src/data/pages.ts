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
		title: 'Rocketflare — multi-tenant B2B SaaS starter kit for Cloudflare Workers',
		nav: 'Home',
		description:
			'Open-source starter kit for building a multi-tenant B2B SaaS app on Cloudflare Workers, designed to be worked on by coding agents.',
		audience: 'both',
		order: 0,
		ready: true,
	},
	{
		path: '/tour/',
		title: 'Tour — what a Rocketflare app looks like',
		nav: 'Tour',
		description:
			'A walk through the app the kit gives you: sign-in, organisations and roles, jobs and realtime, files, analytics, chat and agents, the CLI.',
		audience: 'builder',
		order: 1,
		ready: false,
	},
	{
		path: '/get-started/',
		title: 'Get started — launch Rocketflare locally',
		nav: 'Get started',
		description:
			'From git clone to a running app you are signed in to, with your coding agent or by hand. Nothing to sign up for, no keys to paste.',
		audience: 'both',
		order: 2,
		ready: false,
	},
	{
		path: '/who-is-it-for/',
		title: 'Who Rocketflare is for',
		nav: "Who it's for",
		description:
			'Builders who want the product shipped, and engineers who want to know exactly how the platform underneath it works.',
		audience: 'both',
		order: 3,
		ready: false,
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

/**
 * Paths left out of the sitemap: every not-yet-ready page, plus the
 * kitchen-sink scratch page (`src/pages/kitchen.astro`), which is not a
 * page of the site and is deleted before the overhaul branch merges.
 */
export const SITEMAP_EXCLUDED_PATHS: string[] = [
	...PAGES.filter((p) => !p.ready).map((p) => p.path),
	'/kitchen/',
]

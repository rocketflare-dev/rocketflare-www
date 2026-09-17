import { execFileSync } from 'node:child_process'

/**
 * A page's last-modified date, for the sitemap's <lastmod> (astro.config.mjs).
 *
 * The date is the last commit that touched the page's own source file — not the
 * build time, which would claim every page changed on every deploy and teach a
 * crawler to ignore the field. A page whose body comes from a data file counts
 * that file too (the changelog is generated from the release list, so a new
 * release is a change to the changelog even though the .astro file is untouched).
 *
 * When git cannot answer — no repository, or a shallow clone where every file
 * dates to the tip commit — this returns undefined and the URL ships with no
 * <lastmod> at all. An absent date is honest; a wrong one is not. CI therefore
 * checks out with `fetch-depth: 0` (.github/workflows/deploy.yml).
 */

/** Data files a page's content is generated from, beyond its own source. */
const EXTRA_SOURCES: Record<string, string[]> = {
	'/changelog/': ['src/data/releases.ts'],
	'/concepts/': ['src/data/concepts.ts'],
}

/** `/concepts/ai/` → the two places Astro would look for that route's source. */
function candidateSources(pathname: string): string[] {
	const slug = pathname.replace(/^\/|\/$/g, '')
	if (slug === '') return ['src/pages/index.astro']
	return [`src/pages/${slug}.astro`, `src/pages/${slug}/index.astro`]
}

function lastCommitDate(file: string): Date | undefined {
	try {
		const out = execFileSync('git', ['log', '-1', '--format=%cI', '--', file], {
			encoding: 'utf8',
			stdio: ['ignore', 'pipe', 'ignore'],
		}).trim()
		if (!out) return undefined
		const date = new Date(out)
		return Number.isNaN(date.getTime()) ? undefined : date
	} catch {
		return undefined
	}
}

/** True when git only has one commit — every date would be the same lie. */
let shallow: boolean | undefined
function isShallow(): boolean {
	if (shallow !== undefined) return shallow
	try {
		const out = execFileSync('git', ['rev-list', '--count', 'HEAD'], {
			encoding: 'utf8',
			stdio: ['ignore', 'pipe', 'ignore'],
		}).trim()
		shallow = Number(out) <= 1
	} catch {
		shallow = true
	}
	return shallow
}

export function lastmodFor(url: string): Date | undefined {
	if (isShallow()) return undefined

	let pathname: string
	try {
		pathname = new URL(url).pathname
	} catch {
		return undefined
	}

	const files = [...candidateSources(pathname), ...(EXTRA_SOURCES[pathname] ?? [])]
	const dates = files.map(lastCommitDate).filter((d): d is Date => d !== undefined)
	if (dates.length === 0) return undefined

	// The newest of the page and its data: the last time the page changed.
	return new Date(Math.max(...dates.map((d) => d.getTime())))
}

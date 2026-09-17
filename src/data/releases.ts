/**
 * The kit's releases, mirroring the frontmatter of `docs/upgrades/*.md` in the kit repository.
 *
 * Hand-maintained on purpose, like every other kit literal on this site (CLAUDE.md, "kit literals"):
 * the site is a separate repository and must build without the kit checked out beside it. Keep it in
 * step when you cut a release — `npm run sync:releases` regenerates it from a sibling
 * `../rocketflare` checkout and is the easiest way to be sure.
 *
 * `summary` is the site's own one-line voice, not a copy of the note. The note itself is the
 * porting instruction and lives in the kit; link to it, never restate it.
 */
export interface Release {
	/** `X.Y.Z`, matching the git tag and the porting note's filename. */
	version: string
	/** ISO date, as in the note's frontmatter. */
	date: string
	summary: string
	/** True when an adopter has to change their own code, not just accept ours. */
	breaking: boolean
	/** True when the release ships a schema change (a copy regenerates its own migration). */
	migrations: boolean
	/** The areas it touches, for someone deciding whether to bother now. */
	areas: string[]
}

export const RELEASES: Release[] = [
	{
		version: '0.1.0',
		date: '2026-09-11',
		summary:
			'The first release: the whole kit, and the upgrade path that lets a copy absorb what comes next.',
		breaking: false,
		migrations: false,
		areas: ['api', 'ui', 'shared', 'db', 'cli', 'config', 'docs'],
	},
	{
		version: '0.2.0',
		date: '2026-09-14',
		summary:
			'Groups: decide who in an organisation can see which documents and dashboards. Chat and agent runs now speak AG-UI on the wire, a long thread forgets deliberately instead of overflowing, and every document has a viewer.',
		breaking: true,
		migrations: true,
		areas: ['api', 'ui', 'shared', 'config', 'docs'],
	},
	{
		version: '0.3.0',
		date: '2026-09-15',
		summary:
			'Feature flags: ship a half-built surface to production dark, then turn it on for one customer at a time — a percentage rollout or a per-organisation override, changed from the admin area with no redeploy.',
		breaking: false,
		migrations: true,
		areas: ['shared', 'db', 'api', 'ui', 'cli', 'config', 'docs'],
	},
	{
		version: '0.4.0',
		date: '2026-09-16',
		summary:
			'Human-in-the-loop agents: a run can stop and ask a person — approve this, which did you mean, fill this in — wait days for the answer, and carry on from where it parked. Every run has a page of its own that fills live while it works.',
		breaking: false,
		migrations: true,
		areas: ['shared', 'db', 'api', 'ui', 'config', 'docs'],
	},
	{
		version: '0.5.0',
		date: '2026-09-17',
		summary:
			'Plugins: a feature is a git repository copied into your app — never an npm package — that brings its own contracts, tables, routes, jobs, agent tools, pages and CLI commands. pnpm plugin installs, upgrades, removes and audits them; example-feature is the reference one, and it exists to be deleted.',
		breaking: false,
		migrations: true,
		areas: ['shared', 'api', 'ui', 'cli', 'db', 'config', 'docs', 'scripts', 'provisioning'],
	},
]

/** Newest first — the order the changelog reads in. */
export const RELEASES_NEWEST_FIRST = [...RELEASES].reverse()

export const LATEST_RELEASE = RELEASES_NEWEST_FIRST[0]

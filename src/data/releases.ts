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
	{
		version: '0.6.0',
		date: '2026-09-17',
		summary:
			'Analytics leaves the kit and becomes a plugin of its own — dashboards, cubes and the query API now arrive by installing a repository rather than by being born in your codebase. A fresh clone still gets all of it; what changed is that you can take it out.',
		breaking: true,
		migrations: true,
		areas: ['shared', 'db', 'api', 'ui', 'cli', 'config', 'docs', 'scripts'],
	},
	{
		version: '0.6.1',
		date: '2026-09-17',
		summary:
			'Install a plugin and the gate stays green. A plugin can now declare the lines a core file needs and the host writes them, so installing one leaves a project that builds — with nothing left on a checklist for you to remember.',
		breaking: false,
		migrations: false,
		areas: ['config', 'scripts', 'ci'],
	},
	{
		version: '0.7.0',
		date: '2026-09-18',
		summary:
			'Writing a plugin is now writing against a contract rather than against the kit: it receives the database, the organisation, permissions and the rest as injected context, imports only from a handful of declared entries, and that surface has a version number and a generated reference of its own. Deleting an organisation now also removes what lives outside the database, which the cascade could never reach.',
		breaking: true,
		migrations: false,
		areas: ['api', 'ui', 'shared', 'db', 'cli', 'config'],
	},
	{
		version: '0.8.0',
		date: '2026-09-18',
		summary:
			'Writing a plugin no longer means guessing which kit releases it will work with. The kit publishes the surface it provides, a plugin records what it actually uses, and installing one compares the two — so an incompatibility is a named missing symbol with its replacement, found before a single file is copied, instead of a version range somebody has to keep true by hand.',
		breaking: true,
		migrations: false,
		areas: ['config', 'docs', 'shared'],
	},
	{
		version: '0.8.1',
		date: '2026-09-18',
		summary:
			'A coding agent working in a copy of the kit now starts lighter. The layer rules load only when it touches that layer, and the reference docs are named rather than pulled in whole, which leaves roughly 100k more tokens of context for your own work in every session.',
		breaking: false,
		migrations: false,
		areas: [],
	},
	{
		version: '0.9.0',
		date: '2026-09-18',
		summary:
			'A plugin can now offer a tool only to the organisations that turned it on, and keep each organisation’s own API key encrypted with the kit’s encryption rather than its own — the two things the new web-knowledge plugin needed to give agents web search.',
		breaking: false,
		migrations: false,
		areas: [],
	},
	{
		version: '0.10.0',
		date: '2026-09-25',
		summary:
			'See why a run went wrong: every chat turn, agent run and AI job is now a span tree you can read from the terminal with one CLI command, and export as OpenTelemetry to Langfuse, Phoenix or any backend — your existing Langfuse keys keep working.',
		breaking: false,
		migrations: true,
		areas: ['api', 'shared', 'db', 'cli', 'config', 'docs'],
	},
]

/** Newest first — the order the changelog reads in. */
export const RELEASES_NEWEST_FIRST = [...RELEASES].reverse()

export const LATEST_RELEASE = RELEASES_NEWEST_FIRST[0]

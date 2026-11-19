/**
 * The public security track record on /security/: every audit run, and per release the number of
 * findings it fixed, by severity, and the number of hardening changes shipped alongside.
 *
 * Only counts are published. No individual finding or hardening change is described anywhere on
 * the site, for any run: each fix is in the release it names. Produced from the hand-curated
 * public entries file the kit's `audit.mjs public-report` validates (the same allowlisted fields:
 * nothing else from a run is ever published), then kept by hand. A release is added once it ships;
 * an item that was never confirmed exploitable counts as `hardening`, never as a finding.
 */
import { GITHUB_URL, PLUGINS_GITHUB_URL } from './site'

export type Severity = 'high' | 'medium' | 'low'
export type Repo = 'rocketflare' | 'rocketflare-plugins'

export const SEVERITIES: Severity[] = ['high', 'medium', 'low']

export const REPOS: Record<Repo, { label: string; url: string }> = {
	rocketflare: { label: 'Kit', url: GITHUB_URL },
	'rocketflare-plugins': { label: 'Plugins', url: PLUGINS_GITHUB_URL },
}

export interface Run {
	/** `run-1`…, the anchor and the label. */
	id: string
	date: string
	commit: string
	/** The repository `commit` is in. */
	repo: Repo
	scope: string
	/** Coverage units hunted (a unit is one subsystem, one boundary and its attack classes). */
	coverageUnits: number
	agentCalls: number
	/**
	 * Findings this run confirmed in the two public repositories, by severity. A finding two runs
	 * both confirmed counts in each, so these add up to more than `FIXED`.
	 */
	confirmed: Record<Severity, number>
	/** The releases that fixed what it found. */
	fixedIn: string[]
}

export const RUNS: Run[] = [
	{
		id: 'run-1',
		date: '2026-11-09',
		commit: '4362c6b',
		repo: 'rocketflare',
		scope: 'The whole kit: the web app and API, the CLI, the shared contracts, the scripts and CI',
		coverageUnits: 80,
		agentCalls: 97,
		confirmed: { high: 2, medium: 10, low: 9 },
		fixedIn: ['0.29.0'],
	},
	{
		id: 'run-2',
		date: '2026-11-09',
		commit: 'f5da310',
		repo: 'rocketflare-plugins',
		scope: 'Every plugin in rocketflare-plugins, installed on the kit at 4362c6b, plus the kit areas run 1 deferred',
		coverageUnits: 87,
		agentCalls: 79,
		confirmed: { high: 2, medium: 10, low: 10 },
		fixedIn: ['0.29.0', '3.9.0'],
	},
	{
		id: 'run-3',
		date: '2026-11-11',
		commit: 'f3cfeb2',
		repo: 'rocketflare',
		scope: 'Confirmation run over every kit and plugin change from 4362c6b to kit 0.33.0, with the plugins installed',
		coverageUnits: 82,
		agentCalls: 61,
		confirmed: { high: 0, medium: 0, low: 9 },
		fixedIn: ['0.34.0', '3.12.0'],
	},
]

/** How many findings both run 1 and run 2 confirmed (counted once in `FIXED`). */
export const CONFIRMED_IN_BOTH_FIRST_RUNS = 5

/**
 * What one release fixed: the findings it fixed, by severity, and the hardening changes that
 * shipped in it (candidates never confirmed exploitable, fixed anyway because the cautious change
 * was small). Numbers only; the individual issues are not published.
 */
export interface Fixed extends Record<Severity, number> {
	release: string
	repo: Repo
	hardening: number
}

export const FIXED: Fixed[] = [
	{ release: '0.29.0', repo: 'rocketflare', high: 2, medium: 13, low: 10, hardening: 10 },
	{ release: '3.9.0', repo: 'rocketflare-plugins', high: 1, medium: 5, low: 7, hardening: 5 },
	{ release: '0.34.0', repo: 'rocketflare', high: 0, medium: 0, low: 8, hardening: 2 },
	{ release: '3.12.0', repo: 'rocketflare-plugins', high: 0, medium: 0, low: 1, hardening: 1 },
]

/** Which repository cut each release named here. A release missing here fails the build. */
const RELEASE_REPO: Record<string, Repo> = {
	'0.29.0': 'rocketflare',
	'0.34.0': 'rocketflare',
	'3.9.0': 'rocketflare-plugins',
	'3.12.0': 'rocketflare-plugins',
}

export const repoOfRelease = (release: string): Repo => {
	const repo = RELEASE_REPO[release]
	if (!repo) throw new Error(`security.ts: no repository known for release ${release}`)
	return repo
}

for (const f of FIXED) {
	if (repoOfRelease(f.release) !== f.repo) throw new Error(`security.ts: ${f.release} is not a ${f.repo} release`)
}

export const releaseUrl = (release: string) =>
	`${REPOS[repoOfRelease(release)].url}/releases/tag/${release}`

export interface FixedTotals extends Record<Severity, number> {
	/** Fixed findings, every severity. */
	findings: number
	hardening: number
}

/** Totals over some releases' counts. */
export const sumFixed = (list: Fixed[]): FixedTotals => {
	const t: FixedTotals = { high: 0, medium: 0, low: 0, findings: 0, hardening: 0 }
	for (const f of list) {
		for (const s of SEVERITIES) t[s] += f[s]
		t.hardening += f.hardening
	}
	t.findings = t.high + t.medium + t.low
	return t
}

/**
 * The track record in rounds: the runs whose findings one set of releases fixed, most recent first.
 * Each round has its own page at `/security/track-record/<slug>/`, with its counts by release.
 */
export const ROUNDS = [
	{
		slug: 'run-3',
		title: 'Run 3',
		summary: 'A confirmation run over everything that changed after the first audit, up to kit 0.33.0.',
		runIds: ['run-3'],
		releases: ['0.34.0', '3.12.0'],
	},
	{
		slug: 'runs-1-and-2',
		title: 'Runs 1 and 2',
		summary: 'The first audit: the whole kit, then every open plugin and the kit areas the first run deferred.',
		runIds: ['run-1', 'run-2'],
		releases: ['0.29.0', '3.9.0'],
	},
].map((r) => {
	const fixed = r.releases.map((rel) => {
		const f = FIXED.find((x) => x.release === rel)
		if (!f) throw new Error(`security.ts: round ${r.slug} names release ${rel}, which FIXED has no counts for`)
		return f
	})
	return {
		...r,
		path: `/security/track-record/${r.slug}/`,
		runs: RUNS.filter((run) => r.runIds.includes(run.id)),
		fixed,
		totals: sumFixed(fixed),
	}
})

export type Round = (typeof ROUNDS)[number]

if (ROUNDS.reduce((n, r) => n + r.fixed.length, 0) !== FIXED.length) {
	throw new Error('security.ts: a release in FIXED belongs to no round, or to more than one')
}
if (ROUNDS.reduce((n, r) => n + r.runs.length, 0) !== RUNS.length) {
	throw new Error('security.ts: a run belongs to no round')
}

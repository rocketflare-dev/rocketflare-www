/**
 * The public security track record on /security/: every audit run, every finding fixed in a
 * released version, and the hardening shipped alongside.
 *
 * Produced from the hand-curated public entries file the kit's `audit.mjs public-report`
 * validates (the same allowlisted fields: nothing else from a run is ever published), then kept
 * by hand. Rules for a new line: it is fixed and released, it names its fixing release, it is one
 * plain sentence describing what now holds, and a reader could not follow it to reproduce
 * anything. An item that was never confirmed exploitable goes in `HARDENING`, never `FINDINGS`.
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
	 * both confirmed counts in each, so these add up to more than `FINDINGS`.
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

/** How many findings both run 1 and run 2 confirmed (counted once in `FINDINGS`). */
export const CONFIRMED_IN_BOTH_FIRST_RUNS = 5

export interface Finding {
	severity: Severity
	line: string
	release: string
	repo: Repo
}

export const FINDINGS: Finding[] = [
	{ severity: 'high', repo: 'rocketflare', release: '0.29.0', line: 'A tenant admin could make someone an owner by inviting them as one; only an owner can now issue or resend an owner invitation.' },
	{ severity: 'high', repo: 'rocketflare', release: '0.29.0', line: 'Under identity-provider-managed tenancy, any signed-in user could take an organisation name the provider would later claim; creating or renaming one is now refused in that mode.' },
	{ severity: 'medium', repo: 'rocketflare', release: '0.29.0', line: 'A person still awaiting approval, or already rejected, could found an organisation of their own; that is now refused until they are admitted.' },
	{ severity: 'medium', repo: 'rocketflare', release: '0.29.0', line: 'An admin removed from an organisation kept their pending invitations and could use one to return; removal now revokes them.' },
	{ severity: 'medium', repo: 'rocketflare', release: '0.29.0', line: 'A global admin who lost the role kept support access to every organisation they had entered; losing the role now removes it in the same step.' },
	{ severity: 'medium', repo: 'rocketflare', release: '0.29.0', line: 'A person suspended at their identity provider kept the global admin role that provider had granted; suspension now clears it, and a manual grant stays.' },
	{ severity: 'medium', repo: 'rocketflare', release: '0.29.0', line: 'An identity plugin set up for one organisation could create a platform global admin; the identity seam now never creates or links a bootstrap admin address.' },
	{ severity: 'medium', repo: 'rocketflare', release: '0.29.0', line: 'An identity plugin with no proof of an email domain could create accounts in it; the seam now creates an account only for a domain the plugin proved.' },
	{ severity: 'medium', repo: 'rocketflare', release: '0.29.0', line: 'API key scopes were stored but not enforced, so a read-only key could write; every request now checks the key\'s scope.' },
	{ severity: 'medium', repo: 'rocketflare', release: '0.29.0', line: 'With sign-in limited to the identity provider, email sign-in links were hidden in the interface but still worked; the server now turns them off.' },
	{ severity: 'medium', repo: 'rocketflare', release: '0.29.0', line: 'A tenant admin could send a stored AI provider key to a different endpoint without entering it again; a stored key now stays with the provider and address it was saved for.' },
	{ severity: 'medium', repo: 'rocketflare', release: '0.29.0', line: 'Invitation mail had no sending limit; it now has a resend cooldown and daily limits per person and per organisation.' },
	{ severity: 'medium', repo: 'rocketflare', release: '0.29.0', line: 'Chat could run a tool that declares it needs a person\'s approval without asking; chat now neither offers nor runs such tools.' },
	{ severity: 'medium', repo: 'rocketflare', release: '0.29.0', line: 'Starting an agent that allows one run at a time could return another member\'s run; a caller who cannot see that run now gets a plain conflict.' },
	{ severity: 'medium', repo: 'rocketflare', release: '0.29.0', line: 'A member could get round the per-organisation agent spend and concurrency caps by creating more organisations; the organisations one person owns now have a ceiling.' },
	{ severity: 'low', repo: 'rocketflare', release: '0.29.0', line: 'Accepting an invitation could change the role of a membership the identity provider manages; that membership is now left as it is.' },
	{ severity: 'low', repo: 'rocketflare', release: '0.29.0', line: 'An identity event for an unknown subject could act on an account linked to a different subject by email alone; email matching now applies only to an unlinked account.' },
	{ severity: 'low', repo: 'rocketflare', release: '0.29.0', line: 'Following a link to the CLI sign-in page created an API key without asking; a key is now created only after the person confirms.' },
	{ severity: 'low', repo: 'rocketflare', release: '0.29.0', line: 'Sign-in mail was limited only per client address, not per recipient; each recipient now has its own limit.' },
	{ severity: 'low', repo: 'rocketflare', release: '0.29.0', line: 'The return-path check after sign-in accepted some malformed paths a browser treats as another site; one shared rule now checks every return path.' },
	{ severity: 'low', repo: 'rocketflare', release: '0.29.0', line: 'Live-update connections kept receiving an organisation\'s events after the person\'s membership or session was revoked; every revocation now closes them.' },
	{ severity: 'low', repo: 'rocketflare', release: '0.29.0', line: 'An agent run\'s token budget did not count prompt-cache tokens; it now does.' },
	{ severity: 'low', repo: 'rocketflare', release: '0.29.0', line: 'Re-syncing an external document left the replaced version\'s text searchable under the new visibility; the old text now goes in the same transaction.' },
	{ severity: 'low', repo: 'rocketflare', release: '0.29.0', line: 'Text written by members could reach an admin\'s terminal with control characters intact; the CLI now strips them from human-readable output.' },
	{ severity: 'low', repo: 'rocketflare', release: '0.29.0', line: 'Installing a plugin could write outside its own folders when its manifest named such paths; every path is now confined before anything is written.' },
	{ severity: 'high', repo: 'rocketflare-plugins', release: '3.9.0', line: 'Connecting Microsoft 365 did not prove which company\'s directory was being connected; consent now needs a verified sign-in by an administrator of that directory.' },
	{ severity: 'medium', repo: 'rocketflare-plugins', release: '3.9.0', line: 'The inbox accepted mail from an allow-listed address when the passing authentication belonged to another sender; the authentication must now match the allow-listed identity.' },
	{ severity: 'medium', repo: 'rocketflare-plugins', release: '3.9.0', line: 'The inbox\'s allow-list check and its stored sender could read the sender line differently; one parser now decides both.' },
	{ severity: 'medium', repo: 'rocketflare-plugins', release: '3.9.0', line: 'One inbound email could expand into a very large number of messages, jobs and stored files; one delivery now yields at most 50 messages.' },
	{ severity: 'medium', repo: 'rocketflare-plugins', release: '3.9.0', line: 'Issue reports shared one GitHub repository across organisations with nothing tying an issue to the one that filed it; each organisation now sees only its own issues.' },
	{ severity: 'medium', repo: 'rocketflare-plugins', release: '3.9.0', line: 'The web page tool fetched any address the model composed, so text could leave in a URL; it now fetches only addresses the person gave or a search returned.' },
	{ severity: 'low', repo: 'rocketflare-plugins', release: '3.9.0', line: 'FreeAgent write tools were offered to the read-only support role; they now follow the requester\'s manage permission.' },
	{ severity: 'low', repo: 'rocketflare-plugins', release: '3.9.0', line: 'FreeAgent and connector authorisation callbacks completed for an admin who had since been removed; they now re-check the admin\'s membership and role.' },
	{ severity: 'low', repo: 'rocketflare-plugins', release: '3.9.0', line: 'The inbox\'s forwarding-confirmation path, which skips the allow-list, accepted any account at the mail provider; it now needs the provider\'s own domain, during a setup window.' },
	{ severity: 'low', repo: 'rocketflare-plugins', release: '3.9.0', line: 'Forwarding-confirmation links were kept from any host whose address contained the provider\'s name; only the provider\'s own host is accepted now.' },
	{ severity: 'low', repo: 'rocketflare-plugins', release: '3.9.0', line: 'A released inbox address could be claimed at once by another organisation and receive mail meant for the first; released addresses are now held for 90 days.' },
	{ severity: 'low', repo: 'rocketflare-plugins', release: '3.9.0', line: 'Members could read the admin-only activity log through analytics; that data is now limited to admins.' },
	{ severity: 'low', repo: 'rocketflare-plugins', release: '3.9.0', line: 'The first member to open dashboards became a template page\'s creator and kept reading it after losing access; template pages no longer record a creator.' },
	{ severity: 'low', repo: 'rocketflare', release: '0.34.0', line: 'Two AI configuration saves at the same moment could leave a stored key beside an endpoint it was not saved with; a save now locks the row it replaces.' },
	{ severity: 'low', repo: 'rocketflare', release: '0.34.0', line: 'A tenant API key could act on its creator\'s other organisations and account-level requests; a key now acts only in its own organisation and on its creator\'s profile.' },
	{ severity: 'low', repo: 'rocketflare', release: '0.34.0', line: 'Typed decisions that fell back to the chat model were not counted against the agent run\'s budget; they are now metered like every other model call.' },
	{ severity: 'low', repo: 'rocketflare', release: '0.34.0', line: 'The per-recipient sign-in mail limit counted different spellings of one mailbox separately; it now counts per mailbox.' },
	{ severity: 'low', repo: 'rocketflare', release: '0.34.0', line: 'A demoted owner or admin kept pending invitations that still granted their old role; demotion now revokes the ones the new role could not issue.' },
	{ severity: 'low', repo: 'rocketflare', release: '0.34.0', line: 'An invitation kept the authority of a role its issuer had since lost; acceptance now re-checks the issuer.' },
	{ severity: 'low', repo: 'rocketflare', release: '0.34.0', line: 'The daily agent spend cap could be reset through the organisation lifecycle, and the ownership ceiling did not hold on every path; both now hold.' },
	{ severity: 'low', repo: 'rocketflare', release: '0.34.0', line: 'Agent runs carried on after an operator suspended the organisation; a suspended organisation now starts no runs, and its running ones stop.' },
	{ severity: 'low', repo: 'rocketflare-plugins', release: '3.12.0', line: 'A re-ranker key saved before any address was set was kept, and then sent, when another admin first set the address; that change now clears the key.' },
]

export interface Hardening {
	line: string
	release: string
}

/**
 * Changes made where a candidate could not be confirmed (it waited on a browser, a real identity
 * provider or a real model) and the conservative fix was small enough to ship anyway.
 */
export const HARDENING: Hardening[] = [
	{ release: '0.29.0', line: 'Markdown from the model or a document now shows images as links instead of loading them.' },
	{ release: '0.29.0', line: 'A tool approval now runs only the exact call the person was shown, once.' },
	{ release: '0.29.0', line: 'While a cost cap applies, a model the price table cannot cost is refused on the deployment\'s own key.' },
	{ release: '0.29.0', line: 'The AI connection test no longer repeats the provider\'s error text back.' },
	{ release: '0.29.0', line: 'Live-update connections now refuse a page from an origin outside the allow-list.' },
	{ release: '0.29.0', line: 'The cookie that carries a sign-in in progress is now bound to the host and always secure.' },
	{ release: '0.29.0', line: 'Microsoft sign-in now matches accounts on the user principal name and no longer reads the mail attribute.' },
	{ release: '0.29.0', line: 'Completing an email sign-in link now checks where the request came from, even with no session yet.' },
	{ release: '0.29.0', line: 'CLI login now checks that the browser callback belongs to the login it started.' },
	{ release: '0.29.0', line: 'Plugin installs and kit upgrades refuse any path outside the repository, inside .git or through a symlink, before writing.' },
	{ release: '3.9.0', line: 'The issue-reports review page shows images in a draft as links, and says what is sent to GitHub.' },
	{ release: '3.9.0', line: 'The inbox\'s agent tools now say that message content is written by the sender.' },
	{ release: '3.9.0', line: 'The inbox now reads mail authentication results only from its own receiving mail server.' },
	{ release: '3.9.0', line: 'Analytics caps how many queries one request can batch, and sets a statement timeout.' },
	{ release: '3.9.0', line: 'The web page tool reads page text with a bounded linear scan.' },
	{ release: '0.34.0', line: 'Upload paths keep a body size cap for every request beneath them instead of skipping it.' },
	{ release: '0.34.0', line: 'Microsoft sign-in now checks that an address is in a verified domain of the person\'s directory before it matches or admits an account.' },
	{ release: '3.12.0', line: 'The web page tool drops a URL fragment before requesting a page, so it sends only what it checked.' },
]

/** Which repository cut each release a line names. A release missing here fails the build. */
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

for (const f of FINDINGS) {
	if (repoOfRelease(f.release) !== f.repo) throw new Error(`security.ts: ${f.release} is not a ${f.repo} release`)
}

export const releaseUrl = (release: string) =>
	`${REPOS[repoOfRelease(release)].url}/releases/tag/${release}`

/** Counts by severity over a list of findings. */
export const countBySeverity = (list: Finding[]): Record<Severity, number> =>
	Object.fromEntries(SEVERITIES.map((s) => [s, list.filter((f) => f.severity === s).length])) as Record<
		Severity,
		number
	>

const SEVERITY_RANK: Record<Severity, number> = { high: 0, medium: 1, low: 2 }

/**
 * The track record in rounds: the runs whose findings one set of releases fixed, most recent first.
 * Each round has its own page at `/security/track-record/<slug>/`, which is the only place its
 * findings are listed; each list is ordered by severity.
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
].map((r) => ({
	...r,
	path: `/security/track-record/${r.slug}/`,
	runs: RUNS.filter((run) => r.runIds.includes(run.id)),
	findings: FINDINGS.filter((f) => r.releases.includes(f.release)).sort(
		(a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity]
	),
	hardening: HARDENING.filter((h) => r.releases.includes(h.release)),
}))

export type Round = (typeof ROUNDS)[number]

if (ROUNDS.reduce((n, r) => n + r.findings.length, 0) !== FINDINGS.length) {
	throw new Error('security.ts: a finding names a release no round lists')
}
if (ROUNDS.reduce((n, r) => n + r.hardening.length, 0) !== HARDENING.length) {
	throw new Error('security.ts: a hardening line names a release no round lists')
}
if (ROUNDS.reduce((n, r) => n + r.runs.length, 0) !== RUNS.length) {
	throw new Error('security.ts: a run belongs to no round')
}

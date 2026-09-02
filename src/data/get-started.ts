/**
 * Every literal the landing page and the Get Started page quote from the kit —
 * commands, the lines they print, flags, exit codes, skill names, demo
 * identities — in one place, so a change in the kit is one edit here.
 *
 * Glyphs are NOT stored: `Terminal` draws `$ ` before a `cmd` and `✔ ` before
 * an `ok` line, and `AgentChat` draws the ✔ of a checklist. Store the words,
 * let the component draw the mark.
 *
 * Sources (kit repo): scripts/bootstrap.{sh,mjs}, scripts/install.sh,
 * .claude/skills/{setup,adapt,provision}/SKILL.md, apps/web/scripts/provision.ts,
 * apps/web/scripts/seed.ts, SETUP.md Part 1 and Part 3.
 */
import { INSTALL_SH_URL } from './site'

// ---- Getting a copy -------------------------------------------------------

/** The directory every example clones into. */
export const APP_DIR = 'myapp'
/**
 * `--depth 1` because the kit's history is not yours — it is deleted on the next line. Shown as two
 * commands, never one bare `git clone`: a copy that keeps the kit's history fights a template that
 * carries on evolving (docs/ADAPTING.md §0). The one-liner below does both for you.
 */
export const CLONE_CMD = `git clone --depth 1 https://github.com/rocketflare-dev/rocketflare.git ${APP_DIR} && cd ${APP_DIR}`
/** Your history starts here; the kit commit is recorded so you can diff against it later. */
export const DETACH_CMD =
  'rm -rf .git && git init -q && git add -A && git commit -qm "Start from Rocketflare"'
/** Both of the above, as a terminal transcript. */
export const CLONE_LINES = [{ cmd: CLONE_CMD }, { cmd: DETACH_CMD }]

/** Clones, detaches the kit's history, then runs the bootstrap. */
export const INSTALL_CMD = `curl -fsSL ${INSTALL_SH_URL} | bash -s -- ${APP_DIR}`

// ---- The bootstrap --------------------------------------------------------

export const BOOTSTRAP_CMD = 'bash scripts/bootstrap.sh'
/** The same script once dependencies exist; re-running is always safe. */
export const BOOTSTRAP_RERUN_CMD = 'pnpm bootstrap'

export const APP_URL = 'http://localhost:3000'
export const API_URL = 'http://localhost:3001'

/** The demo owner the bootstrap signs you in as (`pnpm seed --demo`). */
export const DEMO = {
	ownerEmail: 'owner@example.test',
	ownerName: 'Olivia Bennett',
	org: 'Acme Logistics',
} as const

/** The dev-only auto-login the bootstrap opens at the end (the script URL-encodes the address, so `%40`). */
export const LOGIN_URL = `${APP_URL}/login?as=${encodeURIComponent(DEMO.ownerEmail)}`

export interface BootstrapStep {
	/** The word the script prints after `n/9`. */
	name: string
	/** The same step in plain words, for a checklist. */
	plain: string
}

/** In order; the script prints `✔ 1/9 toolchain` … `✔ 9/9 run`. */
export const BOOTSTRAP_STEPS: BootstrapStep[] = [
	{ name: 'toolchain', plain: 'Checked Node 24, pnpm and Docker, and installed what was missing' },
	{ name: 'install', plain: 'Installed the dependencies' },
	{ name: 'secrets', plain: 'Wrote the local secrets file with a fresh encryption key' },
	{ name: 'database', plain: 'Started Postgres in Docker' },
	{ name: 'migrate', plain: 'Created the database schema' },
	{ name: 'seed', plain: 'Seeded a demo organisation with people, documents and activity' },
	{ name: 'cloudflare', plain: 'Checked the free Cloudflare login the built-in AI needs (or turned that off with --offline)' },
	{ name: 'cli', plain: 'Signed the command-line tool in' },
	{ name: 'run', plain: 'Started the app on :3000 and the API on :3001' },
]

/** `1/9 toolchain` — what the script prints for step `i`, minus the ✔. */
export const bootstrapLine = (i: number) => `${i + 1}/${BOOTSTRAP_STEPS.length} ${BOOTSTRAP_STEPS[i].name}`

/** The last line the script prints before it opens the browser (minus the ✔). */
export const BOOTSTRAP_READY_LINE = `ready  ${LOGIN_URL}`
export const BOOTSTRAP_EXPECT = `Opens ${APP_URL}, signed in`

export interface Flag {
	flag: string
	what: string
}

/** `bash scripts/bootstrap.sh --help`, in the same order. */
export const BOOTSTRAP_FLAGS: Flag[] = [
	{ flag: '--offline', what: 'No Cloudflare account: turns the Workers AI binding off in both wrangler files. Chat, agents and embeddings then need a key or a tenant provider.' },
	{ flag: '--online', what: 'Keep (or restore) the Workers AI binding; fails if wrangler is not logged in.' },
	{ flag: '--no-dev', what: 'Stop after step 7 and print the commands to run next.' },
	{ flag: '--no-demo', what: 'Seed the organisation and accounts, but no demo data.' },
	{ flag: '--share-db', what: 'Accept a Postgres container started from another checkout.' },
	{ flag: '--no-open', what: 'Do not open the browser once the server answers.' },
	{ flag: '--as <email>', what: 'The seeded account to sign in as (default owner@example.test).' },
	{ flag: '--yes', what: 'Never prompt; a missing Cloudflare login exits 5 instead of asking.' },
	{ flag: '--verbose', what: "Stream every child's output." },
	{ flag: '--check', what: 'Read-only preflight (the same as pnpm preflight): toolchain, secrets, database, Cloudflare, dev status.' },
]

/** The four flags worth a table on the page. */
export const BOOTSTRAP_FLAGS_SHORT = ['--offline', '--no-demo', '--no-dev', '--check'].map(
	(f) => BOOTSTRAP_FLAGS.find((x) => x.flag === f)!,
)

export const BOOTSTRAP_EXIT_CODES: { code: number; meaning: string }[] = [
	{ code: 0, meaning: 'ok' },
	{ code: 1, meaning: 'a step failed' },
	{ code: 2, meaning: 'usage' },
	{ code: 3, meaning: 'prerequisite missing' },
	{ code: 4, meaning: 'port or container held by another checkout' },
	{ code: 5, meaning: 'Cloudflare login required' },
]

// ---- The agent path -------------------------------------------------------

export const AGENT_NAME = 'Claude Code'
/** What you type in the cloned folder to open it in Claude Code. */
export const AGENT_CLI_CMD = 'claude'
export const AGENT_PROMPT = 'Help me set up this project'

/** The skills the kit ships in `.claude/skills/`, as you type them. */
export const SKILLS = {
	setup: '/setup',
	adapt: '/adapt <slug> "Your App"',
	provision: '/provision',
} as const

// ---- By hand (SETUP.md Part 1) --------------------------------------------

export interface HandStep {
	title: string
	/** Commands, one per line in the terminal. */
	cmds: string[]
	/** Anything to do that is not a command. */
	note?: string
	/** The line that proves the step worked. */
	verify: string
}

export const BY_HAND_STEPS: HandStep[] = [
	{
		title: 'Install',
		cmds: ['corepack enable && pnpm install'],
		verify: 'pnpm -v prints 10.x and the install exits 0.',
	},
	{
		title: 'Local secrets',
		cmds: ['cp apps/web/.dev.vars.example apps/web/.dev.vars', 'openssl rand -hex 32'],
		note: 'Paste the random value as OAUTH_ENCRYPTION_KEY in apps/web/.dev.vars. Leave every optional key blank.',
		verify: 'The OAUTH_ENCRYPTION_KEY line has a 64-character value.',
	},
	{
		title: 'Database',
		cmds: ['pnpm dev:db:up && pnpm db:migrate'],
		verify: 'It ends with the number of migrations applied and no error.',
	},
	{
		title: 'Demo data',
		cmds: ['pnpm seed --demo'],
		verify: `It lists the seeded accounts (${DEMO.ownerEmail} among them) and prints one API key.`,
	},
	{
		title: 'Run it',
		cmds: ['pnpm dev'],
		verify: `Both servers report ready and ${APP_URL} shows the sign-in page.`,
	},
	{
		title: 'Sign in',
		cmds: [],
		note: `Open ${APP_URL}. Press the Owner quick-login button, or enter ${DEMO.ownerEmail} and open the magic link printed in the terminal (no email provider is configured, so links are logged, not sent).`,
		verify: `You land on Home as ${DEMO.ownerName}, owner of ${DEMO.org}.`,
	},
	{
		title: 'The command line',
		cmds: [`pnpm cli login --server ${API_URL}`, 'pnpm cli whoami'],
		verify: 'whoami prints your email, the organisation and a key prefix.',
	},
	{
		title: 'Tests',
		cmds: ['pnpm test:db:up && pnpm test'],
		verify: 'Every project is green.',
	},
]

// ---- Deploying (the /provision skill, SETUP.md Part 3) --------------------

export interface DeployAccount {
	name: string
	/** Why this account, in plain words. */
	role: string
	/** The plan or condition the kit needs. */
	plan?: string
	/** What to mint in its dashboard. */
	token: string
	/** Anything else to collect there that is not the token. */
	also?: string
	/** Where to create the account. */
	signupUrl: string
	/** Extra links that belong to the "before anything" step (plan, domain). */
	links?: { label: string; url: string }[]
	/** What to do in that account before minting anything — the kit cannot do this part. */
	first: string
	/** The variables the kit reads (from apps/web/.provision.env, or the environment in CI). */
	envVars: string[]
}

export const DEPLOY_ACCOUNTS: DeployAccount[] = [
	{
		name: 'Cloudflare',
		signupUrl: 'https://dash.cloudflare.com/sign-up',
		links: [
			{ label: 'Upgrade to Workers Paid', url: 'https://dash.cloudflare.com/?to=/:account/workers/plans' },
			{ label: 'Register a domain', url: 'https://dash.cloudflare.com/?to=/:account/domains/register' },
			{ label: 'Or add a domain you own', url: 'https://dash.cloudflare.com/?to=/:account/add-site' },
		],
		role: 'runs the app',
		plan: 'Workers Paid — Hyperdrive and Workflows need it',
		token: 'an API token',
		first:
			'Create the account and put it on Workers Paid. Then add the domain you want the app on — register it there, or move its DNS there — because the app’s hostnames and the email DNS records are created in that zone. No domain yet? Staging gets a workers.dev address and email is skipped.',
		/** Not on the token page: it sits in the right-hand column of the Workers & Pages overview. */
		also: 'your account id is in the right-hand column of the Workers & Pages overview',
		envVars: ['CLOUDFLARE_API_TOKEN', 'CLOUDFLARE_ACCOUNT_ID'],
	},
	{
		name: 'Neon',
		signupUrl: 'https://console.neon.tech/signup',
		role: 'hosts the Postgres database',
		first: 'Create the account. The free tier is enough for the two branches the kit makes.',
		token: 'an API key',
		envVars: ['NEON_API_KEY'],
	},
	{
		name: 'Resend',
		signupUrl: 'https://resend.com/signup',
		role: 'sends the sign-in and invitation emails',
		plan: 'optional — skip it with --skip-email and links are logged instead',
		first: 'Create the account. You will verify the same domain here; the free tier is enough.',
		token: 'an API key (full access)',
		envVars: ['RESEND_API_KEY'],
	},
]

/** The four variables, in the order the script reads them. */
export const DEPLOY_VARS = DEPLOY_ACCOUNTS.flatMap((a) => a.envVars)

/** Prompts for each token with hidden input, checks it against the vendor, writes the file. */
export const PROVISION_TOKENS_CMD = 'pnpm provision tokens'
/** Git-ignored, mode 0600; the environment overrides it (CI). Never .dev.vars — wrangler dev would hand account tokens to the Worker. */
export const PROVISION_ENV_FILE = 'apps/web/.provision.env'

export const PROVISION_CMD = 'pnpm provision all'
export const PROVISION_SKIP_EMAIL_FLAG = '--skip-email'

export interface ProvisionPhase {
	/** The phase name as `pnpm provision <phase>` takes it. */
	name: string
	/** What it does, in plain words. */
	plain: string
}

/** `pnpm provision all`, in order; each phase ends in one `Verify:` line. */
export const PROVISION_PHASES: ProvisionPhase[] = [
	{ name: 'preflight', plain: 'checks the tokens, the tools, the accounts, and that your domain is on Cloudflare' },
	{ name: 'email create', plain: 'creates the sending domain on Resend and its DNS records on Cloudflare' },
	{ name: 'neon', plain: 'creates the Neon project with a staging branch' },
	{ name: 'cloudflare', plain: 'creates Hyperdrive, KV, the queue and the R2 bucket, and writes their ids into both wrangler files' },
	{ name: 'migrate', plain: 'runs the migrations on each branch' },
	{ name: 'github', plain: 'sets the GitHub environment secrets' },
	{ name: 'urls', plain: 'sets the app URL and routes in each wrangler file' },
	{ name: 'deploy staging', plain: 'deploys staging and checks it answers' },
	{ name: 'secrets', plain: 'sets the Worker secrets, over stdin, never on disk' },
	{ name: 'email verify', plain: 'verifies the domain and mints the sending key' },
]

/** The word every phase ends on. */
export const PROVISION_VERIFY_WORD = 'Verify:'

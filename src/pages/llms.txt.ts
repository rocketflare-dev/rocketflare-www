import type { APIRoute } from 'astro'
import { CONCEPTS } from '../data/concepts'
import { PAGES } from '../data/pages'
import { START_PROMPT } from '../data/get-started'
import { GITHUB_URL } from '../data/site'

/**
 * https://llmstxt.org — a plain-text map of the site for AI answer engines,
 * generated from the same page registry and concept list the navigation
 * uses so it cannot drift.
 */
export const GET: APIRoute = ({ site }) => {
	const base = site?.toString().replace(/\/$/, '') ?? 'https://rocketflare.dev'

	const body = `# Rocketflare

> A free, open-source (MIT) SaaS starter kit. It is a complete, working web app
> you copy and make your own: sign-in, organisations, teams and permissions, an
> AI assistant that answers from your own documents, file uploads, background
> jobs and a command-line tool are already built and tested, and dashboards are
> a first-party plugin you add in one command. You add the product. It runs as one Cloudflare Worker over a normal Postgres database.

Who it is for: founders, small product teams and solo builders who want to ship
an internal tool, a customer portal or a B2B SaaS without spending the first
month rebuilding sign-in, teams, permissions and billing-adjacent plumbing. You
do need to be comfortable running commands in a terminal; you do not need to
know Cloudflare, and a coding agent can drive the whole setup.

What it costs: the kit is free and MIT licensed — use it commercially, keep your
changes private, no attribution required. Running it locally is free. Deploying
needs a Cloudflare Workers Paid plan and a Postgres database (a free Neon tier
works to start).

Stack, for anyone who wants it: Cloudflare Workers (fetch + queue + scheduled, a
Durable Object and a Workflow), Hono 4, zod contracts, CASL, Postgres 17 +
pgvector (Drizzle over the Neon serverless driver, or postgres.js through
Hyperdrive, chosen per deployment), React 19 + Vite,
drizzle-cube for analytics, a commander CLI. Node 26, pnpm 10.

Getting started: to start a new app, paste this prompt into Claude Code in the
folder where you keep your projects:

${START_PROMPT.join('\n')}

It runs the rf-start skill: it detaches the clone from the kit's history, gets the
app running, holds a design conversation (organisations, roles and words, AI,
money, licence, plugins, stages, brand), shows the design as pages in your
colours, then renames the kit to your app. To try the kit as it ships instead:
clone the repository, run "bash scripts/detach.sh", then "bash
scripts/bootstrap.sh" (macOS, Linux or Windows through WSL2, Docker running), or
open the folder in Claude Code and type /rf-setup (the repository also ships
/rf-preflight, /rf-adapt, /rf-provision and /rf-upgrade as skills). Local development needs a
free Cloudflare login only because the Workers AI binding always calls out
(--offline turns it off); deploying is scripted by "pnpm provision".

## Pages

${PAGES.filter((p) => p.ready)
	.map((p) => `- [${p.nav}](${base}${p.path}): ${p.description}`)
	.join('\n')}

## Concepts

${CONCEPTS.map((c) => `- [${c.title}](${base}/concepts/${c.slug}/): ${c.blurb}`).join('\n')}

## Source

- [Repository](${GITHUB_URL}): the kit itself, MIT licensed
- [docs/CONCEPTS.md](${GITHUB_URL}/blob/main/docs/CONCEPTS.md): the full subsystem reference
- [SETUP.md](${GITHUB_URL}/blob/main/SETUP.md): the step-by-step setup walkthrough
- [docs/DEPLOY.md](${GITHUB_URL}/blob/main/docs/DEPLOY.md): the Cloudflare topology reference
- [docs/ADAPTING.md](${GITHUB_URL}/blob/main/docs/ADAPTING.md): the rename checklist for a fresh copy
`

	return new Response(body, {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' },
	})
}

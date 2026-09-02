import type { APIRoute } from 'astro'
import { CONCEPTS } from '../data/concepts'
import { PAGES } from '../data/pages'
import { GITHUB_URL } from '../data/site'

/**
 * https://llmstxt.org — a plain-text map of the site for AI answer engines,
 * generated from the same page registry and concept list the navigation
 * uses so it cannot drift.
 */
export const GET: APIRoute = ({ site }) => {
	const base = site?.toString().replace(/\/$/, '') ?? 'https://rocketflare.dev'

	const body = `# Rocketflare

> An open-source, MIT-licensed starter kit for building a multi-tenant B2B SaaS
> product or internal tool on Cloudflare Workers. It ships tenancy, authentication,
> roles and permissions, background jobs, realtime, file storage, analytics
> dashboards, an AI agent layer and a CLI as a single Worker over Postgres — and it
> is written to be worked on by coding agents.

Stack: Cloudflare Workers (fetch + queue + scheduled, a Durable Object and a
Workflow), Hono 4, zod contracts, CASL, Postgres 17 + pgvector through Hyperdrive,
Drizzle over postgres.js, React 18 + Vite, drizzle-cube for analytics, a commander
CLI. Node 24, pnpm 10.

Getting started: clone the repository, open it in a coding agent, and ask it to
"Help me set up this project"; the repository's CLAUDE.md makes it walk SETUP.md
step by step. Local development needs a free Cloudflare account only because the
Workers AI binding always calls out; deploying needs Workers Paid for Hyperdrive
and Workflows.

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

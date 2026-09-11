#!/usr/bin/env node
/**
 * Regenerate `src/data/releases.ts` from a sibling checkout of the kit.
 *
 *   node scripts/sync-releases.mjs [--kit ../rocketflare] [--check]
 *
 * The site is a separate repository and must build without the kit beside it, so the release list
 * is committed data rather than a build-time read. This keeps it honest — the same arrangement as
 * `public/install.sh`, which is a byte-identical copy checked at release time.
 *
 * `summary` is the site's own one-line voice and is NEVER overwritten: an existing entry keeps its
 * summary, a new one gets a placeholder to write. Everything else comes from the note's frontmatter.
 *
 * `--check` writes nothing and exits 1 when the file is out of date — run it before a release.
 * Exit 0 ok · 1 out of date or error · 2 usage.
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const TARGET = path.join(ROOT, 'src', 'data', 'releases.ts')
const VERSION_RE = /^\d+\.\d+\.\d+$/
const PLACEHOLDER = 'TODO: one line, in the site’s voice — what this gives the reader.'

const args = process.argv.slice(2)
let kitDir = path.resolve(ROOT, '..', 'rocketflare')
let check = false
for (let i = 0; i < args.length; i++) {
	if (args[i] === '--kit') kitDir = path.resolve(args[++i])
	else if (args[i] === '--check') check = true
	else {
		process.stderr.write(`usage: node scripts/sync-releases.mjs [--kit <dir>] [--check]\n`)
		process.exit(2)
	}
}

const upgrades = path.join(kitDir, 'docs', 'upgrades')
const frontmatter = (text) => {
	const m = text.match(/^---\n([\s\S]*?)\n---\n/)
	if (!m) return null
	const data = {}
	for (const line of m[1].split('\n')) {
		const kv = line.match(/^([a-z_]+):\s*(.*)$/)
		if (!kv) continue
		const value = kv[2].trim()
		if (value === 'true' || value === 'false') data[kv[1]] = value === 'true'
		else if (value.startsWith('[')) {
			const inner = value.slice(1, -1).trim()
			data[kv[1]] = inner === '' ? [] : inner.split(',').map((s) => s.trim().replace(/^["']|["']$/g, ''))
		} else data[kv[1]] = value.replace(/^["']|["']$/g, '')
	}
	return data
}

const existing = readFileSync(TARGET, 'utf8')
const summaries = new Map()
for (const m of existing.matchAll(/version: '([\d.]+)',\s*\n\s*date: '[\d-]+',\s*\n\s*summary:\s*\n?\s*'((?:[^'\\]|\\.)*)'/g)) {
	summaries.set(m[1], m[2])
}

const releases = readdirSync(upgrades)
	.filter((f) => VERSION_RE.test(f.replace(/\.md$/, '')))
	.map((f) => {
		const data = frontmatter(readFileSync(path.join(upgrades, f), 'utf8'))
		const version = f.replace(/\.md$/, '')
		return {
			version,
			date: data.date,
			summary: summaries.get(version) ?? PLACEHOLDER,
			breaking: data.breaking === true,
			migrations: Array.isArray(data.migrations) && data.migrations.length > 0,
			areas: data.areas ?? [],
		}
	})
	.sort((a, b) => {
		const pa = a.version.split('.').map(Number)
		const pb = b.version.split('.').map(Number)
		for (let i = 0; i < 3; i++) if (pa[i] !== pb[i]) return pa[i] - pb[i]
		return 0
	})

const header = existing.slice(0, existing.indexOf('export const RELEASES: Release[] = ['))
const body =
	`export const RELEASES: Release[] = [\n` +
	releases
		.map(
			(r) =>
				`\t{\n\t\tversion: '${r.version}',\n\t\tdate: '${r.date}',\n\t\tsummary:\n\t\t\t'${r.summary.replace(/'/g, "\\'")}',\n\t\tbreaking: ${r.breaking},\n\t\tmigrations: ${r.migrations},\n\t\tareas: [${r.areas.map((a) => `'${a}'`).join(', ')}],\n\t},\n`
		)
		.join('') +
	`]\n\n/** Newest first — the order the changelog reads in. */\nexport const RELEASES_NEWEST_FIRST = [...RELEASES].reverse()\n\nexport const LATEST_RELEASE = RELEASES_NEWEST_FIRST[0]\n`

const next = header + body
if (check) {
	if (next !== existing) {
		process.stderr.write(
			'src/data/releases.ts is out of date with the kit — run `npm run sync:releases`\n'
		)
		process.exit(1)
	}
	process.stdout.write(`releases ok — ${releases.length} release(s)\n`)
	process.exit(0)
}
writeFileSync(TARGET, next)
const todo = releases.filter((r) => r.summary === PLACEHOLDER).map((r) => r.version)
process.stdout.write(
	`wrote src/data/releases.ts — ${releases.length} release(s)` +
		(todo.length > 0 ? `; write a summary for ${todo.join(', ')}\n` : '\n')
)

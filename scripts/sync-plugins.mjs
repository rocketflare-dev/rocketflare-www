#!/usr/bin/env node
/**
 * Sync what the plugin pages show from each plugin's repository on GitHub:
 *
 * 1. **Releases** → `src/data/plugin-releases.ts`: each public plugin's latest version, the tag
 *    that installs it, its `minKit` at that tag, and its own changelog entries.
 * 2. **READMEs** → `src/content/plugins/<id>.md`, which /plugins/<id>/ renders below the facts.
 *
 *   node scripts/sync-plugins.mjs [--ref <git ref>] [--check]
 *
 * **Releases.** Each plugin has its own version. A release is tagged `<id>-vX.Y.Z`; up to and
 * including 3.14.0 every plugin shipped at one version under a plain `X.Y.Z` tag. A plugin's
 * latest release is the highest version among its own tags and the plain ones, read with
 * `git ls-remote --tags`. Its `minKit` (and the version, as a cross-check) is read from
 * `<subdir>/rocketflare-plugin.json` AT that tag, never from `main`, which may already carry an
 * unreleased bump. Its changelog entries come from the repository's `CHANGELOG.md` on `main`:
 * a `## <id> X.Y.Z — date` section belongs to that plugin alone; a plain `## X.Y.Z — date`
 * section is split into its `**<id>** — …` paragraphs, or, with none, given to the plugin its
 * porting-note link names. A lockstep entry that only says "No change to <id>" is kept but flagged
 * `noChange`, so the page can say so in one line. Relative links in an entry point at GitHub at
 * that release's tag.
 *
 * **READMEs: why `main` by default, not the release tag.** A README is documentation, and
 * documentation is fixed on `main` without cutting a plugin release. Pinning to the tag would
 * freeze a typo until the next release. What must match the release — the version, `minKit`,
 * the `@<tag>` install command — comes from `src/data/plugin-releases.ts`, never from the README,
 * so the page stays exact about the release while the prose tracks the docs. `--ref <tag>` pins
 * the READMEs when that is ever wrong (releases are always read from tags and `main`).
 *
 * The site is its own repository and must build without GitHub, so the result is committed data,
 * the same arrangement as `sync:releases`. README rewrites on the way in: the leading `# title`
 * and the `> summary` under it are dropped (the page has its own); a link to another plugin's
 * directory or README becomes that plugin's page here; any other relative link becomes an
 * absolute GitHub URL at the same ref.
 *
 * `--check` fetches and compares, writes nothing, and exits 1 when a committed copy is stale or
 * missing. The plugin list is read from `src/data/plugins.ts` itself (Node ≥ 23.6 strips its
 * types), so there is no second list to keep in step.
 * A commercial plugin (`availability: 'partners'`) is never fetched: its repository is private,
 * and its page carries the facts from plugins.ts alone.
 * Exit 0 ok · 1 stale, missing or a fetch failed · 2 usage.
 */
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT = path.join(ROOT, 'src', 'content', 'plugins')

const args = process.argv.slice(2)
let ref = 'main'
let check = false
for (let i = 0; i < args.length; i++) {
	if (args[i] === '--ref' && args[i + 1]) ref = args[++i]
	else if (args[i] === '--check') check = true
	else {
		process.stderr.write('usage: node scripts/sync-plugins.mjs [--ref <git ref>] [--check]\n')
		process.exit(2)
	}
}

let PLUGINS
try {
	;({ PLUGINS } = await import(path.join(ROOT, 'src', 'data', 'plugins.ts')))
} catch (err) {
	process.stderr.write(`cannot read src/data/plugins.ts (${err.message}) — this needs Node ≥ 23.6\n`)
	process.exit(1)
}

/** `https://github.com/o/r` → `o/r`. */
const slugOf = (repo) => new URL(repo).pathname.replace(/^\/|\.git$/g, '')

/** The public plugins: a partners-only one lives in a private repository this script must not touch. */
const PUBLIC = PLUGINS.filter((p) => p.availability !== 'partners')

/** `plugins/analytics` → the plugin whose subdir it is, for links between plugins. */
const bySubdir = new Map(PUBLIC.filter((p) => p.subdir).map((p) => [p.subdir, p.id]))

/**
 * Rewrite one markdown link target. `base` is the README's directory, repository-relative.
 * Absolute URLs, anchors and mail links are left alone.
 */
export function rewriteLink(target, { repo, base, ref: at }) {
	if (/^([a-z]+:|#|\/\/)/i.test(target)) return target
	const [file, hash = ''] = target.split('#')
	const resolved = path.posix.normalize(path.posix.join(base, file))
	const plugin = bySubdir.get(resolved.replace(/\/(README\.md)?$/, ''))
	if (plugin) return `/plugins/${plugin}/${hash ? `#${hash}` : ''}`
	const kind = file.endsWith('/') || !/\.[a-z0-9]+$/i.test(file) ? 'tree' : 'blob'
	return `https://github.com/${slugOf(repo)}/${kind}/${at}/${resolved.replace(/\/$/, '')}${hash ? `#${hash}` : ''}`
}

/** The README as the page wants it: no title, no summary, every relative link made absolute. */
export function transform(markdown, ctx) {
	const body = markdown
		.replace(/^﻿?#\s[^\n]*\n+/, '')
		.replace(/^(>[^\n]*\n)+\n*/, '')
	// `[text](target)` and `![alt](target)`, but never inside a fenced code block.
	return body
		.split(/(```[\s\S]*?```)/)
		.map((chunk, i) =>
			i % 2 === 1
				? chunk
				: chunk.replace(/(!?\[[^\]]*\])\(([^)\s]+)\)/g, (_, label, target) => `${label}(${rewriteLink(target, ctx)})`)
		)
		.join('')
		.trimEnd()
}

let failed = false

// ── Releases ────────────────────────────────────────────────────────────────────────────────────

const RELEASES_FILE = path.join(ROOT, 'src', 'data', 'plugin-releases.ts')
const SEMVER = /^\d+\.\d+\.\d+$/
const cmpVersion = (a, b) => {
	const pa = a.split('.').map(Number)
	const pb = b.split('.').map(Number)
	for (let i = 0; i < 3; i++) if (pa[i] !== pb[i]) return pa[i] - pb[i]
	return 0
}

/** Every tag in a repository, without the GitHub API (no token, no rate limit). */
function tagsOf(repo) {
	const out = execFileSync('git', ['ls-remote', '--tags', '--refs', `${repo}.git`], { encoding: 'utf8' })
	return out
		.split('\n')
		.filter(Boolean)
		.map((line) => line.split('\trefs/tags/')[1])
}

async function fetchText(url) {
	const res = await fetch(url)
	if (!res.ok) throw new Error(`${url} — HTTP ${res.status}`)
	return res.text()
}

const escapeHtml = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** A changelog paragraph's inline markdown (code, bold, links) as HTML; links resolved at `ctx.ref`. */
export function inlineHtml(text, ctx) {
	return text
		.split(/(`[^`]*`)/)
		.map((chunk, i) => {
			if (i % 2 === 1) return `<code>${escapeHtml(chunk.slice(1, -1))}</code>`
			return escapeHtml(chunk)
				.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
				.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, target) => {
					const href = rewriteLink(target.replace(/&amp;/g, '&'), ctx)
					const external = /^https?:/.test(href)
					return `<a href="${escapeHtml(href)}"${external ? ' target="_blank" rel="noopener"' : ''}>${label}</a>`
				})
		})
		.join('')
}

/**
 * The repository's CHANGELOG.md as `{ id → [{ version, date, tag, text, noChange }] }`, newest
 * first. `ids` are the plugins in this repository; a paragraph is credited to one of them only.
 */
export function parseChangelog(markdown, ids) {
	const known = new Set(ids)
	const byId = new Map(ids.map((id) => [id, []]))
	const sections = markdown.split(/^## /m).slice(1)
	for (const section of sections) {
		const [heading, ...rest] = section.split('\n')
		const m = /^(?:([a-z0-9-]+) )?(\d+\.\d+\.\d+) — (\d{4}-\d{2}-\d{2})\s*$/.exec(heading)
		if (!m) continue // "Before this repository existed" and the like
		const [, own, version, date] = m
		const tag = own ? `${own}-v${version}` : version
		const paragraphs = rest
			.join('\n')
			.split(/\n\s*\n/)
			.map((para) => para.trim().replace(/\s*\n\s*/g, ' '))
			.filter(Boolean)
		const entries = [] // [{ id, text }]
		for (const para of paragraphs) {
			const bold = /^\*\*([a-z0-9-]+)\*\* — /.exec(para)
			if (own) {
				if (!known.has(own)) break
				if (entries.length) entries[0].text += `\n\n${para}`
				else entries.push({ id: own, text: para })
			} else if (bold && known.has(bold[1])) {
				entries.push({ id: bold[1], text: para.slice(bold[0].length) })
			} else if (entries.length) {
				entries.at(-1).text += `\n\n${para}`
			} else {
				const link = /\]\(plugins\/([a-z0-9-]+)\/docs\/upgrades\//.exec(para)
				if (link && known.has(link[1])) entries.push({ id: link[1], text: para })
			}
		}
		for (const { id, text } of entries) {
			byId.get(id).push({ version, date, tag, text, noChange: /^No change to /.test(text) })
		}
	}
	for (const list of byId.values()) list.sort((a, b) => cmpVersion(b.version, a.version))
	return byId
}

async function syncReleases() {
	const repos = new Map()
	for (const p of PUBLIC) {
		if (!p.subdir) continue
		if (!repos.has(p.repo)) repos.set(p.repo, [])
		repos.get(p.repo).push(p)
	}
	const result = {}
	for (const [repo, plugins] of repos) {
		const tags = tagsOf(repo)
		const lockstep = tags.filter((t) => SEMVER.test(t))
		const changelog = parseChangelog(
			await fetchText(`https://raw.githubusercontent.com/${slugOf(repo)}/main/CHANGELOG.md`),
			plugins.map((p) => p.id)
		)
		for (const p of plugins) {
			const own = tags
				.filter((t) => t.startsWith(`${p.id}-v`) && SEMVER.test(t.slice(p.id.length + 2)))
				.map((t) => ({ tag: t, version: t.slice(p.id.length + 2) }))
			const entries = changelog.get(p.id)
			// A plain tag counts for a plugin only once it existed: from its first changelog entry on.
			const first = entries.at(-1)?.version
			const plain = lockstep
				.filter((t) => first && cmpVersion(t, first) >= 0)
				.map((t) => ({ tag: t, version: t }))
			const latest = [...own, ...plain].sort((a, b) => cmpVersion(b.version, a.version))[0]
			if (!latest) throw new Error(`${p.id}: no release tag in ${repo}`)
			const manifest = JSON.parse(
				await fetchText(`https://raw.githubusercontent.com/${slugOf(repo)}/${latest.tag}/${p.subdir}/rocketflare-plugin.json`)
			)
			if (manifest.version !== latest.version) {
				throw new Error(`${p.id}: tag ${latest.tag} carries manifest version ${manifest.version}`)
			}
			if (!entries.some((e) => e.version === latest.version)) {
				throw new Error(`${p.id}: CHANGELOG.md has no entry for ${latest.version}`)
			}
			result[p.id] = {
				version: latest.version,
				tag: latest.tag,
				minKit: manifest.minKit,
				releases: entries.map((e) => ({
					version: e.version,
					date: e.date,
					tag: e.tag,
					noChange: e.noChange,
					html: e.text
						.split('\n\n')
						.map((para) => `<p>${inlineHtml(para, { repo, base: '', ref: e.tag })}</p>`)
						.join(''),
				})),
			}
		}
	}
	return result
}

let releases
try {
	releases = await syncReleases()
} catch (err) {
	process.stderr.write(`✖ releases: ${err.message}\n`)
	failed = true
}
if (releases) {
	const q = (v) => `'${String(v).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
	const body = Object.entries(releases)
		.map(
			([id, r]) =>
				`\t${q(id)}: {\n\t\tversion: ${q(r.version)},\n\t\ttag: ${q(r.tag)},\n\t\tminKit: ${q(r.minKit)},\n\t\treleases: [\n` +
				r.releases
					.map(
						(e) =>
							`\t\t\t{ version: ${q(e.version)}, date: ${q(e.date)}, tag: ${q(e.tag)}, noChange: ${e.noChange},\n\t\t\t\thtml: ${q(e.html)} },\n`
					)
					.join('') +
				`\t\t],\n\t},\n`
		)
		.join('')
	const next =
		`// Generated by \`npm run sync:plugins\` from each plugin's tags, manifest and CHANGELOG.md — do not edit.\n\n` +
		`export interface PluginReleaseEntry {\n\tversion: string\n\tdate: string\n\t/** The git tag: \`<id>-vX.Y.Z\`, or a plain \`X.Y.Z\` for a lockstep release. */\n\ttag: string\n\t/** A lockstep release that changed nothing in this plugin. */\n\tnoChange: boolean\n\t/** The changelog entry as HTML, one paragraph element each. */\n\thtml: string\n}\n\n` +
		`export interface PluginRelease {\n\t/** The latest release. */\n\tversion: string\n\t/** The tag that installs it. */\n\ttag: string\n\t/** The manifest's \`minKit\` at that tag. */\n\tminKit: string\n\t/** Newest first. */\n\treleases: PluginReleaseEntry[]\n}\n\n` +
		`export const PLUGIN_RELEASES: Record<string, PluginRelease> = {\n${body}}\n`
	const current = existsSync(RELEASES_FILE) ? readFileSync(RELEASES_FILE, 'utf8') : null
	if (check) {
		if (current !== next) {
			process.stderr.write(`✖ releases: src/data/plugin-releases.ts is ${current ? 'stale' : 'missing'}\n`)
			failed = true
		}
	} else {
		writeFileSync(RELEASES_FILE, next)
		for (const [id, r] of Object.entries(releases)) {
			process.stdout.write(`${current === next ? '·' : '✔'} ${id} ${r.version} (${r.tag}, kit ≥ ${r.minKit}, ${r.releases.length} entries)\n`)
		}
	}
}

// ── READMEs ─────────────────────────────────────────────────────────────────────────────────────

const withReadme = PUBLIC.filter((p) => p.readme)
for (const p of withReadme) {
	const url = `https://raw.githubusercontent.com/${slugOf(p.repo)}/${ref}/${p.readme}`
	let text
	try {
		const res = await fetch(url)
		if (!res.ok) throw new Error(`HTTP ${res.status}`)
		text = await res.text()
	} catch (err) {
		process.stderr.write(`✖ ${p.id}: ${url} — ${err.message}\n`)
		failed = true
		continue
	}
	const source = `https://github.com/${slugOf(p.repo)}/blob/${ref}/${p.readme}`
	const body = transform(text, { repo: p.repo, base: path.posix.dirname(p.readme), ref })
	const next = `---\n# Generated by \`npm run sync:plugins\` — edit the plugin's README, not this file.\nsource: ${source}\n---\n\n${body}\n`
	const file = path.join(OUT, `${p.id}.md`)
	const current = existsSync(file) ? readFileSync(file, 'utf8') : null
	if (check) {
		if (current !== next) {
			process.stderr.write(`✖ ${p.id}: src/content/plugins/${p.id}.md is ${current ? 'stale' : 'missing'}\n`)
			failed = true
		}
		continue
	}
	mkdirSync(OUT, { recursive: true })
	writeFileSync(file, next)
	process.stdout.write(`${current === next ? '·' : '✔'} ${p.id} ← ${source}\n`)
}

if (check && !failed) process.stdout.write(`plugins ok — releases current, ${withReadme.length} README(s) match ${ref}\n`)
if (check && failed) process.stderr.write('run `npm run sync:plugins` and commit the result\n')
process.exit(failed ? 1 : 0)

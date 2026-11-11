#!/usr/bin/env node
/**
 * Copy the kit's three security documents — docs/THREAT-MODEL.md, docs/SECURITY-AUDIT.md and
 * SECURITY.md — into `src/content/security/<slug>.md`, which /security/<slug>/ renders.
 *
 *   node scripts/sync-security.mjs [--ref <git ref>] [--kit <checkout>] [--check]
 *
 * **Read from a local kit checkout, at a ref.** `git -C <kit> show <ref>:<path>`, so the copy is
 * exactly the text at that ref and nothing in the working tree. The kit checkout defaults to
 * `../rocketflare` (`--kit` or `ROCKETFLARE_KIT` override); the ref defaults to
 * `SECURITY_DOCS_TAG` in `src/data/site.ts` — the release that ships the docs, so the pages and
 * the kit cannot drift apart. Fetch in the kit first; this script never fetches, checks out or
 * writes there.
 *
 * Each copy records its ref and commit in frontmatter, and the page says which kit it came from.
 *
 * **Links are rewritten on the way in, and a link that cannot be mapped fails the sync:**
 * - between the three docs (relative, or an absolute GitHub URL to one) → their page here. The
 *   three are never linked on GitHub;
 * - `docs/CONCEPTS.md#<section>` → the matching /concepts/<slug>/ page (from
 *   `src/data/concepts.ts`), §18 Security testing → /security/, the bare file → /concepts/;
 *   an anchor with no page fails;
 * - any other relative link → the file on GitHub at the synced tag (or commit, when the ref is
 *   not a tag), after checking the file exists at that ref — a missing one fails.
 * The leading `# title` is dropped (the page has its own h1). Fenced and inline code is left alone.
 *
 * `--check` regenerates in memory, writes nothing, and exits 1 when a committed copy differs.
 * Exit 0 ok · 1 stale, missing, an unmappable link or a git failure · 2 usage.
 */
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT = path.join(ROOT, 'src', 'content', 'security')
const USAGE = 'usage: node scripts/sync-security.mjs [--ref <git ref>] [--kit <checkout>] [--check]\n'

const { SECURITY_DOCS } = await import(path.join(ROOT, 'src', 'data', 'security-docs.ts'))
const { CONCEPTS } = await import(path.join(ROOT, 'src', 'data', 'concepts.ts'))
const { GITHUB_URL, SECURITY_DOCS_TAG } = await import(path.join(ROOT, 'src', 'data', 'site.ts'))

const args = process.argv.slice(2)
let ref = SECURITY_DOCS_TAG
let kit = process.env.ROCKETFLARE_KIT ?? path.resolve(ROOT, '..', 'rocketflare')
let check = false
for (let i = 0; i < args.length; i++) {
	if (args[i] === '--ref' && args[i + 1]) ref = args[++i]
	else if (args[i] === '--kit' && args[i + 1]) kit = path.resolve(args[++i])
	else if (args[i] === '--check') check = true
	else {
		process.stderr.write(USAGE)
		process.exit(2)
	}
}

const git = (...a) =>
	execFileSync('git', ['-C', kit, ...a], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
const fail = (msg) => {
	process.stderr.write(`✖ ${msg}\n`)
	process.exit(1)
}

let commit
try {
	commit = git('rev-parse', '--verify', `${ref}^{commit}`).trim()
} catch {
	fail(`'${ref}' is not a commit in ${kit} — fetch there first (git -C ${kit} fetch origin --tags), or pass --ref`)
}
/** A tag names the release on GitHub; any other ref (a branch, `origin/x`) is pinned by commit. */
const isTag = (() => {
	try {
		git('rev-parse', '--verify', '-q', `refs/tags/${ref}`)
		return true
	} catch {
		return false
	}
})()
const githubAt = isTag ? ref : commit

/** `docs/THREAT-MODEL.md` → its doc entry. */
const byPath = new Map(SECURITY_DOCS.map((d) => [d.path, d]))
/** `2-auth` → `/concepts/auth/`. §18 is the security testing section, which /security/ covers. */
const conceptByAnchor = new Map(
	CONCEPTS.filter((c) => c.anchor).map((c) => [c.anchor, `/concepts/${c.slug}/`])
)
conceptByAnchor.set('18-security-testing', '/security/')

const existsAtRef = (p) => {
	try {
		git('cat-file', '-e', `${commit}:${p}`)
		return true
	} catch {
		return false
	}
}

/** A GitHub URL into the kit repository at any ref → its repository path, else null. */
const kitPathOf = (url) => {
	const m = url.match(/^https:\/\/github\.com\/rocketflare-dev\/rocketflare\/(?:blob|tree)\/[^/]+\/([^#?]+)(#.*)?$/)
	return m ? { file: m[1], hash: m[2] ?? '' } : null
}

/** Rewrite one link target found in the doc at `docPath`. Throws on one it cannot map. */
export function rewriteLink(target, docPath) {
	if (/^(#|mailto:)/i.test(target)) return target
	if (/^[a-z]+:|^\/\//i.test(target)) {
		const kitFile = kitPathOf(target)
		const doc = kitFile && byPath.get(kitFile.file)
		return doc ? `/security/${doc.slug}/${kitFile.hash}` : target
	}
	const [file, hash = ''] = target.split('#')
	const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(docPath), file))
	if (resolved.startsWith('..')) throw new Error(`${target} leaves the repository`)
	const doc = byPath.get(resolved)
	if (doc) return `/security/${doc.slug}/${hash ? `#${hash}` : ''}`
	if (resolved === 'docs/CONCEPTS.md') {
		if (!hash) return '/concepts/'
		const page = conceptByAnchor.get(hash)
		if (!page) throw new Error(`${target}: no site page for CONCEPTS.md section '${hash}'`)
		return page
	}
	const clean = resolved.replace(/\/$/, '')
	if (!existsAtRef(clean)) throw new Error(`${target}: ${clean} does not exist at ${ref}`)
	const kind = git('cat-file', '-t', `${commit}:${clean}`).trim() === 'tree' ? 'tree' : 'blob'
	return `${GITHUB_URL}/${kind}/${githubAt}/${clean}${hash ? `#${hash}` : ''}`
}

/** The doc as the page wants it: no h1, every link mapped, and the links it could not map. */
export function transform(markdown, docPath) {
	const body = markdown.replace(/^\uFEFF?#\s[^\n]*\n+/, '')
	const problems = []
	const out = body
		.split(/(```[\s\S]*?```)/)
		.map((chunk, i) =>
			i % 2 === 1
				? chunk
				: // An inline code span is left alone; a link whose label holds code is still a link.
					chunk.replace(/(!?\[(?:[^\]`]|`[^`\n]*`)*\])\(([^)\s]+)\)|`[^`\n]*`/g, (whole, label, target) => {
						if (!label) return whole
						try {
							return `${label}(${rewriteLink(target, docPath)})`
						} catch (err) {
							problems.push(err.message)
							return whole
						}
					})
		)
		.join('')
		.trimEnd()
	return { body: out, problems }
}

let failed = false
for (const d of SECURITY_DOCS) {
	let text
	try {
		text = git('show', `${commit}:${d.path}`)
	} catch {
		process.stderr.write(`✖ ${d.slug}: ${d.path} does not exist at ${ref}\n`)
		failed = true
		continue
	}
	const { body, problems } = transform(text, d.path)
	if (problems.length) {
		for (const p of problems) process.stderr.write(`✖ ${d.slug}: unmappable link — ${p}\n`)
		failed = true
		continue
	}
	const next = [
		'---',
		"# Generated by `npm run sync:security` — edit the kit's file, not this one.",
		`source: ${d.path}`,
		`ref: ${ref}`,
		`commit: ${commit}`,
		`tag: ${isTag ? ref : 'null'}`,
		'---',
		'',
		body,
		'',
	].join('\n')
	const file = path.join(OUT, `${d.slug}.md`)
	const current = existsSync(file) ? readFileSync(file, 'utf8') : null
	if (check) {
		if (current !== next) {
			process.stderr.write(`✖ ${d.slug}: src/content/security/${d.slug}.md is ${current ? 'stale' : 'missing'}\n`)
			failed = true
		}
		continue
	}
	mkdirSync(OUT, { recursive: true })
	writeFileSync(file, next)
	process.stdout.write(`${current === next ? '·' : '✔'} ${d.slug} ← ${d.path} @ ${ref} (${commit.slice(0, 7)})\n`)
}

if (check && !failed) process.stdout.write(`security docs ok — ${SECURITY_DOCS.length} match ${ref}\n`)
if (check && failed) process.stderr.write('run `npm run sync:security` and commit the result\n')
process.exit(failed ? 1 : 0)

/**
 * Markdown twins, written into dist/ after `astro build`.
 *
 * For every indexable page this emits `<route>.md` (so /concepts/ai/ also
 * answers at /concepts/ai.md) and concatenates the lot into /llms-full.txt.
 *
 * Why: the measured evidence is that AI *answer* engines read the HTML and
 * almost never fetch a markdown twin or llms.txt — so this is not an SEO
 * trick and is not sold as one. The reader it does serve is the one this site
 * is written for: a coding assistant (Claude Code, Cursor, Copilot) asked
 * "what should I build this on", which pulls documentation live and pays for
 * every token of page chrome it reads through. The twins are that reader's
 * copy, at a fraction of the bytes.
 *
 * The page order, and the set of pages, come from the sitemap — so a noindex
 * page (the OG template) is excluded here for free, and this script never
 * needs its own copy of the page registry.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'

const DIST = path.resolve('dist')
const SITE = 'https://rocketflare.dev'

const ENTITIES = {
	'&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&apos;': "'",
	'&nbsp;': ' ', '&mdash;': '—', '&ndash;': '–', '&hellip;': '…',
	'&lbrace;': '{', '&rbrace;': '}', '&copy;': '©', '&rsquo;': '’', '&lsquo;': '‘',
	'&ldquo;': '“', '&rdquo;': '”',
}

/** Entities only — whitespace is meaningful inside a code block. */
const decodeEntities = (s) => s.replace(/&[a-zA-Z#0-9]+;/g, (m) => ENTITIES[m] ?? m)
/** For prose, where a run of whitespace is one space. */
const decode = (s) => decodeEntities(s).replace(/\s+/g, ' ')

const strip = (s) => s.replace(/<[^>]+>/g, '')

/** The readable body of a page: the concept article, else <main>. */
function contentOf(html) {
	// Astro appends a scoped `astro-<hash>` class to styled elements, so these
	// match the class among others rather than as the whole attribute — an
	// exact match silently misses and every concept page falls through to
	// <main>, dragging its sidebar and hero into the file.
	const article = html.match(/<article\b[^>]*class="[^"]*\bprose\b[^"]*"[^>]*>([\s\S]*?)<\/article>/)
	if (article) return article[1]
	const main = html.match(/<main\b[^>]*\bid="main"[^>]*>([\s\S]*?)<\/main>/)
	if (main) return main[1]
	return null
}

/**
 * A deliberately small HTML-to-markdown pass. The input is this site's own
 * output, so the tag set is known and fixed; anything unrecognised has its
 * tags dropped and its text kept, which degrades to plain prose rather than
 * letting markup leak into the file.
 */
function toMarkdown(html) {
	let s = html

	// Decorative or non-textual: remove outright, with their contents.
	s = s.replace(/<(script|style|svg|noscript|template)\b[\s\S]*?<\/\1>/g, ' ')
	// Navigation, not content: the previous/next pager and the concept sidebar.
	s = s.replace(/<nav\b[^>]*class="[^"]*\bpager\b[^"]*"[\s\S]*?<\/nav>/g, ' ')
	s = s.replace(/<aside\b[^>]*class="[^"]*\bside\b[^"]*"[\s\S]*?<\/aside>/g, ' ')
	// <picture> wraps <source>s around one <img>; keep the img.
	s = s.replace(/<source\b[^>]*>/g, ' ')

	// A line break is a space, applied before anything reads a heading's text:
	// the inline rules below strip tags without a separator, which would turn a
	// two-line <h1> into "Ship your product.Not the platform."
	s = s.replace(/<br\b[^>]*>/g, ' ')

	// Code first, held aside by an ASCII sentinel: the inline rules below must
	// not touch its contents, and its newlines have to survive.
	const blocks = []
	s = s.replace(/<pre\b[^>]*>([\s\S]*?)<\/pre>/g, (_, inner) => {
		blocks.push('```\n' + decodeEntities(strip(inner)).trim() + '\n```')
		return '\n@@CODE' + (blocks.length - 1) + '@@\n'
	})

	s = s.replace(/<img\b[^>]*\balt="([^"]*)"[^>]*>/g, (_, alt) => (alt ? '\n![' + alt + ']\n' : ' '))
	s = s.replace(/<a\b[^>]*\bhref="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g, (_, href, text) => {
		const label = decode(strip(text)).trim()
		if (!label) return ' '
		return '[' + label + '](' + (href.startsWith('/') ? SITE + href : href) + ')'
	})
	s = s.replace(/<code\b[^>]*>([\s\S]*?)<\/code>/g, (_, t) => '`' + decode(strip(t)).trim() + '`')
	s = s.replace(/<(strong|b)\b[^>]*>([\s\S]*?)<\/\1>/g, (_, __, t) => '**' + decode(strip(t)).trim() + '**')
	s = s.replace(/<(em|i)\b[^>]*>([\s\S]*?)<\/\1>/g, (_, __, t) => '*' + decode(strip(t)).trim() + '*')

	for (const level of [1, 2, 3, 4, 5, 6]) {
		const re = new RegExp('<h' + level + '\\b[^>]*>([\\s\\S]*?)</h' + level + '>', 'g')
		s = s.replace(re, (_, t) => '\n\n' + '#'.repeat(level) + ' ' + decode(strip(t)).trim() + '\n\n')
	}
	s = s.replace(/<li\b[^>]*>([\s\S]*?)<\/li>/g, (_, t) => '\n- ' + decode(strip(t)).trim())
	s = s.replace(/<(th|td)\b[^>]*>/g, ' | ')
	s = s.replace(/<(p|div|section|tr|br|ul|ol|table|figcaption|dd|dt)\b[^>]*>/g, '\n')
	s = s.replace(/<\/(p|div|section|tr|ul|ol|table|figcaption|dd|dt)>/g, '\n')
	s = s.replace(/<[^>]+>/g, ' ')

	s = s
		.split('\n')
		.map((line) => decode(line).trim())
		.join('\n')
		.replace(/\n{3,}/g, '\n\n')
		.replace(/[ \t]{2,}/g, ' ')
		.trim()

	return s.replace(/@@CODE(\d+)@@/g, (_, i) => blocks[Number(i)])
}

const titleOf = (html) => decode((html.match(/<title>([^<]*)<\/title>/) ?? [, ''])[1]).trim()
const descriptionOf = (html) =>
	decode((html.match(/<meta name="description" content="([^"]*)"/) ?? [, ''])[1]).trim()

/** `https://rocketflare.dev/concepts/ai/` -> where to read it and where to write it. */
function locate(loc) {
	const route = new URL(loc).pathname
	const slug = route.replace(/^\/|\/$/g, '')
	return {
		route,
		file: path.join(DIST, slug, 'index.html'),
		out: slug === '' ? path.join(DIST, 'index.md') : path.join(DIST, slug + '.md'),
	}
}

const sitemap = await readFile(path.join(DIST, 'sitemap-0.xml'), 'utf8')
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
if (locs.length === 0) throw new Error('md-twins: the sitemap listed no URLs')

const full = [
	'# Rocketflare — full text',
	'',
	'Every page of rocketflare.dev as plain markdown, in navigation order.',
	'Generated from the built site; the canonical HTML is at ' + SITE + '.',
	'',
]
let written = 0

for (const loc of locs) {
	const { route, file, out } = locate(loc)
	if (!existsSync(file)) {
		throw new Error('md-twins: ' + route + ' is in the sitemap but ' + file + ' does not exist')
	}

	const html = await readFile(file, 'utf8')
	const body = contentOf(html)
	if (body === null) throw new Error('md-twins: no article or main element in ' + route)

	const markdown = toMarkdown(body)
	if (markdown.length < 200) {
		throw new Error('md-twins: ' + route + ' produced only ' + markdown.length + ' characters')
	}

	const page =
		'# ' + titleOf(html) + '\n\n> ' + descriptionOf(html) + '\n\nSource: ' + SITE + route + '\n\n' + markdown + '\n'

	await mkdir(path.dirname(out), { recursive: true })
	await writeFile(out, page, 'utf8')
	written += 1

	full.push('---', '', page, '')
}

await writeFile(path.join(DIST, 'llms-full.txt'), full.join('\n'), 'utf8')
console.log('md-twins: ' + written + ' markdown twins + llms-full.txt')

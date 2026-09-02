/**
 * Lighthouse, mobile + desktop, on the pages that matter; prints one score row
 * per run and the failing weighted audits. Target: ≥ 95 in every category.
 *
 *   node scripts/verify/lighthouse.mjs            # all five pages
 *   node scripts/verify/lighthouse.mjs / /tour/   # a subset
 *
 * Reports land in /tmp/rf-verify/lh/<page>-<device>.json.
 */
import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync } from 'node:fs'
import { BASE, CHROME, LIGHTHOUSE } from './lib.mjs'

const pages = process.argv.slice(2).length
	? process.argv.slice(2)
	: ['/', '/tour/', '/get-started/', '/who-is-it-for/', '/concepts/auth/']
const OUT = '/tmp/rf-verify/lh'
mkdirSync(OUT, { recursive: true })

const CATS = ['performance', 'accessibility', 'best-practices', 'seo']
let belowTarget = 0
for (const path of pages) {
	const name = path.replaceAll('/', '') || 'home'
	for (const device of ['mobile', 'desktop']) {
		const file = `${OUT}/${name}-${device}.json`
		execFileSync(
			'node',
			[
				LIGHTHOUSE,
				BASE + path,
				...(device === 'desktop' ? ['--preset=desktop'] : []),
				'--quiet',
				'--chrome-flags=--headless=new --no-first-run',
				`--only-categories=${CATS.join(',')}`,
				'--output=json',
				`--output-path=${file}`,
			],
			{ env: { ...process.env, CHROME_PATH: CHROME }, stdio: ['ignore', 'ignore', 'inherit'] },
		)
		const r = JSON.parse(readFileSync(file, 'utf8'))
		const scores = CATS.map((c) => Math.round(r.categories[c].score * 100))
		if (scores.some((s) => s < 95)) belowTarget++
		console.log(
			path.padEnd(16),
			device.padEnd(8),
			CATS.map((c, i) => `${c.slice(0, 4)} ${String(scores[i]).padStart(3)}`).join('  '),
			' LCP',
			r.audits['largest-contentful-paint'].displayValue,
		)
		for (const c of CATS) {
			for (const ref of r.categories[c].auditRefs) {
				const a = r.audits[ref.id]
				if (ref.weight > 0 && a.score !== null && a.score < 0.9) {
					const nodes = (a.details?.items ?? []).slice(0, 3).map((i) => i.node?.selector ?? i.url ?? '').join(' | ')
					console.log(`    ✗ ${ref.id} (${a.score}) ${nodes}`)
				}
			}
		}
	}
}
if (belowTarget) {
	console.error(`\n${belowTarget} run(s) below 95`)
	process.exitCode = 1
}

/**
 * axe-core in BOTH themes — the contrast gate (Lighthouse only sees day).
 * Expect "clean" on every line; exits 1 otherwise.
 *
 *   node scripts/verify/axe.mjs                 # the default page set
 *   node scripts/verify/axe.mjs /concepts/ai/   # a subset
 */
import { AXE, launch, open } from './lib.mjs'

const pages = process.argv.slice(2).length
	? process.argv.slice(2)
	: ['/', '/tour/', '/get-started/', '/who-is-it-for/', '/changelog/', '/concepts/', '/concepts/auth/']
const browser = await launch()
let violations = 0
for (const theme of ['day', 'night']) {
	for (const path of pages) {
		const page = await open(browser, path, { theme })
		await page.addScriptTag({ path: AXE })
		const found = await page.evaluate(async () => {
			const res = await axe.run(document, { resultTypes: ['violations'] })
			return res.violations.map((v) => ({
				id: v.id,
				impact: v.impact,
				count: v.nodes.length,
				nodes: v.nodes.slice(0, 5).map((n) => ({
					target: n.target[0],
					message: (n.any[0]?.message ?? n.all[0]?.message ?? '').replace(/Fix any of the following:\s*/, '').slice(0, 160),
				})),
			}))
		})
		console.log(`${theme.padEnd(5)} ${path.padEnd(18)} ${found.length ? '' : 'clean'}`)
		for (const v of found) {
			violations += v.count
			console.log(`  ${v.id} (${v.impact}) ×${v.count}`)
			for (const n of v.nodes) console.log(`    ${n.target}\n      ${n.message}`)
		}
		await page.close()
	}
}
await browser.close()
if (violations) process.exitCode = 1

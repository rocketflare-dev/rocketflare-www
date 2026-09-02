/**
 * Regenerate public/og-image.png from /og/ (CLAUDE.md, "The OG image"):
 * 1200×630, device scale 1, day theme, fonts loaded. Run `npm run build`
 * afterwards so dist/ carries the new file, and look at it once.
 *
 *   node scripts/verify/og.mjs
 */
import { launch, open, sleep } from './lib.mjs'

const browser = await launch()
const page = await open(browser, '/og/', { width: 1200, height: 630, dsf: 1, theme: 'day' })
await page.evaluate(() => document.fonts.ready)
await sleep(300)
const size = await page.evaluate(() => ({ w: document.documentElement.scrollWidth, h: document.documentElement.scrollHeight }))
if (size.w !== 1200 || size.h !== 630) throw new Error(`/og/ is ${size.w}×${size.h}, expected 1200×630`)
await page.screenshot({ path: 'public/og-image.png', clip: { x: 0, y: 0, width: 1200, height: 630 } })
console.log('wrote public/og-image.png (1200×630) — now: npm run build')
await browser.close()

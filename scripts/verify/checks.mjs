/**
 * The headless checks that are not Lighthouse or axe (CLAUDE.md, "The full
 * pass"): LCP element, widths, no-JS, reduced motion, theme swap, structure,
 * keyboard. Every line is `ok`/`FAIL` + the evidence; exits 1 on any FAIL.
 *
 *   node scripts/verify/checks.mjs
 */
import { launch, open, sleep } from './lib.mjs'

const browser = await launch()
let failures = 0
const report = (ok, label, evidence) => {
	if (!ok) failures++
	console.log(`${ok ? 'ok  ' : 'FAIL'} ${label}${evidence ? '  ' + JSON.stringify(evidence) : ''}`)
}

// LCP on /: the hero text, never an image (the first Screenshot is `priority`).
for (const width of [1440, 390]) {
	const page = await browser.newPage()
	await page.setViewport({ width, height: width < 800 ? 844 : 900 })
	await page.evaluateOnNewDocument(() => {
		window.__lcp = []
		new PerformanceObserver((list) => {
			for (const e of list.getEntries()) window.__lcp.push({ tag: e.element?.tagName, cls: e.element?.className, url: e.url })
		}).observe({ type: 'largest-contentful-paint', buffered: true })
	})
	await page.goto('http://127.0.0.1:4399/', { waitUntil: 'networkidle0' })
	await sleep(500)
	const lcp = (await page.evaluate(() => window.__lcp)).at(-1)
	report(lcp?.tag === 'P' && lcp.cls === 'lede', `LCP@${width} is p.lede`, lcp)
	await page.close()
}

// Widths: no horizontal scroll, rocket clear of the copy, tabs tall enough.
for (const path of ['/', '/tour/', '/get-started/']) {
	for (const width of [390, 768, 1024, 1440]) {
		const page = await open(browser, path, { width, height: 900 })
		const r = await page.evaluate(() => {
			const box = (s) => document.querySelector(s)?.getBoundingClientRect()
			const rocket = box('.rocket')
			const lede = box('.hero .lede')
			return {
				sw: document.documentElement.scrollWidth,
				iw: innerWidth,
				overlap: rocket && lede ? rocket.left < lede.right && rocket.top < lede.bottom && rocket.bottom > lede.top : false,
				tabs: [...document.querySelectorAll('[role=tab]')].map((t) => Math.round(t.getBoundingClientRect().height)),
			}
		})
		report(r.sw <= r.iw && !r.overlap && r.tabs.every((h) => h >= 24), `${path}@${width}`, r)
		await page.close()
	}
}

// No JS: every block visible, JS-only chrome absent, tabs stacked with headings.
for (const path of ['/', '/get-started/']) {
	const page = await open(browser, path, { js: false, width: 1440 })
	const r = await page.evaluate(() => ({
		hiddenReveals: [...document.querySelectorAll('.reveal, .reveal-stagger > *')].filter((el) => getComputedStyle(el).opacity === '0').length,
		tablists: [...document.querySelectorAll('.tablist')].map((t) => getComputedStyle(t).display),
		copyButtons: [...document.querySelectorAll('.terminal .copy')].map((c) => getComputedStyle(c).display),
		panelTitles: [...document.querySelectorAll('.panel-title')].map((h) => getComputedStyle(h).position),
		navLinks: getComputedStyle(document.querySelector('.nav-links')).display,
	}))
	const ok =
		r.hiddenReveals === 0 &&
		r.tablists.every((d) => d === 'none') &&
		r.copyButtons.every((d) => d === 'none') &&
		r.panelTitles.every((p) => p === 'static') &&
		r.navLinks !== 'none'
	report(ok, `no-JS ${path}`, r)
	await page.close()
}

// JS on: after scrolling through, nothing is still waiting to reveal.
for (const path of ['/', '/who-is-it-for/']) {
	const page = await open(browser, path)
	await page.evaluate(async () => {
		for (let y = 0; y < document.body.scrollHeight; y += 600) {
			window.scrollTo(0, y)
			await new Promise((r) => setTimeout(r, 80))
		}
	})
	await sleep(1200)
	const hidden = await page.evaluate(() => [...document.querySelectorAll('.reveal, .reveal-stagger > *')].filter((el) => getComputedStyle(el).opacity === '0').length)
	report(hidden === 0, `reveals shown after scroll ${path}`, { hidden })
	await page.close()
}

// Reduced motion: nothing animates, nothing is hidden waiting for a transition.
for (const path of ['/', '/get-started/']) {
	const page = await open(browser, path, { reducedMotion: true })
	const r = await page.evaluate(() => ({
		animating: [...document.querySelectorAll('body *')].filter((el) => {
			const s = getComputedStyle(el)
			return s.animationName !== 'none' && parseFloat(s.animationDuration) > 0.01
		}).length,
		hidden: [...document.querySelectorAll('.reveal, .reveal-stagger > *')].filter((el) => getComputedStyle(el).opacity === '0').length,
	}))
	report(r.animating === 0 && r.hidden === 0, `reduced motion ${path}`, r)
	await page.close()
}

// Themes: one picture per theme, the sky follows.
for (const theme of ['day', 'night']) {
	const page = await open(browser, '/', { theme })
	const r = await page.evaluate(() => ({
		theme: document.documentElement.dataset.theme,
		light: [...new Set([...document.querySelectorAll('picture.light')].map((x) => getComputedStyle(x).display))],
		dark: [...new Set([...document.querySelectorAll('picture.dark')].map((x) => getComputedStyle(x).display))],
		rocket: !!document.querySelector('.rocket svg'),
	}))
	const shown = theme === 'night' ? r.dark : r.light
	const hiddenSet = theme === 'night' ? r.light : r.dark
	report(r.theme === theme && shown.join() === 'inline' && hiddenSet.join() === 'none' && r.rocket, `theme ${theme}`, r)
	await page.close()
}

// Structure + keyboard.
for (const path of ['/', '/tour/', '/get-started/', '/who-is-it-for/', '/changelog/',
	'/concepts/auth/', '/concepts/api/', '/concepts/feature-flags/', '/concepts/plugins/',
	'/use-cases/internal-tool/', '/use-cases/customer-portal/', '/use-cases/analytics-product/', '/costs/', '/compare/']) {
	const page = await open(browser, path)
	const r = await page.evaluate(() => {
		const levels = [...document.querySelectorAll('h1,h2,h3,h4')].map((h) => +h.tagName[1])
		const skips = levels.filter((l, i) => i && l - levels[i - 1] > 1).length
		const diagrams = [...document.querySelectorAll('svg.diagram')].map((s) => ({
			title: !!s.querySelector('title'),
			describedBy: !!document.getElementById(s.getAttribute('aria-describedby') ?? ''),
			labelledBy: !!document.getElementById(s.getAttribute('aria-labelledby') ?? ''),
		}))
		return {
			main: document.querySelectorAll('main').length,
			h1: document.querySelectorAll('h1').length,
			headingSkips: skips,
			shortAlts: [...document.querySelectorAll('img')].filter((i) => (i.alt ?? '').length < 15).length,
			unnamedButtons: [...document.querySelectorAll('button')].filter((b) => !b.textContent.trim() && !b.getAttribute('aria-label')).length,
			diagrams,
		}
	})
	const ok = r.main === 1 && r.h1 === 1 && r.headingSkips === 0 && r.shortAlts === 0 && r.unnamedButtons === 0 && r.diagrams.every((d) => d.title && d.describedBy && d.labelledBy)
	report(ok, `structure ${path}`, r)

	// Skip link: first Tab, visible after its transition, Enter targets #main.
	if (path === '/') {
		await page.keyboard.press('Tab')
		await sleep(400)
		const skip = await page.evaluate(() => {
			const a = document.activeElement
			const b = a.getBoundingClientRect()
			return { text: a.textContent, onScreen: b.top >= 0 && b.height > 0 }
		})
		await page.keyboard.press('Enter')
		await sleep(200)
		const hash = await page.evaluate(() => location.hash)
		report(skip.text === 'Skip to content' && skip.onScreen && hash === '#main', 'skip link', { ...skip, hash })
		for (const [sel, where] of [['.hood .hood-link a', 'band'], ['.cta .btn-ghost', 'bg-lift'], ['.split-term .copy', 'terminal']]) {
			await page.evaluate((s) => { const el = document.querySelector(s); el.scrollIntoView({ block: 'center' }); el.focus() }, sel)
			await sleep(300)
			const ring = await page.evaluate((s) => { const el = document.querySelector(s); const cs = getComputedStyle(el); return { focusVisible: el.matches(':focus-visible'), outline: cs.outlineStyle, width: cs.outlineWidth } }, sel)
			report(ring.focusVisible && ring.outline === 'solid' && parseFloat(ring.width) >= 2, `focus ring on ${where}`, ring)
		}
	}

	// Tabs keyboard model.
	if (await page.$('[role=tab]')) {
		await page.focus('[role=tab][aria-selected=true]')
		await page.keyboard.press('ArrowRight')
		const s = await page.evaluate(() => ({
			active: document.activeElement.getAttribute('role'),
			selected: [...document.querySelectorAll('[role=tab]')].map((t) => t.getAttribute('aria-selected')),
			hidden: [...document.querySelectorAll('.panel')].map((p) => p.hidden),
			hash: location.hash,
		}))
		const ok2 = s.active === 'tab' && s.selected[1] === 'true' && s.hidden[1] === false && s.hidden.filter(Boolean).length === s.hidden.length - 1 && s.hash.length > 1
		report(ok2, `tabs keyboard ${path}`, s)
	}
	await page.close()
}

await browser.close()
if (failures) {
	console.error(`\n${failures} check(s) failed`)
	process.exitCode = 1
}

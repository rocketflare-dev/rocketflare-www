/**
 * Headless Chrome for the verification pass (CLAUDE.md, "The full pass").
 *
 * puppeteer-core, lighthouse and axe-core are pinned in scripts/verify/package.json,
 * a package of their own: the site's `npm install` and CI never install them, and
 * the first run here does (`npm ci` beside this file). The browser is the installed
 * Google Chrome (CHROME_PATH overrides). Every launch gets a throwaway profile
 * under $TMPDIR, so nothing touches a real one.
 */
import { createRequire } from 'node:module'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
/** This package's node_modules, installed from its lockfile on first use. */
export const MODULES = join(HERE, 'node_modules')
if (!existsSync(join(MODULES, '.package-lock.json'))) {
	console.error('scripts/verify: installing puppeteer-core, lighthouse, axe-core (first run)…')
	execFileSync('npm', ['ci', '--no-audit', '--no-fund', '--silent'], { cwd: HERE, stdio: 'inherit' })
}
export const AXE = join(MODULES, 'axe-core/axe.min.js')
export const LIGHTHOUSE = join(MODULES, 'lighthouse/cli/index.js')
export const CHROME =
	process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
/** The served dist/ — `npx wrangler dev --port 4399 --ip 127.0.0.1`. */
export const BASE = process.env.BASE ?? 'http://127.0.0.1:4399'

const require = createRequire(join(HERE, 'package.json'))
export const puppeteer = require('puppeteer-core')

export async function launch() {
	return puppeteer.launch({
		executablePath: CHROME,
		headless: true,
		userDataDir: mkdtempSync(join(tmpdir(), 'rf-verify-')),
		args: ['--no-first-run', '--no-default-browser-check', '--hide-scrollbars'],
	})
}

/**
 * Open a page of the served site.
 * - `theme`: 'day' | 'night' — written to localStorage before the boot script runs
 * - `js: false`: scripts off (the no-JS pass)
 * - `reducedMotion`: emulate prefers-reduced-motion: reduce
 */
export async function open(browser, path, opts = {}) {
	const { width = 1440, height = 900, dsf = 1, theme, js = true, reducedMotion = false } = opts
	const page = await browser.newPage()
	await page.setViewport({ width, height, deviceScaleFactor: dsf })
	if (!js) await page.setJavaScriptEnabled(false)
	if (reducedMotion) await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
	if (theme) await page.evaluateOnNewDocument((t) => localStorage.setItem('theme', t), theme)
	await page.goto(BASE + path, { waitUntil: 'networkidle0' })
	return page
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

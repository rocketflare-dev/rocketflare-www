/**
 * Headless Chrome for the verification pass (CLAUDE.md, "The full pass").
 *
 * No dependency is added to this repo: puppeteer-core, lighthouse and axe-core
 * are borrowed from the chrome-devtools-mcp plugin cache (PLUGIN), and the
 * browser is the installed Google Chrome (CHROME_PATH overrides). Every launch
 * gets a throwaway profile under $TMPDIR, so nothing touches a real one.
 */
import { createRequire } from 'node:module'
import { mkdtempSync, readdirSync } from 'node:fs'
import { tmpdir, homedir } from 'node:os'
import { join } from 'node:path'

const cache = join(homedir(), '.claude/plugins/cache/claude-plugins-official/chrome-devtools-mcp')
const versions = readdirSync(cache).sort()
/** The newest installed plugin version's node_modules. */
export const PLUGIN = join(cache, versions.at(-1), 'node_modules')
export const AXE = join(PLUGIN, 'axe-core/axe.min.js')
export const LIGHTHOUSE = join(PLUGIN, 'lighthouse/cli/index.js')
export const CHROME =
	process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
/** The served dist/ — `npx wrangler dev --port 4399 --ip 127.0.0.1`. */
export const BASE = process.env.BASE ?? 'http://127.0.0.1:4399'

const require = createRequire(join(PLUGIN, 'puppeteer-core/package.json'))
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

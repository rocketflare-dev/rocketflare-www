// @ts-check
import { defineConfig, fontProviders } from 'astro/config'
import sitemap from '@astrojs/sitemap'
import { SITEMAP_EXCLUDED_PATHS } from './src/data/pages'
import { lastmodFor } from './src/data/lastmod'

/**
 * Dev only: `astro dev` serves every image at `/_image?href=<source path>&w=…`
 * with `max-age=31536000`. That URL has no content hash, so a retaken
 * screenshot keeps showing the old one until the browser cache is cleared.
 * Here the header is forced to `no-cache`: the ETag still answers 304, so a
 * reload costs nothing unless the file changed. A build needs nothing like
 * this — it names each image after a hash of its content (`/_astro/x.<hash>.webp`).
 * @returns {import('vite').Plugin}
 */
function devImagesRevalidate() {
	return {
		name: 'dev-images-revalidate',
		apply: 'serve',
		configureServer(server) {
			server.middlewares.use((req, res, next) => {
				if (req.url?.startsWith('/_image')) {
					const setHeader = res.setHeader.bind(res)
					res.setHeader = (name, value) =>
						setHeader(name, name.toLowerCase() === 'cache-control' ? 'no-cache' : value)
				}
				next()
			})
		},
	}
}

// `site` is required by @astrojs/sitemap and by the canonical/OG URLs in
// BaseLayout — change it in one place here.
export default defineConfig({
	output: 'static',
	// Markdown is only the synced plugin READMEs (src/content/plugins/). No Shiki: its themes carry
	// their own colours, and every colour here is a token that works in both themes.
	markdown: { syntaxHighlight: false },
	vite: { plugins: [devImagesRevalidate()] },
	site: 'https://rocketflare.dev',
	integrations: [
		sitemap({
			// Not-yet-written placeholder pages are `noindex`; a noindex URL inside a
			// sitemap is something search consoles flag, so they are left out here too
			// (src/data/pages.ts).
			filter: (page) => !SITEMAP_EXCLUDED_PATHS.some((p) => page.endsWith(p)),
			// <lastmod> is the page's own last commit date, not the build time —
			// a date that moves on every deploy is a date a crawler learns to
			// ignore. Undefined when git cannot answer, and the field is omitted.
			serialize: (item) => ({ ...item, lastmod: lastmodFor(item.url) }),
		}),
	],
	// Self-hosted at build time through the Fonts API: no request to Google at
	// runtime. BaseLayout maps --sans/--mono onto these two variables.
	fonts: [
		{
			provider: fontProviders.google(),
			name: 'Outfit',
			cssVariable: '--font-outfit',
			weights: [400, 500, 600, 700, 800],
		},
		{
			provider: fontProviders.google(),
			name: 'JetBrains Mono',
			cssVariable: '--font-mono',
			weights: [400, 600],
		},
	],
})

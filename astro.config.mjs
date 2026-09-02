// @ts-check
import { defineConfig, fontProviders } from 'astro/config'
import sitemap from '@astrojs/sitemap'
import { SITEMAP_EXCLUDED_PATHS } from './src/data/pages'

// `site` is required by @astrojs/sitemap and by the canonical/OG URLs in
// BaseLayout — change it in one place here.
export default defineConfig({
	output: 'static',
	site: 'https://rocketflare.dev',
	integrations: [
		sitemap({
			// The kitchen-sink page and the not-yet-written placeholders are
			// `noindex`; a noindex URL inside a sitemap is something search
			// consoles flag, so they are left out here too (src/data/pages.ts).
			filter: (page) => !SITEMAP_EXCLUDED_PATHS.some((p) => page.endsWith(p)),
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

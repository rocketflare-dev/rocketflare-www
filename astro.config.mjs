// @ts-check
import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'

// TODO: confirm the production domain. `site` is required by @astrojs/sitemap
// and by the canonical/OG URLs in BaseLayout — change it in one place here.
export default defineConfig({
  output: 'static',
  site: 'https://rocketflare.dev',
  integrations: [sitemap()],
})

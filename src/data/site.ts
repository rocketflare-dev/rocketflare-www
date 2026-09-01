/**
 * Every external destination the site links to, in one place.
 *
 * TODO: DEMO_URL is a placeholder — point it at the hosted demo instance when
 * one exists (and remove the "Live demo" buttons until then if it slips).
 */
export const GITHUB_URL = 'https://github.com/rocketflare-dev/rocketflare'
export const DEMO_URL = 'https://demo.rocketflare.dev'
export const DRIZZLE_CUBE_URL = 'https://try.drizzle-cube.dev'

const DOCS = `${GITHUB_URL}/blob/main`
export const CONCEPTS_URL = `${DOCS}/docs/CONCEPTS.md`
export const SETUP_URL = `${DOCS}/SETUP.md`
export const ADAPTING_URL = `${DOCS}/docs/ADAPTING.md`
export const DEPLOY_URL = `${DOCS}/docs/DEPLOY.md`

/** A section of docs/CONCEPTS.md, by its GitHub heading anchor. */
export const concept = (anchor: string) => `${CONCEPTS_URL}#${anchor}`

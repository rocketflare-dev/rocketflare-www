/** Every external destination the site links to, in one place. */
export const GITHUB_URL = 'https://github.com/rocketflare-dev/rocketflare'
export const DRIZZLE_CUBE_URL = 'https://try.drizzle-cube.dev'

const DOCS = `${GITHUB_URL}/blob/main`
export const CONCEPTS_URL = `${DOCS}/docs/CONCEPTS.md`
export const SETUP_URL = `${DOCS}/SETUP.md`
export const ADAPTING_URL = `${DOCS}/docs/ADAPTING.md`
export const DEPLOY_URL = `${DOCS}/docs/DEPLOY.md`
export const CHANGELOG_URL = `${DOCS}/CHANGELOG.md`
export const UPGRADES_URL = `${GITHUB_URL}/tree/main/docs/upgrades`
/** One release's porting note — what changed and how to bring it into a copy. */
export const upgradeNote = (version: string) => `${DOCS}/docs/upgrades/${version}.md`

/** SETUP.md parts, by their GitHub heading anchors. */
export const SETUP_PART1_URL = `${SETUP_URL}#part-1--first-run-local-ready`
export const SETUP_PART3_URL = `${SETUP_URL}#part-3--cloudflare-deploy-config`

/** The one-line installer: served from the site, canonical in the repo — link the source, not the copy. */
export const INSTALL_SH_URL = 'https://rocketflare.dev/install.sh'
export const INSTALL_SH_SOURCE_URL = `${DOCS}/scripts/install.sh`

/** Where the agent path starts. */
export const CLAUDE_CODE_URL = 'https://claude.com/claude-code'

/** Where each deploy token is minted (the Get Started page's "three accounts"). */
export const CLOUDFLARE_TOKENS_URL = 'https://dash.cloudflare.com/profile/api-tokens'
export const NEON_API_KEYS_URL = 'https://console.neon.tech/app/settings/api-keys'
export const RESEND_API_KEYS_URL = 'https://resend.com/api-keys'

/** A section of docs/CONCEPTS.md, by its GitHub heading anchor. */
export const concept = (anchor: string) => `${CONCEPTS_URL}#${anchor}`

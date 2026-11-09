/**
 * The richer story a commercial plugin tells: a sub-navigation of its key features, each with its
 * own screenshot. The facts (version, minKit, packages) stay in plugins.ts; a commercial plugin has
 * no public README to sync, so this file is where its long-form copy lives.
 *
 * A plugin with an entry here gets the showcase layout on /plugins/<id>/ and the wide card on
 * /plugins/. Every claim must be true of the plugin as released, and no field may name its private
 * repository. Each screenshot is a row in src/assets/screens/MANIFEST.md.
 */
import type { ImageMetadata } from 'astro'
import ssoConnectionDark from '../assets/screens/sso-connection.dark.png'
import ssoConnectionLight from '../assets/screens/sso-connection.light.png'
import ssoDomainsDark from '../assets/screens/sso-domains.dark.png'
import ssoDomainsLight from '../assets/screens/sso-domains.light.png'
import ssoLoginDark from '../assets/screens/sso-login.dark.png'
import ssoLoginLight from '../assets/screens/sso-login.light.png'
import ssoScimDark from '../assets/screens/sso-scim.dark.png'
import ssoScimLight from '../assets/screens/sso-scim.light.png'

export interface ShowcaseShot {
	light: ImageMetadata
	dark: ImageMetadata
	alt: string
	url: string
}

export interface ShowcaseFeature {
	/** The section's `#anchor`. */
	id: string
	/** The label in the sub-navigation: one or two words. */
	nav: string
	title: string
	lede: string
	/** Each may hold inline HTML (`<code>`). */
	points: string[]
	shot?: ShowcaseShot
}

export interface PluginShowcase {
	/** The hero's headline claim, one line. */
	headline: string
	/** The hero's screenshot, also the card's on /plugins/. */
	hero: ShowcaseShot
	/** Three or four short phrases for the card on /plugins/. */
	highlights: string[]
	features: ShowcaseFeature[]
	/** Identity providers, and what backs the claim for each. */
	providers: { name: string; status: string }[]
	/** What this release does not do. */
	limits: string[]
}

const APP = 'app.acme-logistics.example'

const ssoLogin: ShowcaseShot = {
	light: ssoLoginLight,
	dark: ssoLoginDark,
	alt: 'The sign-in page: a work email field with a Sign in with SSO button above the email link form.',
	url: `${APP}/login`,
}

export const SHOWCASES: Record<string, PluginShowcase> = {
	sso: {
		headline: 'Give every customer sign-in through their own identity provider.',
		hero: ssoLogin,
		highlights: ['SAML 2.0, with no broker', 'DNS-verified domains', 'SCIM 2.0 for Okta and Entra', 'SSO required, per domain'],
		features: [
			{
				id: 'sign-in',
				nav: 'Sign-in',
				title: 'One box on the login page',
				lede: 'Someone types a work email. Its domain finds their organisation’s identity provider, and they are on their way.',
				points: [
					'A native SAML 2.0 service provider inside your Worker, with no broker in between.',
					'Sign-in starts from your app. IdP-initiated sign-in is there too, off by default.',
					'A failed sign-in never tells the visitor which check failed; the reason goes to your logs.',
				],
				shot: ssoLogin,
			},
			{
				id: 'connect',
				nav: 'Connect',
				title: 'A customer’s admin sets it up in Settings',
				lede: 'Each organisation connects its own identity provider from Settings → Single sign-on, without anyone on your team touching a config file.',
				points: [
					'The Entity ID, ACS URL and Metadata URL to give the provider, each with a copy button.',
					'Import the provider’s metadata as XML or from an https URL, and review it before saving.',
					'Up to three pinned signing certificates with their expiry shown, so a rotation has no gap.',
					'A Test sign-in link, so the connection is proved before anyone depends on it.',
				],
				shot: {
					light: ssoConnectionLight,
					dark: ssoConnectionDark,
					alt: 'Settings, Single sign-on: an active Okta SAML connection showing the Entity ID, ACS URL and Metadata URL, the metadata import, and a pinned signing certificate with its expiry.',
					url: `${APP}/settings?tab=sso`,
				},
			},
			{
				id: 'domains',
				nav: 'Domains & roles',
				title: 'Prove the domain, then map the groups',
				lede: 'An organisation proves it owns an email domain with a DNS record, and its directory groups decide what people can do.',
				points: [
					'A TXT record at <code>_rocketflare-sso.example.com</code>, checked over DNS-over-HTTPS.',
					'One domain belongs to one organisation, and SAML signs in only addresses on a verified domain.',
					'One group → role map for both SAML and SCIM. The highest role wins, and an owner stays an owner.',
				],
				shot: {
					light: ssoDomainsLight,
					dark: ssoDomainsDark,
					alt: 'The connection’s Verify your domains step with one verified domain, and its Roles step mapping a Logistics Admins group to the admin role.',
					url: `${APP}/settings?tab=sso`,
				},
			},
			{
				id: 'scim',
				nav: 'SCIM & enforce',
				title: 'Let the directory run the people, then require it',
				lede: 'With SCIM on, joiners, movers and leavers follow the directory. Requiring SSO closes every other way in for that domain.',
				points: [
					'SCIM 2.0 in both the Okta and the Entra dialect: users created and updated, groups pushed and mapped to roles.',
					'Deactivating someone removes their membership and ends their sessions at once.',
					'SSO required, per verified domain: magic link, Google, Microsoft, OIDC and dev login are refused for those addresses.',
					'Bootstrap admins stay exempt, so there is always a way back in.',
				],
				shot: {
					light: ssoScimLight,
					dark: ssoScimDark,
					alt: 'The connection’s Provision with SCIM step showing the base URL and a token, above the Enforce step with its Require single sign-on switch.',
					url: `${APP}/settings?tab=sso`,
				},
			},
			{
				id: 'security',
				nav: 'Security',
				title: 'Verification that assumes the response is hostile',
				lede: 'SAML is easy to get subtly wrong, so these checks run on every response before anyone is signed in.',
				points: [
					'The provider’s certificate is pinned when the connection is saved, and the one inside a response is never trusted.',
					'Signature wrapping is refused.',
					'Every sign-in request is single-use, and a replayed assertion is caught.',
					'The audience, the recipient and the time window are all checked.',
					'Eight <code>sso_</code> tables, each with a row-level-security policy, in both tenancy modes.',
				],
			},
		],
		providers: [
			{ name: 'Okta', status: 'Tried live, SAML and SCIM' },
			{ name: 'Mock SAML', status: 'Tried live' },
			{ name: 'Microsoft Entra ID', status: 'Setup guide' },
			{ name: 'Google Workspace', status: 'Setup guide' },
			{ name: 'ADFS', status: 'Setup guide' },
		],
		limits: [
			'OpenID Connect sign-in per organisation: a later release.',
			'Encrypted assertions and Single Logout.',
			'Automatic metadata refresh: re-import when a provider rotates its certificate.',
			'SCIM <code>/Bulk</code>, and filters beyond <code>eq</code>.',
		],
	},
}

export const showcaseFor = (id: string): PluginShowcase | undefined => SHOWCASES[id]

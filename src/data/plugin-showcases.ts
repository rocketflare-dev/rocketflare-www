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
import sitesBuildDark from '../assets/screens/sites-build.dark.png'
import sitesBuildLight from '../assets/screens/sites-build.light.png'
import sitesEditorDark from '../assets/screens/sites-editor.dark.png'
import sitesEditorLight from '../assets/screens/sites-editor.light.png'
import sitesElementsDark from '../assets/screens/sites-elements.dark.png'
import sitesElementsLight from '../assets/screens/sites-elements.light.png'
import sitesFormsDark from '../assets/screens/sites-forms.dark.png'
import sitesFormsLight from '../assets/screens/sites-forms.light.png'
import sitesLanguageDark from '../assets/screens/sites-language.dark.png'
import sitesLanguageLight from '../assets/screens/sites-language.light.png'
import sitesPaletteDark from '../assets/screens/sites-palette.dark.png'
import sitesPaletteLight from '../assets/screens/sites-palette.light.png'
import sitesPagesDark from '../assets/screens/sites-pages.dark.png'
import sitesPagesLight from '../assets/screens/sites-pages.light.png'
import sitesPublicLight from '../assets/screens/sites-public.light.png'
import sitesPublishDark from '../assets/screens/sites-publish.dark.png'
import sitesPublishLight from '../assets/screens/sites-publish.light.png'

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
	/** Identity providers, and what backs the claim for each. Absent, the table is left out. */
	providers?: { name: string; status: string }[]
	/**
	 * The labels of that table, when it is not a list of identity providers: its sub-navigation
	 * entry, its heading and its first column. Absent, it reads Providers / What it has been tried
	 * against / Provider.
	 */
	tried?: { nav: string; title: string; column: string }
	/** What this release does not do. */
	limits: string[]
	/** HTML: what to do after the install, appended to the "Getting it" paragraph. */
	afterInstall?: string
}

const APP = 'app.acme-logistics.example'

const ssoLogin: ShowcaseShot = {
	light: ssoLoginLight,
	dark: ssoLoginDark,
	alt: 'The sign-in page: a work email field with a Sign in with SSO button above the email link form.',
	url: `${APP}/login`,
}

const SITES_APP = 'app.pellorin.example'

const sitesEditor: ShowcaseShot = {
	light: sitesEditorLight,
	dark: sitesEditorDark,
	alt: 'The page editor on an About page: the outline on the left, the Hero block selected on the canvas, and its heading, rich-text body and button fields in the panel on the right.',
	url: `${SITES_APP}/sites/www/pages/…/en`,
}

const sites: PluginShowcase = {
	headline: 'Run the marketing site and the docs from the app you already have.',
	hero: sitesEditor,
	highlights: ['A visual editor inside the app', 'Pages in several languages', 'Blocks and themes in code', 'Skills that copy and migrate a site'],
	features: [
		{
			id: 'editor',
			nav: 'Editor',
			title: 'Edit on the page itself',
			lede: 'Editors work in Puck, inside your app and under its own header: the page as a visitor will see it, with every field beside it.',
			points: [
				'Headings, button labels and rich text are typed straight onto the canvas, and the side panel is still a complete way to edit every field.',
				'Desktop, tablet and phone previews, an outline, and a palette made of the site’s own blocks.',
				'A draft saves about two seconds after each change. When two people save the same page, the second is offered reload or overwrite, and the overwritten draft is kept.',
				'The editor warns when someone else has the same page and language open. It never locks anyone out.',
			],
			shot: {
				light: sitesPaletteLight,
				dark: sitesPaletteDark,
				alt: 'The editor on a docs site’s home page in tablet preview: the block palette on the left with Hero, Rich text, Image, Columns, Call to action, Form and Language switcher, the Hero block selected on the canvas, and its fields on the right.',
				url: `${SITES_APP}/sites/docs/pages/…/en`,
			},
		},
		{
			id: 'pages',
			nav: 'Pages',
			title: 'Every page and every language at a glance',
			lede: 'One page tree, shared by every language, with each translation’s state on a badge of its own.',
			points: [
				'Add child pages, re-order, move and delete, in every language at once.',
				'A badge opens that translation and says where it stands: a draft, published, published with changes pending, or out of date.',
				'Page templates: save a page as one, start a new page from one, or use the read-only ones a developer declares.',
				'Access by group: owners and admins edit and publish every site, and a member has none until a group is granted <code>edit</code> or <code>publish</code> on that site.',
			],
			shot: {
				light: sitesPagesLight,
				dark: sitesPagesDark,
				alt: 'A site’s Pages tab: four pages, each with an English and a French badge such as Published, Published with changes pending, Out of date, Draft or Missing, and links to the live pages.',
				url: `${SITES_APP}/sites/www?tab=pages`,
			},
		},
		{
			id: 'publishing',
			nav: 'Publishing',
			title: 'Publish now, later, or after a review',
			lede: 'The Publish menu holds the checks, Publish now, a schedule and Unpublish. A change is live within about a minute.',
			points: [
				'A scheduled publish pins the page as it is, so later edits do not go live with it.',
				'An editor without the right to publish requests a review instead. Publishers are notified, and publish the page or send it back with a comment.',
				'Every published version is kept: open an old one read-only, with the elements it showed at the time, and restore it into the draft.',
				'A signed preview link, on the site’s own host, for someone who cannot sign in. It expires after seven days, can be revoked, and is never indexed.',
			],
			shot: {
				light: sitesPublishLight,
				dark: sitesPublishDark,
				alt: 'The editor’s Publish menu open: Publish now, a date and time to schedule the publish with a note that later edits do not go live with it, and Unpublish.',
				url: `${SITES_APP}/sites/www/pages/…/en`,
			},
		},
		{
			id: 'languages',
			nav: 'Languages',
			title: 'One page, several languages',
			lede: 'Switch language from the editor’s toolbar. Each language has its own slug, its own SEO fields and its own state.',
			points: [
				'The default language has no prefix (<code>/pricing</code>), and the others have one and a translated slug (<code>/fr/tarifs</code>).',
				'<code>hreflang</code> tags, a sitemap per language and a language switcher block, each leaving out a language the page is not live in.',
				'Translate from another language: a draft written in the background with visible progress, from only the text a block declares. It asks before it replaces anyone’s edits, keeps to the kit’s agent budgets, and can be stopped.',
				'Menus and elements follow the language. An element with no version in one falls back to the default language, with a warning rather than a block on publishing.',
			],
			shot: {
				light: sitesLanguageLight,
				dark: sitesLanguageDark,
				alt: 'The French version of the About page in the editor: the language switch shows en and fr, the page tree shows the translated slug /a-propos, the menu reads Accueil and À propos, and a Translate from en button sits in the toolbar.',
				url: `${SITES_APP}/sites/www/pages/…/fr`,
			},
		},
		{
			id: 'blocks',
			nav: 'Blocks',
			title: 'Blocks and themes your developers own',
			lede: 'Editors own the content. The blocks, the theme, the languages and the hosts are code, in a directory that belongs to your app.',
			points: [
				'<code>defineSite</code> for each site and <code>defineBlock</code> for each block, in <code>app/</code>, which a plugin upgrade never touches.',
				'Starter blocks to begin from: hero, rich text, image, columns, call to action, form, language switcher and menu. A theme is a DaisyUI theme with self-hosted fonts.',
				'Block changes are versioned: rename a field with a version bump and a <code>migrate</code> step that runs on read. Published versions are never rewritten.',
				'Reusable elements kept in step on every page that uses them, a header and footer per site or per page, menus built from pages, a 301 when a slug changes, and SEO fields per language.',
			],
			shot: {
				light: sitesElementsLight,
				dark: sitesElementsDark,
				alt: 'A site’s Elements tab: the reusable Site header and Site footer regions, each with English and French badges and the number of pages using it.',
				url: `${SITES_APP}/sites/www?tab=elements`,
			},
		},
		{
			id: 'public',
			nav: 'Public sites',
			title: 'Fast, locked-down public pages',
			lede: 'Each host you map serves its site from the root, from the same Worker as your app, with no <code>/api</code> or <code>/auth</code> on it.',
			points: [
				'Rendered once on the server, then served from the edge cache. A cached page makes no database query, and a render never sees a visitor’s cookie.',
				'A strict CSP per site: by default a page loads no script. Site CSS is a separate build, and the public CSP refuses the admin bundle.',
				'Images stored in R2 and served through Cloudflare Images, as AVIF or WebP at fixed widths.',
				'<code>robots.txt</code>, a sitemap, an HTML 404 and redirects on every host.',
			],
			shot: {
				light: sitesPublicLight,
				dark: sitesPublicLight,
				alt: 'A published home page for Pellorin, a fictional maker of harbour buoys: a header with Home, About and Pricing and an English and French switch, a dark hero with a See pricing button, and a section with an illustration.',
				url: 'www.pellorin.example',
			},
		},
		{
			id: 'forms',
			nav: 'Forms',
			title: 'Forms that start work',
			lede: 'Drop a Form block on any page. Each submission lands in the app beside the site, and can start an agent that reads it and drafts the reply.',
			points: [
				'Every saved submission announces the kit event <code>sites.form.submitted</code>. Your app’s own code, another plugin, or an agent with <code>triggers</code> can act on each one.',
				'The Form block’s <strong>On submit, start</strong> setting lets an editor pick an agent with no code, from the agents that opt in. Only the agent in the published block starts: nothing a visitor sends can choose it, and a choice saved only in a draft does not count.',
				'Runs go through the kit’s agent workflow, inside its run caps and daily budgets. The plugin ships one agent, Draft a reply, which summarises a submission and drafts a reply. It sends nothing.',
				'The site’s Forms tab lists submissions per form for people who can publish, with each one’s workflow status and a link to its run, or why nothing started. Submissions are deleted after 90 days.',
				'With JavaScript, a small script under 5 KB sends the form in place and shows field errors next to the fields. Without it, the form posts normally and lands on a page in the site’s own layout. Both announce the event, and if announcing fails, the visitor still sees success and the event is sent again later.',
				'Turnstile on every form, failing closed, and a limit of 10 submissions a minute. The success message and the page to go to next come from the published block, never from what was submitted.',
			],
			shot: {
				light: sitesFormsLight,
				dark: sitesFormsDark,
				alt: 'The Forms tab with a submission to the contact form open: the visitor’s name, email and question about a nonprofit discount, then a Workflow row reading Succeeded with a View run link, the agent’s summary of the question and a reply draft.',
				url: `${SITES_APP}/sites/www/forms`,
			},
		},
		{
			id: 'ai',
			nav: 'AI',
			title: 'A first draft from a description',
			lede: 'Build with AI, in the New page dialog, reads the knowledge base and the site’s published pages, plans the sections, and writes each one from the site’s own blocks and images.',
			points: [
				'It always creates a new draft, with a note of the sources it used. It never publishes and never edits an existing page.',
				'Every section goes through the same validation as a save, and the model’s output is treated as untrusted throughout.',
				'It runs on the kit’s agent workflow, on Workers AI by default, with no key. That model gives a rough first draft: sensible layouts, invented facts, and the odd build that needs a retry. Configure a stronger model before writing copy customers will read, and check every page.',
				'Turn knowledge on for a site, and its published pages, in every language, join the knowledge base, so chat and agents answer from the site with each page’s live URL.',
			],
			shot: {
				light: sitesBuildLight,
				dark: sitesBuildDark,
				alt: 'The Build a page with AI dialog: a description of the page, a parent page and language, and optional sources ticked from the knowledge base and the site’s published pages. It notes that it never publishes and never changes an existing page.',
				url: `${SITES_APP}/sites/www?tab=pages`,
			},
		},
		{
			id: 'skills',
			nav: 'Skills & CLI',
			title: 'Bring an existing site across from Claude Code',
			lede: 'Four agent skills install with the plugin. They work through the <code>rocketflare sites</code> commands, and none of them publishes.',
			points: [
				'<code>sites-copy-design</code> copies the look of a site you own into blocks, a theme and library elements, then compares screenshots side by side and iterates.',
				'<code>sites-migrate</code> moves a site’s pages, images, redirects and menus in as drafts, crawling politely, and writes a migration report. A re-run picks up where it stopped.',
				'<code>sites-new-page</code> writes one page from a prompt in the terminal, as a draft, and revises it from your feedback.',
				'<code>sites-setup</code> chooses the organisation that owns the sites, maps the hosts and lists what only a person can do.',
				'Copying and migrating stop unless you own the source site or have the rights to reuse it.',
				'<code>rocketflare sites export</code> and <code>import</code> move a whole site as drafts, and <code>audit</code> lists the blocks in use, exiting 1 on an unknown one so CI can run it before a block is deleted.',
			],
		},
	],
	limits: [
		'Collections: blog posts and similar content types are a later release.',
		'One organisation owns every site in a deployment. Customers creating their own sites, or bringing their own domains, is out of scope.',
		'No favicon or site-wide social image setting.',
		'Media cannot be deleted from a library, and replacing an image does not update the pages using the old one.',
		'A publish anywhere makes every page and image variant on every site render again.',
		'Plain-text fields on the canvas are editable on hover or focus, so touch and keyboard users edit them in the side panel.',
		'The On submit, start picker lists every agent that opts in, with no filter per form. The run a form starts has no requester, so only owners and admins can open its run page; other publishers see its status in the Forms tab.',
	],
	afterInstall:
		'Run <code>/sites-setup</code> to choose the organisation that owns the sites and map the hosts, and have a person run <code>/rf-provision</code> for its R2 bucket, KV namespace and Images binding.',
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
	sites,
}

export const showcaseFor = (id: string): PluginShowcase | undefined => SHOWCASES[id]

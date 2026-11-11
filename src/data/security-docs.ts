/**
 * The kit's three security documents, vendored into `src/content/security/<slug>.md` by
 * `npm run sync:security` and rendered at `/security/<slug>/` by `src/pages/security/[doc].astro`.
 *
 * The site never links these three on GitHub: every link to one, on the site or inside another
 * synced doc, goes to its page here. `scripts/sync-security.mjs` imports this file (Node strips the
 * types), so keep it free of imports.
 */
export interface SecurityDoc {
	/** The page slug and the synced file's name. */
	slug: string
	/** Repository-relative path in the kit. */
	path: string
	/** The page's h1. */
	title: string
	/** The short name used in links and the breadcrumb. */
	label: string
	description: string
}

export const SECURITY_DOCS: SecurityDoc[] = [
	{
		slug: 'threat-model',
		path: 'docs/THREAT-MODEL.md',
		title: 'Threat model',
		label: 'Threat model',
		description:
			'What a security review of Rocketflare should try to break: the assets, every actor from an anonymous visitor to a plugin with what each may and must not do, the trust boundaries, and what is out of scope.',
	},
	{
		slug: 'audit',
		path: 'docs/SECURITY-AUDIT.md',
		title: 'Security audit',
		label: 'Security audit',
		description:
			'How /rf-security audits a Rocketflare app: the modes and their cost, how hunters, verifiers, critics and reviewers work, the sandbox proofs run in, where the results go, and what a run does not prove.',
	},
	{
		slug: 'policy',
		path: 'SECURITY.md',
		title: 'Security policy',
		label: 'Security policy',
		description:
			'How security fixes reach a copy of Rocketflare, and how to report a vulnerability privately.',
	},
]

export const securityDocPath = (slug: string) => `/security/${slug}/`

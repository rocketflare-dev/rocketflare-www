/**
 * The site is static; this Worker exists for two things.
 *
 * 1. Canonical host. `rocketflare.dev` is the one address: a request to
 *    `www.` or over plain http is answered with a 301 to the https apex,
 *    path and query intact. The `<link rel="canonical">` in BaseLayout says
 *    the same thing, but a canonical is a hint a crawler may weigh against
 *    other signals, whereas a 301 settles it — and Search Console was
 *    recording `http://rocketflare.dev/` as a page in its own right.
 *
 * 2. `GET /api/github-stars` proxies the repository's stargazer count so the
 *    browser never calls GitHub directly — an unauthenticated GitHub request is
 *    rate-limited per client IP, and one shared, cached call is both kinder and
 *    more reliable than one per visitor. The subrequest is cached at the edge for
 *    an hour via `cf.cacheTtl`, so there is no KV namespace to provision: a colo
 *    makes at most 24 upstream calls a day.
 *
 * Everything else falls through to the static assets.
 */

const REPO = 'rocketflare-dev/rocketflare'
const CACHE_SECONDS = 3600

/** The one host this site answers on; everything else redirects to it. */
const CANONICAL_HOST = 'rocketflare.dev'

interface Env {
	ASSETS: Fetcher
}

/**
 * A 301 to the canonical origin, or null when the request is already there.
 * Only the scheme and host move: the path, query and hash are the reader's.
 */
export function canonicalRedirect(url: URL, headers: Headers): Response | null {
	// Only ever redirect a request that really arrived at Cloudflare's edge.
	// `wrangler dev` fabricates BOTH the URL and the Host header from the
	// configured custom domain — the Worker is handed
	// http://rocketflare.dev/… while the reader is on 127.0.0.1 — and then
	// rewrites Location back to the local address, so trusting either one
	// turns every local request into a 301 to itself. `cf-ray` is added by the
	// edge and is absent locally, which makes it the one honest signal here
	// (cf-connecting-ip and request.cf are both present under wrangler dev).
	//
	// It fails OPEN: no cf-ray means serve the page and let the canonical tag
	// speak. Losing a redirect costs a little ranking signal; a redirect loop
	// costs the whole site.
	if (!headers.get('cf-ray')) return null

	// An allow-list, not a deny-list: only the two public hostnames are ever
	// redirected, so the workers.dev preview alias a pull request is reviewed
	// on serves itself rather than bouncing to production.
	const isApex = url.hostname === CANONICAL_HOST
	const isWww = url.hostname === `www.${CANONICAL_HOST}`
	if (!isApex && !isWww) return null
	if (isApex && url.protocol === 'https:') return null

	const target = new URL(url)
	target.protocol = 'https:'
	target.hostname = CANONICAL_HOST
	target.port = ''

	return Response.redirect(target.toString(), 301)
}

async function githubStars(): Promise<Response> {
	try {
		const res = await fetch(`https://api.github.com/repos/${REPO}`, {
			headers: {
				// GitHub rejects requests without one.
				'User-Agent': 'rocketflare-www',
				Accept: 'application/vnd.github+json',
			},
			cf: { cacheTtl: CACHE_SECONDS, cacheEverything: true },
		})

		if (!res.ok) {
			return Response.json(
				{ stars: null, error: 'github_unavailable' },
				{ status: 502, headers: { 'Cache-Control': 'public, max-age=60' } },
			)
		}

		const data = (await res.json()) as { stargazers_count?: number }
		return Response.json(
			{ stars: data.stargazers_count ?? 0 },
			// Also cache in the browser, so a reader moving between pages does not
			// re-ask on every navigation.
			{ headers: { 'Cache-Control': `public, max-age=${CACHE_SECONDS}` } },
		)
	} catch {
		return Response.json(
			{ stars: null, error: 'fetch_failed' },
			{ status: 502, headers: { 'Cache-Control': 'public, max-age=60' } },
		)
	}
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url)

		const redirect = canonicalRedirect(url, request.headers)
		if (redirect) return redirect

		if (url.pathname === '/api/github-stars') {
			if (request.method !== 'GET' && request.method !== 'HEAD') {
				return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'GET' } })
			}
			return githubStars()
		}

		return env.ASSETS.fetch(request)
	},
}

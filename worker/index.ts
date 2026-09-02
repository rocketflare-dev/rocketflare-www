/**
 * The site is static; this Worker exists for one dynamic route.
 *
 * `GET /api/github-stars` proxies the repository's stargazer count so the
 * browser never calls GitHub directly — an unauthenticated GitHub request is
 * rate-limited per client IP, and one shared, cached call is both kinder and
 * more reliable than one per visitor. The subrequest is cached at the edge for
 * an hour via `cf.cacheTtl`, so there is no KV namespace to provision: a colo
 * makes at most 24 upstream calls a day.
 *
 * Everything else falls through to the static assets.
 */

const REPO = 'rocketflare-dev/rocketflare'
const CACHE_SECONDS = 3600

interface Env {
	ASSETS: Fetcher
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
		const { pathname } = new URL(request.url)

		if (pathname === '/api/github-stars') {
			if (request.method !== 'GET' && request.method !== 'HEAD') {
				return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'GET' } })
			}
			return githubStars()
		}

		return env.ASSETS.fetch(request)
	},
}

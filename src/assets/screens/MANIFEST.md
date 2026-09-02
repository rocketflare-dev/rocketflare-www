# Screenshots

Every capture used by `components/Screenshot.astro` lives here as a pair,
`<stem>.light.png` and `<stem>.dark.png`, 1440 × 900, taken from the kit
running locally in each theme. Record each pair below so a screenshot can be
retaken when the kit's UI moves on.

Procedure: run the kit (`pnpm dev` in the rocketflare repo, seeded), sign in as
the demo owner, set the viewport to 1440 × 900, capture the page in the day
theme, toggle to night, capture again; name both with the same stem; note the
kit commit (`git rev-parse --short HEAD` there) and the date. Do not resize —
the component emits AVIF/WebP at 720 and 1440 from the PNG.

| stem | kit URL | kit commit | captured on |
|---|---|---|---|
| `placeholder` | — (generated flat image, not a capture) | — | — |

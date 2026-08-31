# Plan: Going Live

**Status**: Draft — pending review
**Implements**: spec.md in this directory
**Hosting decision**: Cloudflare Workers static assets — see
`DECISIONS.md` for the comparison and trade-offs.

## Inputs needed from the photographer (blocking, gathered at review)

The plan can be approved without these, but the identity/content tasks
can't complete until they exist. Placeholder text never ships as if it
were the photographer's voice (design brief rule).

1. **Site title** as it should render (e.g. "Erik Haake Photography"
   vs "Erik Haake") and a one-line site description for meta/OG/RSS.
2. **Instagram URL** (and any other socials worth listing; the theme's
   built-in icon set has no Instagram icon — one will be added).
3. **Public contact email** for the Contact page (the address you want
   scrapeable-in-principle, which may not be your personal one).
4. **About page text**, in your words. Can arrive last; the page ships
   only when it does.
5. **Cloudflare account + workers.dev subdomain name** (created by
   you; I can't hold accounts). The repo connection is a one-time
   dashboard action.

## Dark-mode removal

- `src/layouts/BaseLayout.astro`: remove the theme-init inline script
  (sets `data-theme` from OS preference / localStorage), the toggle
  button markup, and its wiring script.
- `src/styles/global.css`: remove both dark token blocks (the
  `prefers-color-scheme` media block and the `[data-theme='dark']`
  block) and the `[data-theme='light']` duplicate, returning `:root`
  to the single source of truth — the accent becomes a one-line change
  again, as the README promises.
- `astro.config.mjs` + `global.css`: collapse Shiki to the single
  light theme (`github-light`), dropping `defaultColor: false` and the
  dual-theme CSS variable block.
- Delete the toggle component file if it's separate from BaseLayout.

## Teardown map (blog/works)

Confirmed consumers, all removed or reshaped:

- Delete: `src/pages/blog/` (paginated index, slug page, tag pages),
  `src/pages/works/` (index, slug page), `src/content/blog/`,
  `src/content/works/`, the `blog`/`works` collections in
  `src/content.config.ts`, and the Giscus/Comments component + its
  `consts.ts` config (blog-only feature; comments are a spec-001
  non-goal).
- `src/consts.ts`: drop the `/works/` and `/blog/` nav entries.
- `src/pages/rss.xml.ts`: feed becomes pieces (title, description,
  publishDate, canonical piece URL). No blog/works remnants.
- `src/pages/og/[collection]/[slug].png.ts`: becomes
  `src/pages/og/pieces/[slug].png.ts` — `getStaticPaths` over
  non-draft pieces; the `kind` eyebrow renders the piece's categories
  (data, not invented copy). Satori/sharp machinery unchanged.
- `src/pages/index.astro`: minimal interim edit — the sections that
  query `works`/`blog` are replaced by one "latest pieces" list
  reusing the pieces-index list markup. Explicitly not the spec-003
  homepage; just coherence after teardown.
- `src/i18n/*`: keys for removed features go when trivially safe to
  remove; harmless orphans may stay (noted, not hidden).

## New: pieces index + nav

- `src/pages/pieces/index.astro`: newest-first non-draft pieces —
  title, date, categories, description; cover thumbnail if present.
  Reuses the theme's existing list/feed styles (`index-feed` /
  `note-row` family) rather than inventing a new grid — this page is
  deliberately interim (spec 003 may absorb it).
- `src/consts.ts`: nav gains `/pieces/` ("Pieces"), replacing the two
  removed entries.

## About + Contact

- `src/pages/about/index.astro` exists (theme demo content) —
  restructured to hold the photographer's text; ships with visible
  `TODO-AUTHOR` placeholders until input #4 arrives, and the task
  isn't complete while any remain.
- `src/pages/contact/index.astro`: new, minimal — email link
  (`mailto:` with the public address) + Instagram link, styled with
  existing tokens. Nav entry only if the photographer wants one;
  footer link otherwise (decide at review — default: footer + about
  page mention).

## Identity + URLs

- `src/consts.ts`: title, description, author, socials (add an
  Instagram SVG to the footer icon set).
- `astro.config.mjs`: `base` removed (root site). `site` starts as the
  workers.dev URL for the test phase and flips to
  `https://erikhaakephoto.com` in the same commit as the DNS flip —
  canonicals, sitemap, RSS, and OG URLs follow `site` automatically.
- `public/og.jpg` (site-wide OG fallback) and favicon: replaced with
  the photographer's own image/mark — needs input #1/#4 era assets;
  interim: a neutral text-only card generated with the existing satori
  setup so the theme's branding doesn't linger anywhere.

## Deploy (Cloudflare Workers static assets)

- `wrangler.jsonc` at repo root: `name`, `compatibility_date`,
  `assets: { directory: "./dist" }` — static assets only, no Worker
  script, no adapter. The Astro build stays exactly as-is
  (`npm run build`, with the `postbuild` Pagefind step running via the
  npm lifecycle).
- Git integration (Workers Builds) connected to the GitHub repo from
  the Cloudflare dashboard (one-time, photographer's account): build
  command `npm run build`, deploy on push to `main`, per-branch
  preview URLs for spec branches.
- A failed build never replaces the live deployment (platform
  behavior — verified during rollout, per the spec's publishing flow).
- Domain flip (final task, deferrable per spec): CNAME/A records at
  Squarespace DNS → the Worker's custom domain; `site` config flips in
  the same commit.

## Testing strategy

- Existing unit suite (18 tests) must stay green — the transform is
  untouched by this spec.
- `astro build` green after each teardown task; the teardown is
  sequenced collection-by-collection so breakage localizes.
- Link integrity: after teardown, grep built output for `/blog/` and
  `/works/` hrefs (must be zero) and for the upstream author's URLs
  (`kpab`, `astro-keel`) anywhere in `dist/` (must be zero).
- OG verification per spec: a real link-preview debugger against the
  workers.dev URL, not just markup inspection.
- RSS validated with a feed validator once live on the test URL.

## Known limitations

- The homepage remains the theme's shell with an interim pieces list —
  by design, until spec 003.
- Category *filtering* on the pieces index is not built (spec 001
  deferred per-category browsing to the galleries/homepage work; the
  index shows categories as labels only).
- Contact is email + Instagram until the roadmapped form spec.
- `sizes` hints for diptych/triptych remain conservative upper bounds.

## File structure (delta)

```
photo-pieces/
├── wrangler.jsonc                    # new — Workers static assets
├── astro.config.mjs                  # site/base change, Shiki single theme
├── src/
│   ├── consts.ts                     # identity, nav, socials
│   ├── content.config.ts             # blog/works collections removed
│   ├── content/{blog,works}/         # deleted
│   ├── layouts/BaseLayout.astro      # dark mode removed
│   ├── pages/
│   │   ├── blog/, works/             # deleted
│   │   ├── pieces/index.astro        # new
│   │   ├── contact/index.astro       # new
│   │   ├── about/index.astro         # rewritten (author text)
│   │   ├── og/pieces/[slug].png.ts   # reshaped from [collection]
│   │   ├── rss.xml.ts                # pieces feed
│   │   └── index.astro               # interim homepage edit
│   └── styles/global.css             # dark tokens removed
```

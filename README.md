# photo-pieces

A personal photography site — landscape/nature, street, portrait, and
event work — built around **pieces**: blog-style entries pairing images
with real writing, with hand-curated galleries kept as a secondary
view, not the main event.

Forked from [astro-keel](https://github.com/kpab/astro-keel) by kpab
(MIT licensed) and built out from there using spec-driven development.

## Project docs

The "why" behind this project lives in these, not in this file:

- `CLAUDE.md` — the project constitution: platform choices,
  architecture rules, git conventions
- `specs/<NNN>-<slug>/` — the spec, plan, and tasks for each build
  phase (001 foundation, 002 identity/teardown, 003 block vocabulary,
  005 going live — deferred)
- `design/brief.md` — visual and interaction direction
- `DECISIONS.md` — tooling comparisons and naming rationale (why this
  theme, why not a CMS, why this repo name)
- `ROADMAP.md` — deliberately deferred features (shop, comments,
  search, a newsletter)

This file is about running and maintaining the code.

## Quick start

```sh
git clone https://github.com/<you>/photo-pieces.git
cd photo-pieces
npm install
npm run dev      # http://localhost:4321
npm run build    # static output to ./dist
npm run preview  # preview the production build
```

Requires Node.js 22+.

## Authoring a piece

The actual point of this project. Write in Obsidian, with the vault
pointed at `src/content/pieces/`; `astro dev` running alongside gives
live preview on save. Plain Markdown only, never MDX — that's a hard
rule (see `CLAUDE.md`), since MDX breaks Obsidian's ability to render
and edit the file. Vault layout, Obsidian settings, and usage
conventions live in `AUTHORING.md`.

```
src/content/pieces/<slug>/
  index.md
  photo-1.jpg
  photo-2.jpg
```

```yaml
---
title: Three days on the Alvord
publishDate: 2026-08-25
categories: [landscape]
description: One-line summary.
cover: ./photo-1.jpg
draft: false
---
```

A single image — the dominant case — needs no special syntax, just
plain Markdown:

```md
![First light over the playa](./photo-1.jpg)
```

Everything else in the closed block vocabulary uses directive syntax.
A block is a leaf (`::name{...}` on its own line) or, to carry a
caption, a container whose body is the caption:

```md
::wide{src="./photo-2.jpg" alt="The playa at dusk"}

:::diptych{left="./a.jpg" right="./b.jpg" leftAlt="Before" rightAlt="After"}
Three minutes apart. Captions take _inline markdown_.
:::
```

| Block       | Forms          | Attributes                                                                                         | Matted | Obsidian Live Preview |
| ----------- | -------------- | -------------------------------------------------------------------------------------------------- | ------ | --------------------- |
| `single`    | leaf/container | `src` `alt`                                                                                        | yes    | image (leaf)          |
| `inset`     | leaf/container | `src` `alt`                                                                                        | yes    | image (leaf)          |
| `wide`      | leaf/container | `src` `alt` `bleed=left\|right`                                                                    | yes¹   | image (leaf)          |
| `fullbleed` | leaf/container | `src` `alt`                                                                                        | no     | image (leaf)          |
| `tall`      | leaf/container | `src` `alt`                                                                                        | no     | image (leaf)          |
| `diptych`   | leaf/container | `left` `right` `leftAlt` `rightAlt`, `match=height`, `weight=left\|right`, `width=wide\|fullbleed` | yes²   | images (leaf)         |
| `triptych`  | leaf/container | `left` `center` `right` + alts, `match=height`, `width=wide\|fullbleed`                            | yes²   | images (leaf)         |
| `grid`      | container only | body: 2–6 markdown images, one per line; text after a blank line = caption                         | yes    | raw text              |
| `strip`     | container only | body: 1–8 markdown images (panorama or filmstrip); text after a blank line = caption               | no     | raw text              |
| `aside`     | container only | `src` `alt` `side=left\|right`; body: prose that wraps around the image                            | yes    | raw text              |
| `row`       | container only | `src` `alt` `side=left\|right`; body: prose beside the image                                       | yes    | raw text              |
| `sequence`  | reserved       | fails the build until its presentation is designed (`ROADMAP.md`)                                  | —      | —                     |

¹ the bled edge runs clean. ² dropped at `width="fullbleed"`.
Plain `![alt](./photo.jpg)` remains the captionless shorthand for
`single` — same rendered result. Every image carries its own flat
matte, applied by the site's CSS (never bake mattes into files).
Rules the build enforces loudly: alt is required on every image
(`alt=""` only for decorative), unknown blocks and attributes fail,
the `[label]` form fails, blocks can't nest, images must exist. The
sampler piece (`src/content/pieces/vocabulary-sampler/`) shows every
treatment rendered.

**Current status**: the full spec-003 vocabulary above is implemented
— transform, styling, mattes, unit tests, and the Obsidian plugin's
leaf-form rendering — with images going through Astro's asset pipeline
(hashed src, responsive srcset per treatment). Pieces are the site's
only long-form content: they render at `/pieces/<slug>/`, list at
`/pieces/` (in the nav), and feed the homepage, RSS, and per-piece
Open Graph images. Check the newest `specs/*/tasks.md` for what's
actually done versus still planned — don't assume this list is current
by the time you're reading it.

## Configuration

Site identity (title, author, description, nav, footer, contact email,
Instagram) lives in one file, `src/consts.ts`. Social links render as
footer icons — built-in set is `github`, `x`, `linkedin`, `rss`,
`email`, `instagram`.

## Customization

### Accent color

One line in `src/styles/global.css` (`--color-accent` on `:root`) —
plus two _derived_ copies that don't update automatically: the hex
values in `src/pages/og/pieces/[slug].png.ts` (social-card palette;
recompute on retune, see the comment there) and the fill in
`public/favicon.svg`. `--color-accent-hover` derives automatically via
`color-mix()`.

### Fonts

CSS variables (`--font-display`, `--font-body`, `--font-mono`) in
`src/styles/global.css`. Swap a face by installing another
`@fontsource` package and updating the variable — **and check
`src/pages/og/pieces/[slug].png.ts`**, which loads font files
directly for social preview images and won't pick up a CSS-only
change. Easy to miss; already bit us once during the Fraunces → Spectral
swap.

### Appearance

Light-only, by decision, and fully so since spec 002: no dark palette,
no toggle, no `prefers-color-scheme` behavior. The reasoning is in
`design/brief.md` — the photographer controls how the work is seen.

## Also inherited from the base theme

Working, worth not losing track of: static full-text search at
`/search` (Pagefind, zero backend — note it only indexes piece bodies,
via `data-pagefind-body`, and only works against a real build, not
`astro dev`), the RSS feed at `/rss.xml` (pieces), and sitemap/JSON-LD
SEO basics. Per-piece Open Graph cards generate at build time from
`src/pages/og/pieces/[slug].png.ts`; `public/og.jpg` is the site-wide
fallback for other pages.

## Project structure

```
photo-pieces/
├── astro.config.mjs
├── wrangler.jsonc                # Cloudflare Workers static assets
├── remark-pieces-blocks.mjs      # directive -> block transform
├── remark-pieces-blocks.test.mjs # its unit suite (npm test)
├── CLAUDE.md, ROADMAP.md, DECISIONS.md, AUTHORING.md
├── specs/                        # spec.md, plan.md, tasks.md per spec
├── design/brief.md
├── src/
│   ├── consts.ts                 # site identity
│   ├── content.config.ts         # the pieces collection
│   ├── content/pieces/           # one folder per piece + its images
│   ├── lib/pieces.ts             # the one published-pieces query
│   ├── components/PieceList.astro
│   ├── pages/                    # index, pieces/, about, contact, search, 404
│   └── styles/global.css
```

## Deployment

Decided — Cloudflare Workers static assets (`DECISIONS.md` has the
comparison) — but deliberately **not yet connected**: going live is
paused until the block vocabulary, sample pieces, and galleries exist
(`specs/005-going-live/`). Nothing is publicly reachable; the repo is
private for the pre-launch period; `npm run dev` is the workflow.
`wrangler.jsonc` and the site config are already in place, so
executing spec 005 is dashboard work plus content, no code.

## License

MIT, inherited from [astro-keel](https://github.com/kpab/astro-keel).
See `LICENSE`.

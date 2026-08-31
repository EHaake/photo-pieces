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
- `specs/001-site-foundation/` — the spec, plan, and tasks for the
  current build phase
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

Everything else in the closed block vocabulary uses directive syntax:

```md
::fullbleed{src="./photo-2.jpg" alt="The playa at dusk"}
```

**Current status**: the `fullbleed` transform is implemented and
verified against built output — the directive becomes a real image that
Astro's asset pipeline optimizes — but no page renders pieces yet, so
nothing reaches a visitor. `diptych`, `triptych`, and `sequence` are
specified (`spec.md`) but not yet built. Check
`specs/001-site-foundation/tasks.md` for what's actually done versus
still planned — don't assume this list is current by the time you're
reading it.

Pieces will render at `/pieces/<slug>/` once the reading page exists.
The original theme's `blog`/`works` collections and routes are still
present and unused, kept temporarily rather than torn out
mid-transition (see `plan.md`).

## Configuration

Site name, description, nav, and footer live in one file,
`src/consts.ts`. Social links render as footer icons — built-in set is
`github`, `x`, `linkedin`, `rss`, `email`; **no Instagram icon**, which
is worth fixing given spec.md names Instagram as a primary way visitors
arrive here.

## Customization

### Accent color

One value in `src/styles/global.css` — but genuinely *two* spots right
now, not one, because of the theme's still-present light/dark toggle
system:

```css
:root {
  --color-accent: oklch(0.36 0.075 185);
}
:root[data-theme='light'] {
  --color-accent: oklch(0.36 0.075 185);
}
```

Both need to match. `:root[data-theme='light']` has higher specificity
and wins once the toggle has set state, so editing only the first block
silently does nothing — found that out the hard way. `--color-accent-hover`
derives automatically via `color-mix()` in both. Once dark mode is
actually removed (below), this goes back to being genuinely one line.

### Fonts

CSS variables (`--font-display`, `--font-body`, `--font-mono`) in
`src/styles/global.css`. Swap a face by installing another
`@fontsource` package and updating the variable — **and check
`src/pages/og/[collection]/[slug].png.ts`**, which loads font files
directly for social preview images and won't pick up a CSS-only
change. Easy to miss; already bit us once during the Fraunces → Spectral
swap.

### Dark mode — being removed, not maintained

This project uses one photographer-curated light appearance for every
visitor; see `spec.md` for the reasoning. The original theme's dark
palette, toggle component, and dual syntax-highlighting themes are
still partially present in the code as of this writing — treat them as
deprecated, not as a supported feature. Full removal is a tracked
cleanup pass, not yet done.

## Also inherited from the base theme

Working, unmodified, worth not losing track of: static full-text
search at `/search` (Pagefind, zero backend), an RSS feed at
`/rss.xml`, auto-generated Open Graph images per page, category archive
pages, and sitemap/JSON-LD SEO basics.

## Project structure

```
photo-pieces/
├── astro.config.mjs
├── remark-pieces-blocks.mjs      # directive -> block transform
├── CLAUDE.md, ROADMAP.md, DECISIONS.md
├── specs/001-site-foundation/    # spec.md, plan.md, tasks.md
├── design/brief.md
├── src/
│   ├── content.config.ts
│   ├── content/
│   │   ├── pieces/                # the actual content model
│   │   └── blog/, works/          # legacy, unused, not yet removed
│   ├── pages/pieces/[slug].astro  # planned (T006), not built yet
│   └── styles/global.css
```

## Deployment

Not yet decided, and nothing's live — `npm run dev` is the only thing
currently running. A GitHub Pages workflow ships with the theme at
`.github/workflows/deploy.yml` and would need `site` (and `base`, if
serving from a project-site subpath) set in `astro.config.mjs`.
Whether that's the real answer versus Netlify or Cloudflare Pages is
still an open item in `plan.md`, not decided here.

## License

MIT, inherited from [astro-keel](https://github.com/kpab/astro-keel).
See `LICENSE`.

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
  004 galleries and image pages, 005 going live — deferred, 006 the
  rich image page, 007 the held image and the pause, 008 cross-piece
  image references, 009 places)
- `design/brief.md` — visual and interaction direction
- `DECISIONS.md` — tooling comparisons and naming rationale (why this
  theme, why not a CMS, why this repo name)
- `ROADMAP.md` — deliberately deferred features (shop, comments,
  a newsletter)

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
A block is a leaf (`::name{...}` on its own line) or a container
whose body carries a caption — or, for `aside`, `row`, and `held`,
the prose beside the frame:

```md
::wide{src="./photo-2.jpg" alt="The playa at dusk"}

:::diptych{left="./a.jpg" right="./b.jpg" leftAlt="Before" rightAlt="After"}
Three minutes apart. Captions take _inline markdown_.
:::
```

| Block       | Forms          | Attributes                                                                                                                    | Matted | Obsidian Live Preview |
| ----------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------ | --------------------- |
| `single`    | leaf/container | `src` `alt`                                                                                                                   | yes    | image (leaf)          |
| `inset`     | leaf/container | `src` `alt`                                                                                                                   | yes    | image (leaf)          |
| `wide`      | leaf/container | `src` `alt` `bleed=left\|right`                                                                                               | yes¹   | image (leaf)          |
| `fullbleed` | leaf/container | `src` `alt`                                                                                                                   | no     | image (leaf)          |
| `tall`      | leaf/container | `src` `alt`                                                                                                                   | no     | image (leaf)          |
| `diptych`   | leaf/container | `left` `right` `leftAlt` `rightAlt`, `match=height`, `weight=left\|right`, `width=wide\|fullbleed`                            | yes²   | images (leaf)         |
| `triptych`  | leaf/container | `left` `center` `right` + alts, `match=height`, `width=wide\|fullbleed`                                                       | yes²   | images (leaf)         |
| `grid`      | container only | body: 2–6 markdown images, one per line; text after a blank line = caption                                                    | yes    | raw text              |
| `strip`     | container only | body: 1–8 markdown images (panorama or filmstrip); text after a blank line = caption                                          | no     | raw text              |
| `aside`     | container only | `src` `alt` `side=left\|right`; body: prose that wraps around the image                                                       | yes    | raw text              |
| `row`       | container only | `src` `alt` `side=left\|right`; body: prose beside the image                                                                  | yes    | raw text              |
| `held`      | container only | `src` `alt` `side=left\|right` `bleed` (flag); body: prose that passes beside a frame that stays                              | yes    | raw text              |
| `pause`     | leaf only      | `src` `alt`; no body — nothing to read                                                                                        | yes    | image (leaf)          |
| `sequence`  | reserved       | fails the build until its presentation is designed (`ROADMAP.md`; the image page's compare is a page section, not this block) | —      | —                     |

¹ the bled edge runs clean. ² dropped at `width="fullbleed"`.
Plain `![alt](./photo.jpg)` remains the captionless shorthand for
`single` — same rendered result. Every image carries its own flat
matte, applied by the site's CSS (never bake mattes into files).
An image's `src` is `./<file>` for the piece's own photograph,
`../<slug>/<file>` for another piece's, or
`../../gallery-images/<file>` for one at the gallery root (spec 008) —
the same three shapes in every block, in the shorthand, and in
`cover`. A borrowed photograph keeps its home page, which lists every
other published piece that places it; a published piece may not borrow
from a draft one. Rules the build enforces loudly: alt is required on
every image (`alt=""` only for decorative), unknown blocks and
attributes fail, the `[label]` form fails, blocks can't nest, images
must exist, borrowed drafts fail. The sampler piece
(`src/content/pieces/vocabulary-sampler/`) shows every treatment
rendered.

**Current status**: every block above except the reserved `sequence`
is implemented — the spec-003 blocks and spec 007's two durational
ones — transform, styling, mattes, unit tests, and the Obsidian
plugin's leaf-form rendering — with images going through Astro's asset pipeline
(hashed src, responsive srcset per treatment). Pieces render at
`/pieces/<slug>/`, list at `/pieces/` (in the nav), and feed the
homepage, RSS, and per-piece Open Graph images. Since spec 004 every
image in a piece links to its own page (next section). Check the
newest `specs/*/tasks.md` for what's actually done versus still
planned — don't assume this list is current by the time you're reading
it.

## Images, galleries, and image pages

Every accepted raster (`jpg jpeg png webp avif tiff`) in a published
piece's folder — or in the flat `src/content/gallery-images/` root for
images that belong to no piece — gets a page at `/images/<id>/`, where
the id is `<piece-folder>/<basename>` or `gallery/<basename>`. The
page shows the image matted, its title, a wall label of exposure info
read from the file's EXIF (camera, lens, focal length, aperture,
shutter, ISO, capture date), the piece it came from, the galleries it
sits in, and an optional caption. Every image in a piece links there;
so does every gallery cell. A piece is not limited to the photographs
in its own folder: since spec 008 it may place another piece's or a
gallery-root one by path, and that photograph's page stays its home
folder's, naming the borrowing pieces under "Also in". Since spec 006
the page grows with what the sidecar carries, each section only when
it exists: the image's
own story (the sidecar body, ahead of the label), place and time at
the label's head — the place being the declared place's title as a
link, then the sidecar's free text, when the frame names one — "How
it was made", a raw-to-finished compare against the camera's frame,
the passage of the piece the image sits in, related frames from the
same outing, and "The print" with an enquiry link. Every page has a
neighbour line for the set the reader is stepping through (the
gallery, piece, or place they came from; arrow keys work), and a
quiet view — click the photograph — that dims the ground and gives
the frame the viewport. Rules the build enforces: piece folders
must be slugs and file names URL-safe (letters, digits, `.`, `-`,
`_`), an image directly in `pieces/` or beside a flat `pieces/foo.md`
fails, a file nested in a sub-folder is ignored with a warning (a
directive pointing into one fails), two files differing only by
extension are a collision, and a `draft: true` piece unpublishes its
images with it. Moving or renaming an image changes its URL — there
are no redirects yet.

**Sidecar** — optional, `_<basename>.md` beside the image (the
underscore keeps it out of the pieces collection). Every field is
optional; label fields override the EXIF-derived value as written;
the body is the image's story:

```yaml
---
title: The bank letting go
caption: One paragraph, *inline markdown* allowed.
date: 2026-08-28 # replaces the capture date
camera: Leica M6
lens: Summicron 35
focalLength: 35 mm
aperture: f/8
shutter: 1/250 s
iso: ISO 400
place: The headlands above the cove # prose, never coordinates
at: the-headlands # a declared place's slug; `none` opts out of the piece's default
time: 06:40, forty minutes before sunrise
format: Digital, full-frame # "How it was made": format, filters, support, processing
filters: None
support: Tripod
processing: Single frame; shadows lifted on the ridge.
edition: Open edition # "The print": edition, sizes, paper
sizes: 12 × 18, 16 × 24 inches
paper: Hahnemühle Photo Rag Baryta
---
The story, in the photographer's words — ordinary markdown.
```

A sidecar naming an image that doesn't exist fails the build.

**The camera's frame** — `_<basename>.<ext>` beside the photograph
(`_land-b.jpg` beside `land-b.jpg`) is its unprocessed frame, shown
only as the "before" of that page's compare. Any raster with a
leading underscore is private: no page, never in a gallery, and a
piece that places one fails the build; a frame with no photograph
beside it fails too. See `AUTHORING.md` for the export.

**Gallery** — `src/content/galleries/<slug>.md`, a hand-curated,
ordered list of image ids with one category; `cover` defaults to the
first image:

```yaml
---
title: Fog frames
category: landscape # landscape | street | portrait | event
description: Optional.
date: 2026-08-28 # optional; orders the index and the latest-work strip
cover: where-the-fog-lets-go/land-b
images:
  - where-the-fog-lets-go/land-a
  - where-the-fog-lets-go/land-b
  - gallery/dock-a
---
```

A gallery page packs its images into rows in that order so every
image in a row renders at the same short side (a panorama takes a
whole row; nothing is cropped or reordered — `DECISIONS.md` has the
reasoning). `/galleries/` groups galleries by category and is in the
nav; `/categories/<category>/` lists a category's galleries then its
pieces and is reached from category labels, never from the nav. A
missing, duplicate, or draft-owned id in a gallery fails the build
with the file and line. `src/components/LatestWork.astro` renders the
newest curated images as a strip and is not placed on any page yet
(the homepage design pass will place it).

**Place** — `src/content/places/<slug>.md` (spec 009), somewhere the
photographer returns to: a title, an optional description, cover, and
`draft`, and a body that is the writing about the place. The file name
is the slug and the URL. A frame names its place in its sidecar with
`at: <slug>`, or a piece names one default for its whole folder with
`at: <slug>` in its frontmatter — the frame's own line wins, and
`at: none` opts a frame out of the default. `/places/<slug>/` shows
the writing and then every published frame at the place, grouped by
the piece it lives in, outings oldest first, so the page grows as
pieces are published; `/places/` lists the places as cards and is in
the nav after Galleries. An `at:` naming a place that does not exist
fails the build, listing the places that do, as does a place `cover`
that is not one of its frames once the place publishes; a draft or
still-empty place is a note and builds no page. Gallery-root
photographs are not grouped under a place — their `at:` is checked and then ignored with a warning.

**GPS is never published.** The EXIF reader asks for an allowlist of
exposure tags with GPS parsing off, its output is asserted against a
fixture that carries coordinates, and `postbuild` first prunes the
untouched originals Astro leaves in `dist/_astro/`
(`scripts/prune-unreferenced-originals.mjs` — `DECISIONS.md` explains)
and then scans every image in `dist/` (`scripts/check-no-gps.mjs`),
failing the build on any GPS block. EXIF must survive your web export
for the wall label to fill itself in; the sidecar is the fallback.

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
├── remark-pieces-blocks.mjs      # directive -> block transform (+ image links)
├── remark-pieces-blocks.test.mjs # legacy contracts (npm test)
├── remark-pieces-vocabulary.test.mjs # spec-003 vocabulary suite
├── image-meta.test.mjs, exif.test.mjs, galleries.test.mjs # spec-004 suites
├── image-set.test.mjs            # the set key: gallery, piece, place
├── pause-shape.test.mjs          # spec-007: the pause's 0 → 1 → 0 shape
├── tests/fixtures/               # unit-test images (EXIF-rotated, GPS-bearing)
├── scripts/gen-placeholders.mjs  # fixture placeholder images (pieces, gallery, fixtures)
├── scripts/prune-unreferenced-originals.mjs # postbuild: drop originals nothing links
├── scripts/check-no-gps.mjs      # postbuild: no GPS in any built image
├── obsidian-plugin/              # Live Preview rendering (see its README)
├── CLAUDE.md, ROADMAP.md, DECISIONS.md, AUTHORING.md
├── specs/                        # spec.md, plan.md, tasks.md per spec
├── design/brief.md
├── src/
│   ├── consts.ts                 # site identity
│   ├── content.config.ts         # pieces, galleries, imageMeta, places collections
│   ├── content/pieces/           # one folder per piece + its images (+ _sidecars, _camera's frames)
│   ├── content/gallery-images/   # images that belong to no piece
│   ├── content/galleries/        # one file per gallery
│   ├── content/places/           # one file per place
│   ├── lib/pieces.ts             # the one published-pieces query
│   ├── lib/images.ts             # the image registry (ids, EXIF, sidecars, galleries, places, sets)
│   ├── lib/gallery-layout.ts     # the equal-short-side packing knobs (galleries, related strips)
│   ├── lib/image-meta.mjs        # its pure rules (shared with the transform)
│   ├── lib/pause-shape.ts        # the pause's lights shape (the piece page's script imports it)
│   ├── lib/exif.mjs              # the allowlisted EXIF reader
│   ├── lib/categories.ts         # the category taxonomy
│   ├── components/               # PieceList, CoverCards (GalleryCards wraps it), LatestWork
│   ├── pages/                    # index, pieces/, galleries/, places/, images/, categories/, about, contact, search, 404
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

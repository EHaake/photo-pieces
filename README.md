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
  rich image page, 007 the held image (its pause withdrawn at 017),
  008 cross-piece image references, 009 places, 018 the animation
  pass, 019 the image page, refined)
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
the prose beside the frame, and for `compare`, its stages:

```md
::wide{src="./photo-2.jpg" alt="The playa at dusk"}

:::diptych{left="./a.jpg" right="./b.jpg" leftAlt="Before" rightAlt="After"}
Three minutes apart. Captions take _inline markdown_.
:::
```

| Block       | Forms          | Attributes                                                                                         | Obsidian Live Preview |
| ----------- | -------------- | -------------------------------------------------------------------------------------------------- | --------------------- |
| `single`    | leaf/container | `src` `alt`                                                                                        | image (leaf)          |
| `inset`     | leaf/container | `src` `alt`                                                                                        | image (leaf)          |
| `wide`      | leaf/container | `src` `alt` `bleed=left\|right`                                                                    | image (leaf)          |
| `fullbleed` | leaf/container | `src` `alt`                                                                                        | image (leaf)          |
| `tall`      | leaf/container | `src` `alt`                                                                                        | image (leaf)          |
| `diptych`   | leaf/container | `left` `right` `leftAlt` `rightAlt`, `match=height`, `weight=left\|right`, `width=wide\|fullbleed` | images (leaf)         |
| `triptych`  | leaf/container | `left` `center` `right` + alts, `match=height`, `width=wide\|fullbleed`                            | images (leaf)         |
| `grid`      | container only | body: 2–6 markdown images, one per line; text after a blank line = caption                         | raw text              |
| `strip`     | container only | body: 1–8 markdown images (panorama or filmstrip); text after a blank line = caption               | raw text              |
| `aside`     | container only | `src` `alt` `side=left\|right`; body: prose that wraps around the image                            | raw text              |
| `row`       | container only | `src` `alt` `side=left\|right`; body: prose beside the image                                       | raw text              |
| `held`      | container only | `src` `alt` `side=left\|right` `bleed` (flag); body: prose that passes beside a frame that stays   | raw text              |
| `compare`   | container only | `mode=slider\|side\|switch`; body: 2+ stages, one per line: `![Label](./file.jpg)` then its note   | stages, labels below  |

Plain `![alt](./photo.jpg)` remains the captionless shorthand for
`single` — same rendered result. The site mats only the image page's
quiet view (spec 015, narrowed at 017): a flat white field 6% of the
frame's rendered short side, never narrower than 4px or wider than
40px, equal on all four sides, applied by the site's CSS (never bake
mattes into files). Every other frame, the image page's stage on paper
included, sits on the ground — the gutters of a pair, a grid or a
packed gallery row show the ground between photographs, and each cell
is that much more picture.
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

**Current status**: every block above is implemented — the spec-003
blocks, spec 007's held block and spec 019's compare — transform, styling,
the mat rule (the quiet view alone since spec 017), unit tests,
and the Obsidian plugin's leaf-form rendering (and the compare's stages) —
with images going through Astro's asset pipeline (hashed src,
responsive srcset per treatment). Pieces render at
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
page shows the photograph bare and centred just below the header —
fitted, turned for a portrait, inside a 3:2 rectangle whose long side
is the smaller of the page's width inside its margins and the first
screen's height below the header less the previous / next line and a
piece's frame-to-prose spacing above and below, as large as it can be
while touching a side (a square at the short side, a panorama at the
long side) — with the previous / next line directly beneath at that
spacing and above the fold; then its title, a wall label of
exposure info
read from the file's EXIF (camera, lens, focal length, aperture,
shutter, ISO, capture date — since spec 019 the camera and lens by the
names in `src/content/gear.md`, not as the camera wrote them), the piece it came from, the galleries it
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
it was made", "Raw to finished" — a compare of the photograph's
stages: the camera's frame labelled Camera, the stages its sidecar
lists under their own labels (Tones, say), the photograph labelled
Finished; three ways to see it, a slider wiping between two stages
(Camera | Finished at rest, the legend of stages beneath picking the
pair), side by side (the same pair, running wider than the column), and
a switch (one stage at a time); the reader's choice held for the tab's
session (spec 019, which also brings the same compare into a piece as a
`:::compare` block) —
the passage of the piece the image sits in, related frames from the
same outing, and "The print" with an enquiry link. Every page in a set
has a neighbour line for it (the
gallery, piece, or place they came from; arrow keys work), and every
page has a quiet view — click the photograph — that dims the ground and gives
the frame the viewport, matted on the quiet dark: the one matted surface
on the site. Since spec 019 a click on the photograph there opens the
loupe: it zooms to full detail — one pixel of the file to one pixel of
the screen, read from the photograph's larger export
(`_<basename>.detail.<ext>`) where there is one, else from its own file
where that has detail to add — and follows the mouse, tracking the
pointer's place on the unzoomed photograph; a click without moving
zooms back out, a click around it leaves the quiet view, the wheel, a
pinch and the `+` and `-` keys zoom between, the arrows pan, and on
touch a drag pans.
While the loupe is open the mat goes and the photograph grows into the
freed space with its shape kept; nothing of the unzoomed photograph
shows around it. Since spec 018 the photographs move only in answer to the
reader or to their own loading: none pops — its box waits in the
ground's own colour, so no box shows, until the photograph has decoded
and fades in; below the fold it fades in with a small rise each time it
scrolls into view, down or back up (a strip's frames arrive one by
one, and fade without the rise); clicking a frame carries the photograph
into its page's stage and the way back returns it, following the
browser's history; the arrows slide the photograph off the screen and
the next one on; the quiet view grows the photograph into its mat as the
ground darkens; and reduced motion keeps the fades and drops the
movement. Rules the build enforces: piece
folders must be slugs and file names URL-safe (letters, digits, `.`,
`-`, `_`), an image directly in `pieces/` or beside a flat
`pieces/foo.md` fails, a file nested in a sub-folder is ignored with a
warning (a directive pointing into one fails), two files differing only
by extension are a collision, and a `draft: true` piece unpublishes its
images with it. Moving or renaming an image changes its URL — there are
no redirects yet.

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
stages: # "Raw to finished": the steps between the camera's frame and the photograph
  - file: _land-b.tones.jpg
    label: Tones
    note: Shadows lifted on the ridge, the fog's highlights held.
edition: Open edition # "The print": edition, sizes, paper
sizes: 12 × 18, 16 × 24 inches
paper: Hahnemühle Photo Rag Baryta
---
The story, in the photographer's words — ordinary markdown.
```

A sidecar naming an image that doesn't exist fails the build.

**Private files** — rasters beside a photograph, named for it with a
leading underscore (spec 006, widened at spec 019): its camera's frame
`_<basename>.<ext>` (`_land-b.jpg` beside `land-b.jpg`), the first
stage of its page's compare; a stage `_<basename>.<word>.<ext>`
(`_land-b.tones.jpg`, any word but `detail`), shown where the sidecar's
`stages:` lists it (a `file`, a `label`, an optional one-paragraph
`note`; the frame and the finished photograph are implied) or a
`:::compare` places it; and the loupe's larger export
`_<basename>.detail.<ext>`. None is an image of the site: no page,
never in a gallery, and a piece may place one only as a stage of a
`:::compare` in its own folder — anywhere else fails the build, as do a
private file with no photograph beside it, a second frame or larger
export for one photograph, and a sidecar listing a file that is not
one of its photograph's stages. See `AUTHORING.md` for the exports,
the larger one's size and its 25 MiB ceiling.

**Gear names** — `src/content/gear.md`, edited by hand: one line per
EXIF string under `## Cameras` or `## Lenses`,
``- `ILCE-7RM4` = Sony α7R IV``, and the wall label prints the name.
A malformed line fails the build naming the line; a string the table
lacks warns once (`[gear]`) and prints as it did before the table. A
sidecar's `camera:` or `lens:` still wins.

**Gallery** — `src/content/galleries/<slug>.md`, a hand-curated,
ordered list of image ids with one category; `cover` defaults to the
first image:

```yaml
---
title: Fog frames
category: landscape # landscape | street | portrait | event
description: Optional.
date: 2026-08-28 # optional; orders the index
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
reasoning). On a gallery page the packed rows run wider than the text
column — out to a viewport bleed chosen at a visual gate on the
photographer's two screens (spec 011) — while every prose element (a
gallery's description, a piece's body) keeps its reading measure. The
common short side that sets how large a frame reads is format-aware: it
sizes off the smaller viewport dimension (`vmin`), so a tall or
near-square display (a 16:18 LG DualUp) shows larger frames than a wide
laptop. The related strip on an image page is deliberately left as it
was — its reading-column width and its smaller short side. Place pages
share that room: the one wall under a place's writing runs at the
galleries' width, gap, and format-aware density, from the same
`gallery-layout.ts` (spec 012). `/galleries/` groups galleries by
category and is in the nav, with the category row under its title —
each category a link to its own page, nothing marked. `/categories/<category>/` lists a
category's galleries then its pieces and is reached from category
labels, never from the nav; its head carries the same row with `All`
first, back to `/pieces/`, the category you're on marked rather than
linked, and its "Galleries" and "Pieces" headings link to the two
indexes. The row is one component, `src/components/CategoryRow.astro`,
fed by `categoryRow()` in `src/lib/categories.ts` and shared with
`/pieces/`, which keeps the row it already had. A missing, duplicate,
or draft-owned id in a gallery fails the build with the file and line.

**Place** — `src/content/places/<slug>.md` (spec 009), somewhere the
photographer returns to: a title, an optional description, cover, and
`draft`, and a body that is the writing about the place. The file name
is the slug and the URL. A frame names its place in its sidecar with
`at: <slug>`, or a piece names one default for its whole folder with
`at: <slug>` in its frontmatter — the frame's own line wins, and
`at: none` opts a frame out of the default. `/places/<slug>/` shows the
writing and then one wall — every published frame at the place as a
single packed gallery, outings oldest first and each piece's frames in
its own order, with nothing between the visits and no piece named on
the page — so the page grows as pieces are published; `/places/` lists
the places as cards and is in the nav after Galleries. An `at:` naming
a place that does not exist fails the build, listing the places that
do, as does a place `cover` that is not one of its frames once the
place publishes; a draft or still-empty place is a
note and builds no page. Gallery-root photographs are still kept out of
a place — with no piece they have no publish date to take their turn by
(`ROADMAP.md`) — so their `at:` is checked and then ignored with a
warning.

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

The three reading pages — piece, gallery, and place — share one head,
marked `reading-head` and spaced by `--head-pad-reading` (above and
below it) and `--head-gap-reading` (before the body) in
`src/styles/global.css`. Both start at `.section`'s clamp and tighten
to `3rem` from 720px up — width alone, so a portrait monitor gets the
tighter head too — while below that the phone keeps today's air.

## Also inherited from the base theme

Working, worth not losing track of: static full-text search at
`/search` (Pagefind, zero backend — note it only indexes piece bodies,
via `data-pagefind-body`, and only works against a real build, not
`astro dev`), the RSS feed at `/rss.xml` (pieces), and sitemap/JSON-LD
SEO basics. Per-piece Open Graph cards generate at build time from
`src/pages/og/pieces/[slug].png.ts`; `public/og.jpg` is the site-wide
fallback for other pages, regenerated by `npm run og`
(`scripts/gen-og.mjs`) whenever `:root`'s ground moves — after
resyncing `COLOR` in `src/lib/og-card.mjs`, the hand-kept hex copy of
the tokens that Satori's card draws with, since the generator refuses
to write while the two disagree. `ground.test.mjs` pins both ends: the
four derived tokens against the ground by the family rule, and `COLOR`
against the tokens.

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
├── motion.test.mjs               # the motion grammar: the tokens pinned by name, no literal motion, nothing loops
├── compare.test.mjs, loupe.test.mjs # the compare's and the loupe's rules, each tunable pinned by its round
├── gear.test.mjs                 # the gear table: its parse, its failures, the label's lookup, the warning
├── private-files.test.mjs        # the private-files barrier, run against fixture directories
├── obsidian-plugin.test.mjs      # the plugin's reading of a compare body; Live Preview itself is attested by eye
├── tests/fixtures/               # unit-test images (EXIF-rotated, GPS-bearing)
├── scripts/gen-placeholders.mjs  # fixture placeholder images (pieces, gallery, fixtures)
├── scripts/prune-unreferenced-originals.mjs # postbuild: drop originals nothing links
├── scripts/check-no-gps.mjs      # postbuild: no GPS in any built image
├── scripts/check-private-files.mjs # postbuild: every loupe file present and under 25 MiB, a larger export named nowhere else, every compare in one shape, no script-only state in the markup
├── scripts/check-no-dev-routes.mjs # postbuild: no dev-only routes in dist/
├── scripts/check-motion.mjs      # postbuild: no literal duration or curve, hidden frame or autoplay in dist/
├── scripts/gen-og.mjs             # npm run og: rewrites public/og.jpg on the committed ground
├── obsidian-plugin/              # Live Preview rendering (see its README)
├── CLAUDE.md, ROADMAP.md, DECISIONS.md, AUTHORING.md
├── specs/                        # spec.md, plan.md, tasks.md per spec
├── design/brief.md
├── src/
│   ├── consts.ts                 # site identity
│   ├── content.config.ts         # pieces, galleries, imageMeta, places collections
│   ├── content/pieces/           # one folder per piece + its images (+ _sidecars, _private files: camera's frames, stages, larger exports)
│   ├── content/gallery-images/   # images that belong to no piece
│   ├── content/galleries/        # one file per gallery
│   ├── content/places/           # one file per place
│   ├── content/gear.md           # the gear table: EXIF camera and lens strings to the label's names
│   ├── lib/pieces.ts             # the one published-pieces query
│   ├── lib/images.ts             # the image registry (ids, EXIF, sidecars, galleries, places, sets)
│   ├── lib/gallery-layout.ts     # packing knobs: bleed width, gap, format-aware density (galleries); density also drives the srcset/sizes math so CSS and images can't drift; the related strip's knobs live here too; the place page's wall consumes the same width, gap, and density
│   ├── lib/image-meta.mjs        # its pure rules (shared with the transform)
│   ├── lib/stage-sizes.ts        # the image page's stage `sizes` rule, spelled in literals
│   ├── lib/exif.mjs              # the allowlisted EXIF reader
│   ├── lib/categories.ts         # the category taxonomy
│   ├── lib/ground.ts             # the ground's family: fixed steps to the fills and hairlines, the contrast readout, the gate's candidates
│   ├── lib/og-card.mjs           # the Open Graph card — one tree and one palette for the per-piece route and `npm run og`
│   ├── lib/motion.ts             # the motion grammar's names, read off :root: the appearance, the arrival, the travel, the quiet view
│   ├── lib/motion-scan.mjs       # the literal-motion scan (shared by the test and the postbuild check)
│   ├── lib/compare.ts            # the compare, a piece's and the image page's: its tunables, its rules, the enhanced block, built before the router swaps a page in
│   ├── lib/loupe.ts              # the loupe: its tunables, its file's getImage() options, its state, the quiet view's controller
│   ├── lib/gear.mjs              # the gear table's parser and the unknown strings the build warns of
│   ├── components/               # PieceList, CoverCards (GalleryCards wraps it), CategoryRow
│   ├── components/DevMotion.astro # dev-only motion switch: the named settings, the behaviours' on/off; renders nothing in a build
│   ├── components/dev-motion-panel.ts, dev-motion-presets.ts # its panel (served, never bundled) and its named settings
│   ├── pages/                    # index, pieces/, galleries/, places/, images/, categories/, about, contact, search, 404
│   ├── pages/dev/                # dev-only fixtures (the page-head sampler, the gallery width/gap/density sampler, the place-wall sampler, the matte sampler at dev/matte/, which also carries the site-wide ground switch); postbuild fails if any reach dist/
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

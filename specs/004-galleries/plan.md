# Plan: Galleries and Image Pages

**Status**: Implemented — with two review amendments recorded in
place (T307R equal-short-side gallery rows; T306R image-first page)
and the corrections listed at the end
**Implements**: spec.md in this directory

## Shape of the change

- An **image registry** (`src/lib/images.ts`): every accepted raster
  under `src/content/pieces/**` and `src/content/gallery-images/**`
  whose owning piece is published, with a stable id, Astro
  `ImageMetadata`, EXIF-derived exposure fields, optional sidecar
  metadata, and back-references (owning piece, galleries). Built once
  per build; every page below consumes it. Pure logic (id derivation,
  EXIF formatting, override merge, gallery validation) lives in
  `src/lib/image-meta.mjs`, importable by vitest and by the transform;
  the thin Astro-coupled wrapper (`astro:content`, `import.meta.glob`)
  stays untested like `pieces.ts`.
- **Image pages** at `/images/<id>/` — the wall-label baseline.
- **Galleries**: a `galleries` collection, `/galleries/` (grouped by
  category, and a **Galleries** nav entry), `/galleries/<slug>/`.
- **Category browsing**: the spec asks for a category-grouped
  galleries index and category filtering on `/pieces/`. The plan's
  proposed answer is one route family, `/categories/<category>/`,
  listing that category's galleries then pieces — linked from category
  eyebrows, never in the nav (so not a "per-genre section"). Flagged
  by the reviewer as new surface beyond the spec's wording; **chosen by
  the photographer at plan review** over per-category list pages under
  `/pieces/`.
- **Piece images become links** to their pages (transform + CSS).
- **Constitution amendment** (own commit): the Content model gains the
  image registry (auto-derived over all site images — distinct from
  galleries, which stay hand-curated) and the `gallery-images` root
  beside co-located piece images; `exifr` joins the Dependencies
  section.

## Image identity — one derivation, two callers

`id = <folder>/<basename>`; folder is the piece's folder name or
`gallery`; basename drops the extension. URL `/images/<id>/`. The
derivation is a pure function `imageIdFor(filePath)` in
`image-meta.mjs`, used by **both** the registry and the transform
(which can't import anything using `import.meta.glob`), tested against
the same inputs. To keep it identical to Astro's piece ids without
re-implementing its slugger: **piece folder names must already be
slugs** (`^[a-z0-9-]+$`), validated loudly by the registry — a
`Jetty Dawn/` folder fails the build with a rename hint.

Collision handling: `shot.jpg` + `shot.webp` in one folder yield the
same id (the extension is dropped) — the registry fails the build
naming both files. Subfolders inside a piece folder are not images'
homes: the transform fails loudly on any `src` containing `/`
(`./detail/img.jpg`), and the registry ignores nested files with a
build warning. Remote and root-absolute `src`s are left to Astro as
today and are **not** wrapped (no page exists for them).

Accepted extensions (registry and wrapping): `jpg jpeg png webp avif
tiff` — Astro's raster input set minus `gif`/`svg` (no EXIF, not
photographs). HEIC is not an Astro input format and is out of scope
(the earlier "handles HEIC" note was irrelevant — removed).

Discovery: `import.meta.glob('/src/content/{pieces,gallery-images}/**/*.{jpg,…}', { eager: true })`
— the documented Astro recipe for dynamic local images, yielding each
file's `ImageMetadata` for `<Image>`. Keys are root-absolute (pattern
form); `imageIdFor` parses that form.

**Draft pieces**: images owned by a `draft: true` piece are excluded
from the registry (no page, no sitemap entry) so spec 005's "set
`draft: true`" unpublish mechanism keeps working. A gallery
referencing such an image fails the build (file + line + id) —
curation of unpublished work is an authoring error worth hearing
about. Gallery-folder images have no owner and are always published.

"Appears in": ownership is by folder — an image belongs to exactly one
piece (or none). The page says "From the piece …"; whether the piece
body actually references the file is not tracked in 004 (an
unreferenced alternate frame in a piece folder still gets a page —
per the photographer's every-image decision — and AUTHORING.md gains
the rule that a piece folder is public territory). Multi-piece
membership is a rich-page-spec question.

## EXIF

New dependency **`exifr`** (7.x; zero transitive dependencies; a
single maintainer and no release in over a year — accepted, it's
small, stable, and purpose-built; the alternative,
`sharp().metadata().exif` plus a second decoder, is more machinery for
the same fields). Read at build from the file path with `pick` on the
allowlist `Make Model LensModel FocalLength FNumber ExposureTime ISO
DateTimeOriginal` and `gps: false`. Value shapes are pinned by tests:
exifr returns `ExposureTime` as a decimal (0.002) and
`DateTimeOriginal` as a `Date`; the formatter reconstructs `1/500 s`
(and `2 s` for ≥ 1 s), `f/5.6`, `35 mm`, `ISO 400`, and a date. The
sidecar override for each field is a string that wins verbatim.

**GPS can't leak, verified three ways**: the registry's output object
is asserted (test) to have exactly the allowlisted keys, using a
fixture that _does_ carry GPS (generated with sharp `withExif` IFD3);
a post-build check parses EXIF from every `dist/**/*.{jpg,jpeg,webp,
avif}` and asserts no GPS block — Astro's sharp service strips
metadata from optimized variants (verified in its source) but emits
originals when referenced outside processing, and the registry must
never cause that; and the wall label renders only formatted allowlist
fields.

## Sidecars

Optional `_<basename>.md` beside the image. The leading underscore
keeps it out of the `pieces` loader's `[^_]*.md` pattern by
construction. One `imageMeta` collection: `glob({ base:
'./src/content', pattern: '{pieces,gallery-images}/**/_*.md' })` (a
bare `**/_*.md` would sweep `galleries/`). Mapping: entry id
`pieces/<slug>/_land-b` → image id `<slug>/land-b`. Schema: `title`,
`caption` (markdown), `date`, overrides `camera lens focalLength
aperture shutter iso`, all optional. **Orphan sidecars fail the
build** (a sidecar naming no image is the author's typo, and silence
would hide it).

## Galleries

`src/content/galleries/<slug>.md`: `title`, `category` (the shared
enum, extracted to `src/lib/categories.ts` and imported by
`content.config.ts` for both pieces and galleries), `description`,
`date`, `cover`, `images` (ordered ids). Validation runs in the
registry build, which every page's `getStaticPaths` awaits — so a
missing, duplicate, or draft-owned id fails `astro build` even if no
gallery page would render. The error carries **file + line**: the
loud path re-reads the gallery file and reports the line containing
the offending id (no YAML source map needed). Latest-work ordering:
galleries by `date` desc, images in gallery order, de-duplicated —
the image's own EXIF date is the tiebreak the spec allows, used only
when a gallery has no date.

## Pages

- `/images/[...id].astro`: `<Image>` (constrained, matted), title
  (sidecar → alt from the owning piece's first reference → humanized
  filename), the wall label as a `<dl>`, "From the piece …", "In
  galleries …", caption. Typography: the theme's eyebrow + hairline
  language (provisional answer to the brief's open question; a sampler
  knob). **OG image**: the image itself via `getImage()` — the
  optimized, metadata-stripped output, never the original.
- `/galleries/index.astro`: grouped by category in enum order; cover,
  title, count. Gallery pages pass their cover as OG image.
- `/galleries/[slug].astro`: plain grid — 3 columns at ≥ the content
  width (1160px), 2 between, 1 below the shared 720px breakpoint (no
  new breakpoint constants — reviewer: a fourth writer of the same
  facts); rows midline-centered; cells `a > img`, matted; no cropping.
  **Mixed aspect ratios** (photographer's question at plan review):
  the grid assumes nothing — equal-width columns, each image at its
  own height, each row centered on a shared midline like the diptych
  default, so a 5:8 frame is just a slightly taller cell. A row's
  height follows its tallest image, so a landscape beside a portrait
  sits in page-colored air; accepted as the gallery-wall look. The
  photographer intends to curate so wildly different ratios don't sit
  side by side; equal-height rows (the `match="height"` math per row)
  would be a future spec if that ever changes, not a 004 option.
  **Superseded at the sampler review (T307R):** seeing a 3:1 pano as a
  sliver in one of three columns, the photographer asked for images
  to be "roughly the same size perceptually — every image's short
  side about the same". Gallery pages now use `.gallery-flow`: a
  flex-wrap row layout where each cell's basis is its width at a
  common short side S (`--gallery-short`; portraits and squares S,
  landscapes S × ratio via a per-cell `--ar`), grow proportional to
  that width, mat padding carried in the basis as a constant. One
  factor scales each row to fill, so short sides are exactly equal
  within a row and rows differ only by that factor, capped at
  `--gallery-stretch` with leftover centered. Editorial order is
  never changed to fill a row (the honest cost: a lone landscape
  before a pano sits centered in a short row). Below the 720px
  collapse the cap is lifted so one frame per row fills the width.
  Integer column spans were rejected: a 3:2 in two of three columns
  is a third too big, in one a third too small, and spans leave holes
  once order is fixed. The gallery cards on the index keep the plain
  `.gallery-grid`.
- `/categories/[category].astro`: that category's galleries (cards)
  then pieces (`PieceList`); category eyebrows on piece, gallery, and
  image pages link here; `/pieces/` gains a category link row.
- `LatestWork.astro`: exported, unplaced. Reviewed on a temporary page
  that is **deleted before merge** (stated, not implied).

## Piece images as links — the matte moves to the anchor

The transform wraps each emitted image node — and each shorthand
`image` node not already inside a link — in an mdast `link` to
`/images/<piece-folder>/<basename>/` (piece folder from the file path;
a comment notes `withBase` can't apply in a remark plugin and
`BASE_URL` is `/`). **Exception (spec criterion amended): images with
`alt=""` are not wrapped** — a link whose only content is an empty-alt
image has no accessible name (WCAG 2.4.4), and a decorative image
shouldn't be a destination.

Because the anchor becomes the layout item, **the matte moves to the
anchor** for every matted block (background + padding on `a`, `img {
display: block; width: 100% }` inside), which keeps `match="height"`
exact: with the matte on the img under an unpadded flex anchor, the
heights would drift by `2m(1 − 1/ar)` — ~19px for a pano beside a
square — breaking the 003 sampler-review contract. One rule, one
source of truth. Retargets enumerated: match-height flex + `--ar`
style → the anchor; strip's `height:100%; flex:none; scroll-snap-align;
max-width:none` → the anchor with `height:100%` re-applied to the
img; tall's `width:auto; max-height` stays on the img with the anchor
`display:inline-block`; grid/collapse rules that sized `img` become
`a > img`; `.prose > p > img` becomes `.prose > p > a > img`;
`a.image-link` suppresses the theme's gradient underline and gets the
site focus ring. The 003 browser geometry pass is re-run in full
after the change.

## Fixtures

Two `gallery-images/` placeholders with synthetic EXIF — one **with
GPS** (the leak test's subject); two fixture galleries over the demo
pieces' images (landscape, "best of" — the piece-owned back-reference
cases); two sidecars (title + caption, and overrides); all added to
spec 005's unpublish list. One fixture piece set `draft: true` in a
test build to prove its images vanish.

**Graded example galleries** (photographer's addition at tasks
review): four more galleries over a generated `gallery-images/` set,
one per category, stepping from very uniform to very disparate — all
3:2; all vertical at near-ratios (2:3, 4:5, 5:8); horizontals and
verticals mixed; every ratio at once including the 3:1 pano and 16:9.
They exist so the mixed-ratio grid is judged across the whole range
at the sampler review, not only on a tidy case. Gallery-folder
fixtures have no owning piece, so unpublishing them at spec 005 means
deleting the files, not setting a draft flag.

## Testing strategy

- Vitest (pure `image-meta.mjs`): `imageIdFor` for both callers incl.
  a spaced/capitalized folder (must fail) and a nested path (must
  fail); collision detection; EXIF formatting from exifr's real value
  shapes (decimal exposure, `Date`); override merge; allowlist-only
  output with the GPS fixture; `validateGalleries(entries, knownIds)`
  for missing/duplicate/draft-owned ids with line recovery.
- Vocabulary suite: every block's images wrapped in links to the
  derived URL (fixture folder → `/images/fixtures/photo/`), shorthand
  wrapped, `alt=""` not wrapped, `--ar` on the anchor, subfolder `src`
  fails, remote `src` not wrapped.
- Build: every fixture image has a page; missing gallery id fails with
  file + line; draft piece's images absent; post-build EXIF scan over
  `dist` finds no GPS.
- Browser: grid columns at three widths, midline rows, matte on
  anchors, image page label for a placeholder, the full 003 geometry
  pass re-run, latest-work on the temp page.

## Dependencies

- `exifr` (new, build-time) — named here and in CLAUDE.md.

## Corrections made during implementation

- **Image page order (T306R, visual gate):** the title above the image
  pushed most frames below the fold. The page now opens on a stage
  exactly the height of the viewport below the sticky header, with the
  matted frame centered in it and sized to fit whole; title, label,
  caption, and back-references follow. The header publishes its real
  height as `--header-h` from the layout script (it varies with width
  and nav wrapping), with a CSS fallback matching the desktop size.
- **Calendar dates:** the theme's `formatDate` formatted in local time,
  so YAML dates (UTC midnight) printed the previous day west of
  Greenwich. It formats in UTC now, and EXIF capture times are re-based
  to UTC wall-clock in `formatExposure` so both conventions agree.
- **Sidecar ids:** the `imageMeta` loader uses a custom `generateId`
  returning the path verbatim, so the mapping to an image id never
  passes through Astro's slugger.
- **Captions:** rendered with `@astrojs/markdown-remark`'s
  `createMarkdownProcessor` (already a dependency) from
  `src/lib/markdown.ts` — no new package.
- **Build cache:** Astro's content layer caches rendered entries by
  digest in `node_modules/.astro/data-store.json`; a transform change
  doesn't reach `astro build` output locally until that file is
  deleted. CI builds fresh. Recorded in AUTHORING.md.
- **Uppercase extensions:** `imageIdFor` accepts `.JPG`; the registry's
  glob lists both cases so the transform can't link to a page the
  registry never made.
- **Temporary review route:** `/latest-review/` (an underscore-prefixed
  route would be excluded from routing), deleted at T314.
- **Originals in the output (T312):** the post-build scan found the
  OG request for a source-sized JPEG passed the original through
  (fixed in `src/lib/og.ts`), and that Astro leaves every
  ESM-imported image's untouched original in `dist/_astro/` because
  its referenced-outside-processing check marks them all in this
  static build — 33 files, predating 004 (covers). The plan's "the
  registry must never cause that" turned out to be Astro's doing;
  `scripts/prune-unreferenced-originals.mjs` deletes unreferenced
  originals in `postbuild` before the scan. Reasoning in DECISIONS.md.

## Known limitations / deferred

- The rich image page — its own spec; URL and model stay stable.
- Moving or renaming an image changes its URL (no redirects yet;
  nothing is live).
- Referenced-vs-unreferenced images in a piece folder aren't
  distinguished; multi-piece membership isn't modeled.
- Homepage placement of latest-work waits for the design pass.

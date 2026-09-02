# Plan: Galleries and Image Pages

**Status**: Draft — pending skeptical review, then the photographer's
**Implements**: spec.md in this directory

## Shape of the change

Three new content surfaces and one cross-cutting change:

- An **image registry** (`src/lib/images.ts`): every raster under
  `src/content/pieces/**` and `src/content/gallery-images/**`, with a
  stable id, Astro image metadata, EXIF-derived exposure fields,
  optional sidecar metadata, and back-references (owning piece,
  galleries). Built once per build, consumed by every page below.
- **Image pages** at `/images/<id>/` — the wall-label baseline.
- **Galleries**: a `galleries` content collection, `/galleries/`
  (grouped by category) and `/galleries/<slug>/` (the plain grid);
  **category pages** at `/categories/<category>/` listing that
  category's galleries and pieces (the "filtering without per-genre
  sections" answer — one route pattern, no nav sections).
- **Piece images become links**: the transform wraps every image it
  emits — and every shorthand markdown image — in a link to its page.
  Constitution amendment (own commit): the content model gains the
  `images` registry and `galleries` collection alongside `pieces`.

## Image identity

`id = <folder>/<basename-without-extension>`, where folder is the piece
slug or `gallery` for the standalone folder — so `/images/where-the-
fog-lets-go/land-b/` and `/images/gallery/ridge-evening/`. Readable,
sidecar-friendly, and stable as long as the file stays where it is;
moving or renaming a file changes its URL (documented in AUTHORING —
the photographer controls both). Content-hash ids were considered and
rejected: opaque URLs, and the fixtures' shared placeholders would
collapse three pieces' images into one page. Two images with the same
basename in one folder can't happen (filesystem); the same basename
across folders is fine.

Image discovery uses `import.meta.glob` over the two roots with
`{ eager: true }` — the mechanism Astro itself documents for dynamic
local images — which yields each file's `ImageMetadata` for
`<Image>`, no custom content-layer loader needed. Cross-folder
references from a piece (`../other/img.jpg`) are out of scope: an
image belongs to the folder it lives in.

## EXIF

New dependency: **`exifr`** (justified per policy: purpose-built EXIF
parser, zero transitive deps, handles JPEG/TIFF/HEIC and the
orientation tag; `sharp().metadata().exif` would give only a raw
buffer needing a second decoder). Read at build in the registry —
fields: `Make`, `Model`, `LensModel`, `FocalLength`, `FNumber`,
`ExposureTime`, `ISO`, `DateTimeOriginal`. GPS is never read
(`gps: false`), so it cannot leak. Exposure formatting (`f/5.6`,
`1/500 s`, `35 mm`, `ISO 400`) is a pure function in
`src/lib/image-meta.mjs` — importable by vitest without Astro virtual
modules — with the frontmatter override merge next to it.

## Sidecars

Optional `_<basename>.md` beside the image (`_land-b.md` for
`land-b.jpg`). The leading underscore keeps it out of the `pieces`
loader's `[^_]*.md` pattern by construction; an `imageMeta`
collection loads `**/_*.md` under both roots. Schema: `title`,
`caption` (markdown), `date`, and override fields for each EXIF key
(`camera`, `lens`, `focalLength`, `aperture`, `shutter`, `iso`), all
optional. Sidecar wins field-by-field over EXIF.

## Galleries

`src/content/galleries/<slug>.md`: `title`, `category` (the shared
enum — extracted to `src/lib/categories.ts` so pieces and galleries
share one list), `description`, `date`, `cover` (an image id),
`images` (ordered image ids). Validation beyond the schema — every
listed id exists — runs in the registry with a loud error naming the
gallery file and the missing id (YAML line numbers aren't available
from the content layer; file + offending value is the honest
contract, noted against the spec's "file + line").

## Pages

- `/images/[...id].astro`: `<Image>` (constrained, matted like every
  image), title (sidecar → alt from the first piece reference →
  humanized filename), the wall label as a `<dl>` (camera, lens,
  focal length, aperture, shutter, ISO, date), "Appears in" piece
  links, "In galleries" links, caption. Typography: the theme's
  eyebrow + hairline language (the brief's open question, decided
  provisionally toward continuity; a sampler-review knob).
- `/galleries/index.astro`: galleries grouped by category in the
  enum's order, each with cover, title, count.
- `/galleries/[slug].astro`: the plain grid — 3 columns ≥ 1000px, 2
  between, 1 below the shared 720px breakpoint; rows midline-centered
  like diptychs; cells are `a > img`, matted; no cropping.
- `/categories/[category].astro`: that category's galleries then
  pieces, reusing `PieceList` and the gallery card.
- `/pieces/index.astro` gains a category link row (to the category
  pages) — the deferred filtering, with no client JS.
- `LatestWork.astro`: newest N curated images (galleries sorted by
  date, images in gallery order, de-duplicated). Exported, unplaced;
  rendered on a temporary page during the sampler review only.

## Piece images as links (transform + CSS)

The transform wraps each emitted image node in an mdast `link` to
`/images/<piece-slug>/<basename>/` (slug from the piece file's
folder), and a final pass wraps shorthand `image` nodes not already
inside a link. The `--ar`/sizing hProperties stay on the image;
equal-heights flex items become the anchors, so the CSS retargets:
`.match-height > a { flex: var(--ar,1) 1 0; min-width: 0 }` with the
`--ar` custom property moved to the link's style; grid/collapse
`img` rules become `a > img` where they sized items. Link styling: the
theme's underline gradient on `a:not(.brand,.button)` is suppressed
for image links (`a.image-link`), the anchor is `display: block`, and
the matte stays on the `img`. Gallery-folder images have no piece —
no wrapping needed there (they're only reached via galleries).

## Fixtures

Two standalone images in `src/content/gallery-images/` (generated
with synthetic EXIF, like the piece placeholders), three fixture
galleries over the demo pieces' images (landscape, street, and a
mixed "best of"), two sidecars demonstrating title/caption/override,
and the fixtures added to spec 005's unpublish list.

## Testing strategy

- Vitest, pure modules: id derivation, EXIF→label formatting, the
  override merge, gallery validation (missing id, duplicate id,
  category enum).
- Vocabulary suite: every block's images are wrapped in links to the
  right URL (derived from the fixture folder), shorthand images too,
  and `--ar` lands on the anchor.
- Build: every fixture image has a page; a gallery referencing a
  missing id fails with file + id; GPS absent from output (grep).
- Browser: gallery grid columns at three widths, midline centering in
  rows, matte on cells, image page renders the EXIF label for a
  placeholder, link wrapping leaves the 003 geometry pass intact
  (rerun its checks), the latest-work strip renders on the temp page.

## Dependencies

- `exifr` (new, build-time). Named here per the constitution's policy.

## Known limitations / deferred

- The rich image page (narrative, extended metadata, prints) — its own
  spec; 004's page is the baseline and keeps the URL and model stable.
- Gallery validation reports file + value, not line.
- Moving/renaming an image changes its URL (no redirects — nothing is
  live yet; revisit with 005 if it ever matters).
- Homepage placement of latest-work waits for the design pass.

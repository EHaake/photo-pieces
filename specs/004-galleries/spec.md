# Spec: Galleries and Image Pages

**Status**: Approved (photographer, plan review) — tasks.md follows
**Depends on**: 001 (pieces, the gallery entity and flows), 003 (block
vocabulary — piece images become the links into image pages). Feeds
the homepage design pass (latest-work component) and the future rich
image-detail spec (`ROADMAP.md`).

## Summary

Two things, tightly coupled:

1. **Every image gets its own page** — a stable URL and a detail page,
   by default, whether it lives in a piece or only in a gallery
   (photographer's decision at spec review: "every image should get it
   by default"). This first version is the design brief's signature
   element at baseline — a museum wall label in typography: title,
   exposure info, the piece(s) it appears in, an optional caption.
   The **rich** image page the photographer actually wants — deeper
   metadata, the image's own story, richer than any site builder
   offers — is deliberately its own future spec; this one builds the
   foundation it will stand on (identity, URL, metadata model) without
   pre-designing it.
2. **Galleries** — named, hand-curated selections from that universe of
   images, each tagged with a category (landscape/street/portrait/
   event), presented as the brief's deliberately plain grid. Never
   auto-generated: an image appears in a gallery only because the
   photographer put it there, in an order they chose.

## Goals

1. Every image on the site has a canonical URL and a detail page that
   is never thin: exposure info from the file's EXIF (camera, lens,
   focal length, aperture, shutter, ISO), the piece(s) it appears in,
   its alt text, and any hand-written title/caption — with frontmatter
   overriding EXIF wherever both exist.
2. Clicking an image anywhere — inside a piece, in a gallery, in the
   homepage feed — opens its page (not an overlay). This closes the
   brief's "recurring, functional, distinctive" loop for the signature
   element.
3. The photographer curates galleries in Obsidian as plain files:
   create a gallery, list images in order, tag a category. Metadata
   for an image is an optional frontmatter-only sidecar — zero
   required authoring for an image to exist and have a page.
4. Category browsing without per-genre site sections (spec 001 goal
   8): a galleries index grouped by category, and gallery pages
   filterable by that category structure. Pieces gain the same
   category filtering on `/pieces/` (deferred from spec 002).
5. A drop-in "latest work" component (newest curated images) exists
   for the homepage design pass to place — not placed by this spec.
6. The image page is the site's first _interactive-adjacent_ surface
   only in the sense of being reachable from everywhere; it stays
   static HTML, no islands (constitution).

## Non-goals

- **The rich image detail page** — narrative, extended metadata
  design, print info, related images. Roadmapped as its own spec;
  004's page is the baseline it grows from and must not paint it into
  a corner (the metadata model should be extensible, the URL stable).
- **Lightboxes / overlays** — the brief chose pages over overlays.
- **Masonry and equal-height justified layouts** — no reordering, no
  column packing, and no rows where a portrait ends up the smallest
  frame. The gallery layout is rows in editorial order with every
  image in a row at the same short side (amended at the sampler
  review; see Design requirements).
- **Shop / print sales** — roadmap; the image page is where it will
  eventually live, which is one more reason its URL must be stable.
- **Homepage placement** of the latest-work component.
- **Sequence block, comments, search widening** — unchanged.

## Entities

- **Image** — every raster in a published piece's folder or the
  gallery-images folder (images owned by a `draft: true` piece are
  unpublished with it — spec 005's unpublish mechanism depends on
  this; amended at plan review). Identity: a stable id derived from
  its location (plan detail), a canonical URL `/images/<id>/`.
  Metadata: EXIF read at build (exposure fields; GPS never published),
  plus an optional sidecar with title, caption, and overrides. Knows
  the piece it belongs to (by folder — one piece or none) and which
  galleries include it.
- **Gallery** — a named, ordered, hand-curated list of image ids with
  a title, category, description, and cover. URL `/galleries/<slug>/`.
- **Category** — the shared taxonomy (landscape, street, portrait,
  event), extensible; drives the galleries index and pieces filtering.
- **Latest-work component** — the N newest curated images (by the
  gallery's own date or the image's), rendered as a strip; unplaced.

## Key user flows

### Browsing a gallery

`/galleries/` lists galleries grouped by category. A gallery page is a
plain grid in the photographer's order; each image links to its page.

### Reading an image

An image page shows the image (matted, as everywhere), its title (or
a derived one), the wall label — exposure info, the piece(s) it
appears in as links, the galleries it's in — and any caption. From a
piece, the reader can step into an image and back.

### Curating

The photographer drops images into a piece or the gallery folder,
optionally writes a sidecar for title/caption/overrides, and creates
or edits a gallery file listing image ids in order. All in Obsidian;
all validated at build (a gallery referencing a missing image fails
loudly).

## Design requirements

- The gallery grid is plain and conventional (brief); thumbnails are
  matted like every image on the site; grid density is a design knob.
- The image page is typographic — no plaque, no frame; the brief's
  open question (borrow the hairline-rule language or read distinct)
  gets answered here in the sampler review.
- Images as interface: the image page's chrome stays out of the way;
  the header's hide-on-scroll behavior applies.
- No cropping in grids: thumbnails keep their aspect ratio, rows are
  midline-centered the way diptychs are.
- **Equal short sides** (photographer, sampler review — "every
  image's short side should be rendered about the same"): a gallery
  page packs its images into rows in editorial order so that every
  image in a row renders at the same short side; a panorama therefore
  takes a whole row rather than a sliver of one, and a 3:2 takes one
  and a half times a portrait's width. Rows that can't fill stay
  short and centered — order is never changed to fill them. Density
  (the target short side) and the short-row stretch cap are review
  knobs. The gallery cards on the index keep the plain grid.

## Authoring requirements

- Sidecar and gallery files are plain YAML-frontmatter `.md`,
  Obsidian-native, validated by content-collection schemas.
- EXIF must survive the photographer's web exports for automation to
  work — confirmed at spec review (exports keep EXIF), documented in
  AUTHORING.md, with the frontmatter override as the fallback for
  corrections and enrichment.
- Fixture placeholders carry synthetic EXIF so the samplers exercise
  the EXIF-driven page, not only the frontmatter-only path.
- The Obsidian plugin is unaffected (no new directives).

## Acceptance criteria

- [x] Every accepted image in every published piece's folder and in
      the gallery folder has a page at a stable URL, and no page is
      thin: exposure info (when EXIF exists), the owning piece's link,
      alt/title/caption as available; images owned by draft pieces
      have no page
- [x] Frontmatter sidecar fields override EXIF-derived ones; GPS is
      never emitted — proven against a fixture that carries GPS, both
      in the label data and in every image file in the built output
- [x] Piece images (every block in the vocabulary, including the
      shorthand single) link to their image pages — except images with
      `alt=""`, which stay unlinked (a link with no accessible name
      fails WCAG; a decorative image isn't a destination); mattes,
      equal-heights exactness, and every 003 layout measurement are
      unchanged by the link wrapping
- [x] Galleries render as ordered rows with every image in a row at
      the same short side, nothing cropped, nothing reordered; every
      image links to its page; a gallery referencing a missing image
      fails the build with file + line
- [x] `/galleries/` groups by category; `/pieces/` gains category
      filtering; no per-genre site sections exist
- [x] A gallery image with no originating piece renders its page
      without error (spec 001 criterion)
- [x] The latest-work component renders the newest curated images and
      is not placed on any page (the temporary review page is deleted
      before merge)
- [x] Unit tests cover the image-id derivation, EXIF/override merge,
      and gallery validation; build green; existing 82 tests green
- [x] A galleries sampler (fixture galleries over the existing fixture
      pieces' images, plus gallery-folder placeholders and sidecars)
      exists for the visual review; all fixtures join spec 005's
      unpublish list
- [x] A `Galleries` nav entry exists; category browsing is one route
      family, `/categories/<category>/` (galleries then pieces), linked
      from category labels and never placed in the nav — chosen at plan
      review, and not a per-genre section

## Resolved decisions

- **Every image gets a page** (photographer, spec review) — the image
  page is the site's motivating feature; 004 lays its foundation and
  the rich version is a separate spec.
- **Named galleries with a category**, not one-per-category — allows
  per-event galleries and themed sets at the same cost.
- **EXIF with frontmatter override** — automation by default, human
  correction always possible.
- **Latest-work as data + component**, unplaced — the homepage waits
  for its design pass.

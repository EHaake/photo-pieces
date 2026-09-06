# Spec: Places

**Status**: Approved (2026-09-06) — written in the design conversation;
approved by the product owner with the three open decisions decided as
drafted
**Depends on**: 004 (the image registry: every accepted raster in a
piece folder has a stable id and a page), 006 (the image page's sets
and arrows, the wall label's place and time), 008 (a piece's frames
are known in the piece's order; the registry knows every piece that
places a photograph).

## Summary

The photographer returns to a few places over years — not as
projects, just as places worth going back to. Today the site has no
way to say so. A gallery is a hand-ordered list that has to be edited
every time an outing is published; a piece is one outing, written
once. Neither can hold ten years of one cove.

A place is the hybrid: declared once, as its own page with its own
writing, and then grown by the photographs that name it. A photograph
says where it was made with one line in its sidecar, `at: <slug>`; a
piece whose photographs were all made in one place may say so once,
as a default for the frames that say nothing. The place's page gathers
every published photograph at it, grouped by the piece it lives in,
oldest outing first, without anyone editing a list. The name is a slug
that must already exist, so a second spelling cannot arise by
accident. Nothing is recognised from the camera's metadata — the site
never reads GPS — and nothing is guessed: a place is a name the
photographer gives.

## Goals

1. **Declared once.** A place is a file: a title, a short
   description, optionally a cover, and a body that is the
   photographer's writing about the place. It has a page at
   `/places/<slug>/` and a card on `/places/`.
2. **Named per photograph.** The frame is the unit. A frame's sidecar
   names its place with one line, `at: <slug>`. The slug must name a
   declared place; the build refuses an unknown one and lists the
   places that exist.
3. **A piece may set a default.** A piece whose frames were made in
   one place says `at: <slug>` once in its frontmatter, and every
   frame in its folder that names no place of its own is taken to be
   there. A frame's own `at:` always wins; `at: none` keeps a frame out
   of its piece's default. A piece that sets no default imposes none:
   its frames are wherever their own lines say.
4. **Grown automatically.** A place's page lists every published frame
   at it, grouped by the piece the frame lives in — its outing — with
   outings oldest first, each a group headed by the piece's title and
   date, the frames in the piece's order. Publishing a piece whose
   frames name the place is the whole act of adding them. A borrowed
   frame belongs to its home piece, not the borrower's, and is never
   counted twice.
5. **The photograph knows its place.** The image page's wall label
   shows the place's title as a link where it shows place today; the
   arrows can step through the place's frames in the place's order,
   following the reader as they do for a piece or a gallery.
6. **Drafts and empty places stay unpublished.** A draft piece's frames
   do not appear; a place with no published frame has no page and no
   card, and the build says so as a note, not a failure — a place may
   be declared ahead of its first outing.
7. **Galleries and pieces are unchanged.** A gallery may still list any
   frame, in a place or not; a piece reads exactly as it did. A place
   adds a view; it moves nothing.

## Non-goals

- **Recognition from camera metadata.** No GPS, ever (the
  constitution); no matching on the wall label's free-text place, on
  dates, or on file names. A place is a name the photographer gives.
- **A map, coordinates, or regions.** A place has no location on the
  site, only a name and words.
- **Nested places** (a beach inside a coast) and **more than one place
  per frame**.
- **Gallery-root photographs in a place.** A frame declares its place
  wherever it lives, but a place page groups frames by the piece they
  live in, and a gallery-root frame has none; it stays as it is. If
  the need appears, a group for frames without a piece is the obvious
  extension.
- **Curation inside a place.** The order is the outings' order and the
  pieces' order. A hand-picked selection from a place is a gallery,
  which already exists.
- **Renaming a place** beyond what renaming any file does: the slug is
  the URL, and every sidecar and piece naming it must be updated, which
  the build points out.

## Entities

- **A place**: a file `src/content/places/<slug>.md` with `title`,
  optional `description`, optional `cover` (the id of one of the
  place's frames), optional `draft`, and a body — the writing.
- **A frame's place**: its sidecar's `at: <slug>`; failing that, its
  piece's `at: <slug>`; failing that, none. `at: none` is the
  explicit "none" under a piece default.
- **An outing at a place**: a published piece one or more of whose own
  folder's frames are at the place. Its frames at the place are those
  frames, in the piece's order — never a frame borrowed from another
  piece's folder.
- **The place's frames**: every outing's frames, outings oldest first
  by publish date, frames in the piece's order within each outing.

## Key user flows

- **Declaring a place.** In Obsidian the photographer creates
  `places/sombrio.md`, writes a title and a paragraph about why they
  keep going back. Nothing appears on the site until a frame names
  it; the build notes the empty place.
- **An outing in one place.** Writing a piece shot entirely at Sombrio,
  the photographer adds `at: sombrio` to its frontmatter and no
  sidecar needs a line. Obsidian offers the values already used for
  `at` across the vault. The build refuses `at: sombrio-beach`
  with "no place named sombrio-beach — the places are: sombrio, …".
  On publish, the place's page and card exist and show the outing.
- **A piece that ranges.** A piece with frames from three places sets
  no default. The photographer writes `at: sombrio` in the sidecars
  of the frames made there, and the others stay out of Places or name
  their own place. Each named frame appears on its place's page under
  the piece's heading.
- **A frame that was elsewhere.** One frame in a piece with a default
  was shot on the drive home; its sidecar says `at: none` and it is
  left out of the place. One frame in that piece was at Mystic Beach
  instead; its sidecar says `at: mystic-beach` and it appears there
  under its own piece's heading.
- **Ten years later.** Each new piece with frames at the place appears
  on its page in its year, under its own title and date; the writing
  at the top is untouched unless the photographer edits it.
- **Reading a place.** The reader arrives at `/places/sombrio/`, reads
  the writing, and scrolls the outings from the oldest. Each heading
  links to the piece; each frame links to its page. Arriving at a
  frame from the place, the arrows step through the place's frames in
  the place's order; the page's "At" line names the place.
- **The places index.** `/places/` lists every published place as a
  card — the cover, the title, how many outings and frames, the years
  spanned — the way `/galleries/` lists galleries.

## Design requirements

- **The place page**: the title, the description, the writing, then
  the outings. Each outing is a heading (the piece's title, a link)
  with its date, then its frames laid out as a gallery is laid out
  today (rows packed to equal short sides), every frame a link to its
  page. Oldest outing first.
- **The places index**: cards as the galleries index has them, one per
  published place, in the order of most recent outing first. The
  card's count reads "N outings · M frames · 2019–2026".
- **The nav** gains Places beside Galleries.
- **The wall label's place line** shows the place's title as a link to
  the place page; the sidecar's free-text `place` (the finer detail,
  "west end") follows it when present. A frame in no place shows the
  free text alone, as today.
- **The place's set** on the image page: a set per place, keyed like
  the piece and gallery sets, so the arrows follow the reader from a
  place page; "N of M" counts the place's frames.
- **The cover** on the card and as the page's Open Graph image: the
  declared cover, else the first frame of the most recent outing.
- **Draft and empty places** build nothing and appear nowhere; the
  build prints a note naming them.

## Authoring requirements

- `AUTHORING.md` explains declaring a place, naming it on a frame, the
  piece default and `at: none`, what the page shows, and that a place
  grows on its own; the sidecar template gains the optional `at:` line
  and the piece template the optional `at:` line.
- `README.md`'s content model mentions places.
- The Obsidian plugin needs no change (both lines are frontmatter,
  which Obsidian's property autocomplete already handles).

## Acceptance criteria

- [ ] A place file with a title and a body, named by frames in two
      published pieces, builds `/places/<slug>/` with the writing and
      the two outings oldest first, each heading linking to the piece
      and each frame linking to its page; the frames are the named
      ones from the pieces' own folders, in the pieces' order
- [ ] A sidecar `at:` or a piece `at:` naming a slug with no place
      file fails the build with a message naming the slug and listing
      the declared places
- [ ] Under a piece default, a frame with no `at:` is at the piece's
      place; `at: none` removes it; `at: <other>` puts it at the other
      place under its own piece's heading; in a piece with no default,
      only frames with their own `at:` appear anywhere; a borrowed
      frame in a piece's body is never counted under the borrower
- [ ] A draft piece's frames are absent from the place; a place with
      no published frame, or with `draft: true`, has no page and no
      card, and the build prints a note naming it
- [ ] `/places/` lists every published place as a card with cover,
      title, outing and frame counts, and the years; the nav shows
      Places
- [ ] The image page of a frame in a place shows the place's title as
      a link where the wall label shows place, followed by the sidecar's
      free text when present; arriving from the place page the arrows
      step through the place's frames in the place's order
- [ ] The fixtures show it: one declared place, one fixture piece
      naming it as a default with an `at: none` frame and an
      `at: <other>` frame, and one fixture piece with no default and
      a single `at:` frame; the pages read as this spec says
- [ ] The whole test suite green; the build with its barriers green;
      docs updated

## Decided

- **The frame is the unit; the piece default is a shortcut**
  (2026-09-06, product owner). The first draft had the piece declare
  the place and the frames declare exceptions. The photographer
  expects pieces whose frames were made in several places, or in no
  place worth declaring, to be common, so the declaration belongs on
  the photograph. The piece-level line stays only as an optional
  default, because the outing shot entirely at one place — the case
  Places exists for — would otherwise need one sidecar per frame all
  saying the same thing.
- **The field is `at`, on the sidecar and on the piece alike**
  (2026-09-06, left to the orchestrator; the piece's line was drafted
  as `place:` and renamed at the plan's sign-off). It reads as the
  label does — "at Sombrio" — pairs with `at: none`, and cannot be
  mistaken for the free-text `place` beside it. One name on both files
  means Obsidian's property autocomplete, which is keyed by property
  name across the vault, offers slugs for `at` everywhere and prose for
  `place` everywhere, instead of mixing the two under `place`. `in` and
  `placeSlug` were the alternatives.
- **Outings oldest first** on a place page (2026-09-06, product
  owner), so the years read as years; the site's other lists stay
  newest first.
- **Places in the nav** beside Galleries (2026-09-06, product owner),
  rather than a section on the galleries index.

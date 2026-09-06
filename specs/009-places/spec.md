# Spec: Places

**Status**: Draft (2026-09-06) — written in the design conversation;
awaiting the product owner's approval
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
writing, and then grown by the outings that name it. A piece says
which place it was at with one line of frontmatter, and the place's
page gathers every published outing there, oldest first, each with
its frames, without anyone editing a list. The name is a slug that
must already exist, so a second spelling cannot arise by accident.
Nothing is recognised from the camera's metadata — the site never
reads GPS — and nothing is guessed: a place is a name the
photographer gives.

## Goals

1. **Declared once.** A place is a file: a title, a short
   description, optionally a cover, and a body that is the
   photographer's writing about the place. It has a page at
   `/places/<slug>/` and a card on `/places/`.
2. **Named per outing.** A piece names its place with one frontmatter
   line, `place: <slug>`. The slug must name a declared place; the
   build refuses an unknown one and lists the places that exist.
3. **Grown automatically.** A place's page lists every published piece
   that names it, oldest first, each outing a group headed by the
   piece's title and date and made of the frames from that outing —
   the photographs in the piece's own folder, in the piece's order.
   Publishing a new outing that names the place is the whole act of
   adding it.
4. **The exceptions are per frame.** A frame from an outing that was
   not at the place, or a frame that belongs to a different place than
   its piece, says so in its sidecar and is grouped accordingly. A
   borrowed frame in an outing's body belongs to its home outing, not
   the borrower's, and is never counted twice.
5. **The photograph knows its place.** The image page's wall label
   shows the place's title as a link where it shows place today; the
   arrows can step through the place's frames in the place's order,
   following the reader as they do for a piece or a gallery.
6. **Drafts and empty places stay unpublished.** A draft piece's frames
   do not appear; a place with no published outing has no page and no
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
- **Gallery-root photographs in a place.** They have no outing to
  group under; they stay as they are.
- **Curation inside a place.** The order is the outings' order and the
  pieces' order. A hand-picked selection from a place is a gallery,
  which already exists.
- **Renaming a place** beyond what renaming any file does: the slug is
  the URL, and every piece naming it must be updated, which the build
  points out.

## Entities

- **A place**: a file `src/content/places/<slug>.md` with `title`,
  optional `description`, optional `cover` (the id of one of the
  place's frames), optional `draft`, and a body — the writing.
- **An outing at a place**: a published piece whose frontmatter names
  the place. Its frames at the place are the photographs in its own
  folder, less any frame whose sidecar says otherwise, plus any frame
  from another outing whose sidecar names this place.
- **The place's frames**: every outing's frames, outings oldest first
  by publish date, frames in the piece's order within each outing.

## Key user flows

- **Declaring a place.** In Obsidian the photographer creates
  `places/sombrio.md`, writes a title and a paragraph about why they
  keep going back. Nothing appears on the site until an outing names
  it; the build notes the empty place.
- **Naming the place on an outing.** Writing a piece, the photographer
  adds `place: sombrio` to its frontmatter. Obsidian offers the values
  already used for `place` across the vault. The build refuses
  `place: sombrio-beach` with "no place named sombrio-beach — the
  places are: sombrio, …". On publish, the place's page and card exist
  and show the outing.
- **Ten years later.** Each new outing that names the place appears on
  its page in its year, under its own title and date; the writing at
  the top is untouched unless the photographer edits it.
- **Reading a place.** The reader arrives at `/places/sombrio/`, reads
  the writing, and scrolls the outings from the oldest. Each heading
  links to the piece; each frame links to its page. Arriving at a
  frame from the place, the arrows step through the place's frames in
  the place's order; the page's "At" line names the place.
- **A frame that was elsewhere.** One frame in an outing was shot on
  the drive home; its sidecar says `at: none` and it is left out of
  the place. One frame in a different outing was at Sombrio after all;
  its sidecar says `at: sombrio` and it appears under its own outing's
  heading on Sombrio's page.
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

- `AUTHORING.md` explains declaring a place, naming it on a piece, the
  two sidecar exceptions, what the page shows, and that a place grows
  on its own; the piece template gains the optional `place:` line.
- `README.md`'s content model mentions places.
- The Obsidian plugin needs no change (the place is frontmatter, which
  Obsidian's property autocomplete already handles).

## Acceptance criteria

- [ ] A place file with a title and a body, named by two published
      pieces, builds `/places/<slug>/` with the writing and the two
      outings oldest first, each heading linking to the piece and each
      frame linking to its page; the frames are the pieces' own
      folders' photographs in the pieces' order
- [ ] A piece naming a slug with no place file fails the build with a
      message naming the slug and listing the declared places
- [ ] A sidecar `at: none` removes that frame from its piece's outing;
      a sidecar `at: <other>` moves it to that place under its own
      outing's heading; a borrowed frame in an outing's body is not
      counted under the borrower
- [ ] A draft piece's frames are absent from the place; a place with
      no published outing, or with `draft: true`, has no page and no
      card, and the build prints a note naming it
- [ ] `/places/` lists every published place as a card with cover,
      title, outing and frame counts, and the years; the nav shows
      Places
- [ ] The image page of a frame in a place shows the place's title as
      a link where the wall label shows place, followed by the sidecar's
      free text when present; arriving from the place page the arrows
      step through the place's frames in the place's order
- [ ] The fixtures show it: one declared place named by two fixture
      pieces, one sidecar exception of each kind, and the pages read as
      this spec says
- [ ] The whole test suite green; the build with its barriers green;
      docs updated

## Open decisions (for the product owner)

1. **The exception field's name.** The sidecar already has a free-text
   `place` for the wall label, so the exception cannot reuse it. The
   draft says `at:` — `at: none` and `at: <slug>`. Alternatives: `in:`,
   or `placeSlug:`.
2. **Oldest first.** The draft orders a place's outings oldest first so
   the years read as years; the site's other lists are newest first.
3. **Places in the nav.** The draft adds Places beside Galleries. The
   alternative is a section on the galleries index, no nav change.
4. **One place per piece.** The draft allows one `place:` per piece
   with per-frame exceptions. The alternative is a list, which the
   exceptions then have to disambiguate.

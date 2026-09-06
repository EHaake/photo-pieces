# Spec: Cross-piece image references

**Status**: Implemented (2026-09-05) — approved by the product owner
2026-09-05 on the spec-conformance summary, attested in the browser at
the Phase 0 and Phase 1 gates the same day; every acceptance criterion
below has its record in tasks.md
**Depends on**: 004 (the image registry: every accepted raster in a
piece folder or the gallery root has a stable id and a page), 006 (the
image page's sets, passage, and related frames), 007 (every placed
image links to its page, whatever the block).

## Summary

Today a photograph belongs to the folder it sits in, and a piece may
place only the photographs in its own folder — a `src` that points
anywhere else fails the build. That was the right first rule: it is
what gives every image one id and one page. It stops being right the
day a piece looks back: a retrospective wants to place a frame from
an earlier outing, and today that means a copy, a second id, and a
second page for the same photograph.

This spec loosens the rule without giving up what it protects. A
piece may place a photograph that lives in another piece's folder or
at the gallery root, written as the path Obsidian already
understands. The photograph keeps its one home — its id, its page,
its passage, its related frames — and its page gains a line naming
every other piece that places it. The arrows on the image page follow
the piece the reader came from, borrowed frames included. A piece's
cover may be borrowed the same way.

Alongside, one small thing the photographer noticed: on the pieces
index only the title is clickable, while a gallery's whole card is.
The pieces row becomes one link, as the gallery card is.

## Goals

1. **Written where Obsidian works.** A borrowed image is a `src` path
   out of the piece's folder — `../<other-piece>/<file>` for another
   piece's photograph, `../../gallery-images/<file>` for a gallery-root
   one — in every place an image is written: every block, the pair and
   triptych slots, `grid` and `strip` bodies, `held`, `pause`, and the
   plain `![alt](…)` shorthand. Obsidian previews it as it previews
   any image, because the path is real.
2. **One home.** The photograph's id, page, "From the piece", quoted
   passage, related frames, and categories are its home folder's, as
   they are today. Nothing moves, nothing is duplicated.
3. **The page says where else it appears.** Below "From the piece" (or
   in its place, for a gallery-root photograph) the image page lists
   every other published piece that places the photograph, each a link
   to the piece, in the order the pieces were published, newest first.
4. **The arrows follow the reader.** Arriving at a borrowed photograph
   from the piece that borrows it, the reader steps through that
   piece's frames in the order the piece shows them, the borrowed one
   in its place. Arriving from the home piece or a gallery, as today.
5. **Drafts stay safe.** A published piece may not place a photograph
   from a draft piece — that photograph has no page yet — and the build
   says so, naming both pieces. A draft piece may place anything.
6. **Covers too.** A piece's `cover` may be a borrowed photograph by the
   same path, with the same rules.
7. **The pieces row is one link.** On the pieces index and the homepage
   feed, the photograph, the date line, the title, and the description
   all take the reader to the piece, as the gallery card does.

## Non-goals

- **Moving or re-homing a photograph.** A photograph's home is its
  folder; a reference does not change it. Moving a file is moving a
  file (its id and URL change, as today).
- **Referencing a private camera's frame** (`_<basename>`), which has
  no page — it fails as it does today.
- **A borrowed photograph on the page's own terms.** The image page
  does not quote the borrowing piece's passage, show its related
  frames, or take its categories. One page, one home.
- **Galleries.** They already reference photographs by id and are
  unchanged.
- **Link rewriting between pieces** (the roadmap's separate item) and
  the series entity.
- **A story (sidecar body) placing a borrowed photograph.** A story is
  prose; the rule is unchanged.

## Entities

- **A reference**: an image `src` whose path leaves the piece's folder
  — exactly one level up into a sibling piece's folder, or two levels
  up into `gallery-images/`. Any other shape (a sub-folder, a path
  further out, an absolute path into the vault) fails the build with
  the two allowed shapes in the message.
- **The home**: the piece whose folder the photograph is in, or the
  gallery root. Unchanged.
- **An appearance**: a published piece that places the photograph in
  its body (or as its cover) and is not its home. The photograph's
  page lists its appearances.

## Key user flows

- **Writing a retrospective.** In Obsidian the photographer writes
  `::single{src="../where-the-fog-lets-go/land-b.jpg" alt="…"}` — or
  `![…](../where-the-fog-lets-go/land-b.jpg)` — and sees the
  photograph in Live Preview. The site builds; the piece shows it
  linked to its page like any frame.
- **Reading the retrospective.** The reader clicks the borrowed frame
  and lands on its page: "From the piece" names the fog piece, the
  passage is the fog piece's, and an "Also in" line names the
  retrospective. The arrows step through the retrospective's frames.
- **Reading the fog piece.** Its page for the same photograph is the
  same page; the "Also in" line now names the retrospective.
- **A gallery-root photograph in a piece.** The page has no "From the
  piece"; it has the "Also in" line with the piece. Its related frames
  stay absent (no outing).
- **The pieces index.** The reader clicks the photograph or the
  description and arrives at the piece.

## Design requirements

- **The "Also in" line** sits under "From the piece" in the label's
  head, in the label's voice: "Also in" followed by the pieces' titles
  as links, separated as the site separates such lists. When there are
  none, nothing renders. Its wording lives with the page's other
  wording.
- **Sets.** The piece set for a piece contains every photograph the
  piece places, in the piece's order, borrowed frames included — so
  the arrows and the set-key mechanism of 006 need no new case, only a
  wider notion of "the piece's frames".
- **Related frames** stay the home's: the nearest frames of the home
  folder in the home piece's order.
- **The reference's link** goes to the photograph's home page, the
  same URL from every piece.
- **The pieces row** is one anchor: its whole area clickable, the title
  still the visible link text, the same URL, no change to the row's
  look at rest; hover and focus treat the row as the gallery card is
  treated.

## Authoring requirements

- `AUTHORING.md` explains the two path shapes, that the photograph
  keeps its home, what the page shows, and the draft rule; the block
  table's note on image paths in `README.md` is updated.
- The Obsidian plugin needs no change if the paths resolve in the
  vault as ordinary images do; if the vault's root makes `../../`
  unreachable, the plan says so and the rule adapts before anything is
  built.

## Acceptance criteria

- [x] A reference of either shape builds in every block and the
      shorthand, links to the home page, and gets the same `sizes` and
      mat as a local image would; the four wrong shapes (a sub-folder,
      three levels up, a path that resolves outside `pieces/` and
      `gallery-images/`, a private frame) fail naming the rule
- [x] The photograph's page is unchanged in its home's terms and gains
      the "Also in" line listing every published piece that places it
      other than its home, newest first, absent when there are none; a
      gallery-root photograph placed by a piece shows the line without
      "From the piece"
- [x] From the borrowing piece the arrows step through that piece's
      frames with the borrowed one in its place; from the home piece or
      a gallery, as before
- [x] A published piece placing a draft piece's photograph fails the
      build naming both pieces; a draft piece placing a published one
      builds
- [x] A piece's cover may be a reference of either shape, with the
      same draft rule; the piece's lists use it and the photograph's
      page counts the piece among its appearances
- [x] The fixtures show it: one published piece places a photograph
      from another piece and one from the gallery root, and the three
      image pages read as this spec says
- [x] On the pieces index and the homepage feed, the photograph, the
      date line, the title, and the description of each row all lead to
      the piece; the row looks as it did at rest
- [x] The whole test suite green; the build with its barriers green;
      docs updated

## Resolved decisions (product owner, 2026-09-05)

1. **A path, not an id.** The roadmap sketched `id="…"`; a relative
   path is what Obsidian previews and what the build can check on
   disk, and the site derives the id from it.
2. **One page, one home.** The image page stays the home's and lists
   its appearances; it does not quote a second passage.
3. **The arrows follow the reader**, borrowed frames in the borrowing
   piece's order.
4. **Drafts are protected** by the build, in both directions as above.
5. **Every place an image is written**, one rule.
6. **Covers may be borrowed.**
7. **The pieces row becomes one link**, matching the gallery card — a
   noticed inconsistency, fixed here rather than in a spec of its own.
8. **The image page's way-back links take the accent colour** (product
   owner, Phase 0 gate, 2026-09-05): "From the piece", "Also in", "In
   the gallery", "Read it in place", and the print link read as links
   before a mouse-over, for every photograph, borrowed or not.

# Spec: The Rich Image Detail Page

**Status**: Approved (photographer, spec review 2026-09-02) — plan.md
follows
**Depends on**: 004 (the image registry, the image page at its
baseline, sidecars, galleries). Feeds the future processing-showcase
spec and the shop spec (`ROADMAP.md`).

## Summary

The image page is the site's signature element and the photographer's
motivating feature: a page for every photograph, richer than any site
builder offers. Spec 004 built its foundation — a stable URL, an
image-first page, a wall label from EXIF with sidecar overrides, links
back to the piece and galleries. This spec grows that page into the
rich version, in the shape chosen from the mock-up reviewed on
2026-09-02 (the photographer kept everything shown):

- **The image's own writing** — the sidecar's body, until now
  deliberately reserved, rendered as the photograph's story.
- **Place and time** — where and when, in the photographer's words.
- **How it was made** — the capture record beyond exposure: format,
  filters, support, and a processing note.
- **Raw to finished** — a compare slider between the camera's frame
  and the finished photograph. The seed of the processing showcase; a
  page section, not a directive — the reserved `sequence` block stays
  reserved (corrected at plan review).
- **Context** — the piece paragraph the image sits in, previous and
  next within the set the reader is moving through, related frames.
- **The print** — edition, sizes, paper, and a way to ask.
- **Quiet view** — the chrome steps aside and the photograph takes the
  whole viewport, still a page.

Every one of these is additive and optional per image. An image with
nothing but its file renders exactly the 004 baseline; each section
appears only when its content exists. That fallback is the design, not
a degraded state: most images will carry a few of these, a handful will
carry all of them.

## Goals

1. **Writing per image.** The photographer can write about a single
   photograph in Obsidian, in the sidecar they already have, and the
   page presents it as the photograph's story in the site's reading
   voice — no new file type, no new tool.
2. **A complete record without ceremony.** Place, time, format,
   filters, support, and a processing note are optional sidecar fields
   that join the wall label when present; the label stays a label,
   ordered for reading, never a form with blanks.
3. **Processing made visible.** Where the photographer supplies the
   camera's frame alongside the finished photograph, the page shows the
   transformation as a compare slider the reader controls, with the
   processing note beside it. This is a section of the image page fed
   by the camera's frame, not a piece block: the reserved `sequence`
   directive stays reserved. The broader showcase — techniques,
   workflow, multi-step narratives, possibly its own kind of piece — is
   its own future spec and must not be foreclosed by this one.
4. **The photograph in context.** The page shows the passage of the
   piece the image belongs to, offers previous and next within the set
   the reader is moving through, lets keyboard users step with the
   arrow keys, and shows related frames from the same outing.
5. **A print enquiry path now, the shop later.** Edition, sizes, and
   paper appear when authored, with an "ask about a print" action that
   opens an email until the shop spec replaces it.
6. **Looking, undisturbed.** A quiet view hides all chrome and gives the
   frame the viewport, entered and left without leaving the page.
7. **Findable.** Image pages join the site search, so a title, a place,
   or a line of the story can be searched for.
8. **The baseline is untouched.** Images with no sidecar render as they
   do today; the URL, the stage, the label, and the piece and gallery
   links are unchanged, and the page stays static HTML with page-level
   enhancement only (constitution: `.md` content cannot mount islands;
   interactive blocks are progressive enhancement over the transform's
   HTML).

## Non-goals

- **The processing showcase** — technique narratives, workflow
  essays, multi-step sequences, or a new kind of piece devoted to
  processing. Roadmapped as its own spec; this spec ships the single
  raw-to-finished compare and the fields it needs, designed so the
  showcase can extend rather than replace them.
- **The shop** — pricing, payment, fulfilment. The print section is an
  enquiry, not a purchase; its fields are chosen so the shop can reuse
  them.
- **Overlays or lightboxes** — quiet view is a state of the page, not a
  modal over another page (design brief: pages, not overlays).
- **Coordinates of any kind** — place is authored prose. GPS is never
  read, stored, or emitted; the 004 barriers stand.
- **Comments, likes, view counts** — unchanged from the roadmap.
- **Multi-piece membership or a redirect map** — 004 follow-ups, not
  in scope.

## Entities

- **Image** (004) gains optional authored fields, all in the sidecar:
  a place; a time (free text — "06:40, forty minutes before sunrise",
  "late November"); format, filters, support, and a processing note; a
  print record (edition, sizes, paper); and a reference to the camera's
  frame for the compare. The sidecar body is the image's writing.
- **The camera's frame** — an image file the photographer supplies for
  the compare. It is not an image of the site: no page of its own,
  never in a gallery, never in latest work, never counted as a frame in
  its folder. How it is named and where it lives is a plan detail; the
  behaviour is that it exists only as the "before" of its photograph.
- **Set** — the ordered list the reader steps through with previous and
  next: a gallery, or a piece's frames in the order the piece shows
  them. Which set applies is decided by how the reader arrived where
  that can be known statically, else by a stated default (see Resolved
  decisions).
- **Related frames** — the nearest other frames of the same outing:
  up to six from the photograph's piece folder, in the piece's order.
  A gallery-root image has no outing and no related frames (amended at
  plan review — the flat gallery root would otherwise list every
  fixture it holds).

## Key user flows

### Reading a photograph in full

The reader arrives from a gallery or a piece. The photograph fills the
first viewport as today. Below the frame, a slim line names the set and
offers previous and next; the arrow keys do the same. Below that: the
category eyebrow and title, then — if written — the photograph's story,
directly under its title. Then the wall label with place and time at
its head and the exposure rows after, the caption, and the piece and
gallery links. Then, each only if written: the record of how it was
made; the raw-to-finished compare with its note; the passage of the
piece the image sits in, quoted, with a link to read it in place;
related frames; the print record with its enquiry link. A photograph
with no story reads title, label, and onward — the same page with one
section absent.

### Looking

From the frame the reader enters quiet view: header, label, and
everything below disappear and the photograph takes the viewport on the
same ground. Escape, or a click on the ground, returns to the page at
the top. Nothing about the URL or history changes.

### Stepping through a set

Previous and next follow the set. From a gallery, the set is that
gallery in its curated order; from a piece, the piece's frames in the
order they appear. At either end the missing direction is simply
absent. Related frames, unlike the set, always show the folder's other
frames.

### Writing about a photograph

In Obsidian, the photographer opens or creates the image's sidecar,
adds any of the new fields to its frontmatter, and writes the story in
its body as ordinary Markdown. To show the processing, they drop the
camera's frame beside the photograph under the documented name — the
site finds it, nothing to declare (amended at plan review: one
convention, no sidecar field to drift from it). The
dev server shows the page as it will publish; `git push` publishes it.
An image with no sidecar needs nothing and renders the baseline.

### Asking about a print

The reader chooses "Ask about a print" and their mail client opens
addressed to the photographer with the photograph's title in the
subject.

## Design requirements

- **One page, growing.** The 004 page is the floor. The story, when
  there is one, comes first — directly under the title, before the
  label (photographer: the story is primary, the settings secondary
  though still important). The rest joins below the label in a fixed
  reading order — how it was made, raw to finished, context, print —
  separated by the label's hairline rhythm, each with a short heading.
  The story has no heading of its own: the photograph's title, already
  above it, is its heading.
- **The label stays typographic** (brief): place and time are label
  rows, not a map, not a badge. Rows with sentence-length values (the
  processing note, the print record) stack in a single column rather
  than flowing beside short tokens.
- **The story reads like a piece**: the reading column, the prose
  voice, no muted colour — it is the photograph's text, not a caption.
- **The compare is the photograph's own size**, matted like every
  image; the divider is a hairline; the two sides are labelled in the
  small mono voice; drag and keyboard both work; with no script, both
  frames still show (before above after) with the note.
- **Context is quoted, not restated**: the piece passage keeps its
  words and its caption, marked as a quotation with the accent rule,
  and links to the piece.
- **Neighbours are quiet**: a mono line under the stage, titles
  truncated rather than wrapped, arrows as text. Nothing that competes
  with the frame.
- **Related frames pack to equal short sides** as galleries do, and
  wrap on narrow screens rather than shrinking a portrait to a sliver.
- **Quiet view is the same ground**, light, matted — the site controls
  how the work is seen (light-only decision, spec 002). No dimming, no
  overlay.
- **Sample values never ship**: every field renders only what the
  photographer wrote.

## Authoring requirements

- All new fields are optional frontmatter in the existing sidecar;
  the body is the story. Obsidian renders both as plain Markdown.
- Field names read as the photographer would say them (place, time,
  format, filters, support, processing, edition, sizes, paper), and
  `AUTHORING.md` gains a sidecar template showing every field with an
  example.
- The camera's frame follows one naming convention documented in
  `AUTHORING.md`; a frame whose photograph doesn't exist, a gallery
  that lists a frame, or a piece that references one fails the build
  naming the file, as gallery mistakes do.
- No new directive; the Obsidian plugin is unaffected.
- The mock-up (`src/pages/image-review/`) is deleted before this spec
  merges; its sample copy is never adopted as content.

## Acceptance criteria

- [ ] An image with no sidecar renders the 004 baseline in content:
      the same URL, stage, label rows in the same order, caption, and
      piece and gallery links, with no empty sections — plus the
      neighbour line and related frames where a set or outing gives
      them (restated at plan review from "byte-for-byte", which the
      page's new structure makes meaningless); every 004 test still
      passes
- [ ] Each new section renders when, and only when, its content
      exists; a sidecar with only a story shows only the story; the
      order of sections is fixed and matches this spec
- [ ] The story renders the sidecar body as Markdown in the site's
      reading style; the body is no longer ignored
- [ ] Place and time head the wall label when present; format,
      filters, support, and the processing note appear under "How it
      was made"; the print record and enquiry link appear under "The
      print"; the enquiry opens mail with the title in its subject
- [ ] The compare renders only when a camera's frame is present; the
      frame has no page, appears in no gallery or latest-work strip,
      and is not counted among related frames; a frame with no
      photograph fails the build naming the file; a frame of a
      different crop is letterboxed, not stretched; the slider works
      by pointer and keyboard with a visible focus, and both frames
      are visible and labelled without script
- [ ] Previous and next follow the gallery when the reader came from
      one and the piece's order when they came from a piece, with the
      documented default otherwise; arrow keys step; ends are absent,
      not disabled
- [ ] The piece passage is quoted with its caption and links to the
      piece; related frames pack to equal short sides and wrap below
      the 720px breakpoint
- [ ] Quiet view hides all chrome, keeps the ground, fits the frame to
      the viewport, and exits on Escape or a ground click without
      changing the URL; it is unavailable, not broken, without script
- [ ] Image pages are in the search index; a place or a story line is
      findable
- [ ] No GPS, no coordinates, no map anywhere: the 004 scan passes and
      the new fields are text
- [ ] Unit tests cover the sidecar-field merge, the camera's-frame
      exclusion, the set and neighbour derivation, and the passage
      extraction; build green
- [ ] `AUTHORING.md` documents every field with an example sidecar;
      `README.md` describes the rich page; the mock-up is deleted

## Resolved decisions

- **Keep everything in the mock-up** (photographer, 2026-09-02): all
  seven enhancements ship in this spec; per-image optionality is the
  mechanism that keeps most pages light.
- **The compare slider is the start of something larger.** The
  photographer's inspiration for the site includes presenting
  post-processing as a semi-interactive, semi-educative showcase — how
  workflow and technique transform an image, more than tool-specific
  steps. This spec ships the single before/after on the image page and
  the roadmap carries the showcase as its own spec, which may live on
  the image page, as its own kind of piece, or both.
- **Place is prose, never a coordinate.** Consistent with the 004 GPS
  barriers; the photographer decides how specific each place is.
- **The camera's frame is not an image of the site.** It exists to
  show the transformation, nothing else.
- **Default set when arrival is unknown**: the newest gallery that
  holds the image, else the piece's order. (Static pages cannot know
  the referrer at build; the plan decides whether a lightweight
  page-level enhancement can honour the actual route in.) Accepted by
  the photographer at spec review.
- **Story first** (photographer, spec review, over the recommendation
  of label first): when a photograph has a story it sits directly
  under the title, ahead of the label — the story is primary, the
  settings secondary though still important. A photograph without a
  story is the same page minus that section.
- **No heading on the story** (photographer): the title already above
  it is its heading.
- **The mock-up's wording stands** for the print section ("The print";
  Edition, Sizes, Paper; "Ask about a print") — the photographer will
  retune to taste later, so the words live in one obvious place.
- **The camera's frame's naming and location** are delegated to the
  plan (photographer: "I'll let you decide how it should work for the
  raw file").

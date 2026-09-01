# Spec: Site Foundation

**Status**: Draft — pending review
**Depends on**: Nothing — this is the project's first spec.

## Summary

A personal photography website presenting multi-genre work
(landscape/nature, street, portrait, event) through "pieces" —
blog-style entries that pair writing with images — as the primary way
visitors engage with the work, with hand-curated, category-organized
galleries as a secondary view. This first spec covers the core content
model, the essential reader-facing pages, and the base authoring flow
together, since they're too interdependent to split into separate specs
yet.

## Goals

1. Let the photographer author a piece — a blog-style entry combining
   prose and a defined set of image treatments (single image, diptych,
   triptych, full-bleed) — as plain Markdown in Obsidian, with a live
   preview available before publishing.
2. Make pieces the primary entry point to the site's content, with
   galleries positioned as secondary.
3. Let the photographer curate galleries by category, hand-selecting
   which images appear rather than surfacing every image automatically.
4. Let a gallery image that originated from a piece link back to that
   piece.
5. Present a homepage that combines the latest pieces with a "latest
   work" image gallery as the primary landing experience.
6. Present an About page introducing the photographer.
7. Present a Contact page so a visitor — including someone arriving from
   elsewhere, like Instagram — can reach the photographer.
8. Organize both pieces and galleries by category/genre (landscape/
   nature, street, portraits, events), without requiring separate site
   sections per genre.
9. Run as a fully static site with no server or database required.

## Non-goals (explicitly deferred)

- **Shop / print sales.** Wanted eventually — every showcased image
  purchasable — but it's a substantial feature (payments, fulfillment,
  licensing) that deserves its own spec once the core site exists.
  Tracked in `ROADMAP.md`.
- **Comments.** Not wanted for v1. Revisit if reader engagement suggests
  it'd add real value.
- **User accounts.** No identified need without comments or a shop;
  revisit alongside either.
- **Site search.** Deferred; revisit once the volume of pieces/images
  makes category browsing alone insufficient.
- **Newsletter / subscription.** Deferred; revisit if a push channel
  independent of Instagram becomes worth having.
- **A CMS.** Not planned for v1 — the Obsidian + live-preview authoring
  flow covers the need. Revisit only if authoring away from the
  project's repo becomes a real requirement.
- **Final presentation of the "sequence" block** (the image-processing/
  editing narrative treatment). The data shape — an ordered list of
  image + label pairs — is reserved in the content model, but whether it
  renders as a carousel, a stepper, or a before/after slider is deferred
  to a dedicated design-exploration pass once real processing-themed
  pieces exist to test against.

## Entities

- **Piece** — a blog-style entry. Can be about anything the photographer
  chooses to write — a photo essay about a specific outing, gear notes,
  an announcement — not necessarily image-heavy. Has a title, a publish
  date, one or more categories, a body combining prose with image
  blocks, and typically a cover image.
- **Block** — an image treatment embedded in a piece's body: single
  image, diptych, triptych, or full-bleed. A `sequence` block type is
  reserved for later (see Non-goals).
- **Gallery** — a named, hand-curated collection of images organized by
  category. Not auto-generated from all site images. Each image may
  optionally reference the piece it originated from.
- **Category** — the shared organizing structure across pieces and
  galleries: landscape/nature, street, portraits, events, extensible to
  more over time.
- **About page** — static content introducing the photographer.
- **Contact page** — a way for a visitor to reach the photographer
  (exact mechanism — form vs. direct contact details — is implementation
  detail for `plan.md`).

## Key user flows

### Authoring a piece

The photographer writes in Obsidian, with the vault pointed at the
site's content folder. An `astro dev` server runs alongside for live
preview — saving in Obsidian reloads the browser. When satisfied, the
photographer commits and pushes, which triggers an automatic build and
deploy.

### Arriving at the site

A visitor — often from elsewhere, like Instagram — lands on the
homepage, which combines the latest pieces with a "latest work" gallery.
The detailed layout and behavior of this landing experience is
intentionally not fully specified yet; it needs its own
design-exploration pass before `plan.md` is written.

### Reading a piece

A visitor reads a blog-style entry combining prose and image blocks in
the sequence the photographer authored them.

### Browsing a gallery

A visitor browses a category-organized, hand-curated gallery. Selecting
an image that originated from a piece navigates to that piece. What
happens for a gallery image with no originating piece — presumably a
larger/detail view of the image itself — is left open for the design
pass as well.

### Making contact

A visitor reaches the Contact page and has a way to get in touch with
the photographer.

## Design requirements

- Images should read as the site's interface, not compete with
  decorative chrome — established as a governing principle, not yet
  translated into specific component-level rules.
- The block vocabulary is closed: only the defined treatments (single
  image, diptych, triptych, full-bleed) are available inside a piece; no
  ad hoc layouts.
- Galleries are editorial, not automatic — every image in a gallery was
  deliberately placed there by the photographer.
- No light/dark mode toggle. The site presents one photographer-curated
  appearance to every visitor — the same way an exhibition controls its
  own lighting rather than letting each viewer adjust it.
- **Not yet resolved, deferred to the design-exploration phase**: empty
  states, loading states, and what the single most-frequent visitor
  action should be optimized for. No placeholder answers are given here
  deliberately, rather than guessing.

## Acceptance criteria

- [ ] A piece written in Obsidian (plain Markdown + directive syntax)
      renders correctly in local live preview before being published
- [ ] A published piece is reachable at its own URL and displays its
      prose and image blocks in authored order
- [ ] The homepage displays both latest pieces and a "latest work"
      gallery
- [ ] A category-organized gallery page exists and displays only images
      the photographer explicitly curated into it
- [ ] A gallery image with an originating piece links to that piece; one
      without does not error
- [ ] The About page renders
- [ ] The Contact page renders and provides a working way to reach the
      photographer
- [ ] Pieces and galleries can each be filtered/organized by category
      without separate per-genre site sections
- [ ] The built site requires no server process or database to run

## Resolved decisions

- **Plain Markdown + remark directives, not MDX** — chosen specifically
  to keep piece files fully compatible with Obsidian, which can't render
  JSX.
- **No CMS for v1** — the Obsidian + `astro dev` live-preview loop
  already satisfies "see the final output while writing," without
  introducing a database-backed content layer. Revisit only if remote
  authoring without the repo becomes a real need. See `DECISIONS.md`
  for the tooling comparison behind this.
- **Galleries stay in scope, but as secondary** — explicitly not
  eliminated. They're hand-curated, organized by category, and link back
  to originating pieces where one exists.
- **"Pieces" fully absorbs the "blog" concept** — a piece can be about
  anything (photo essay, gear notes, announcement), not exclusively
  image-heavy writing.
- **Shop deferred to `ROADMAP.md`**, not folded into this spec, given
  its scope (payments, fulfillment, licensing).
- **Homepage concept captured, detail deferred** — "latest pieces +
  latest-work gallery" is settled as the goal; exact layout and behavior
  needs a dedicated design pass before `plan.md`.
- **No dark/light toggle** — deliberately controlling presentation
  matters more here than the convenience of a toggle, since the same
  images read differently against light and dark backgrounds. Revisit
  only if this proves genuinely limiting in practice.

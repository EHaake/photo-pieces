# Spec: The page head

**Status**: Approved (2026-09-07) — written in the design conversation,
signed off by the product owner
**Depends on**: 004 (the category pages and the galleries index), 009
(the place page shares the head).

## Summary

Two things the photographer noticed once the site had enough pages
to move around in. A category is a quick filter on the pieces index —
Landscape, Street, Portrait, Event under the title — but once one is
chosen there is no visible way back to everything; the category page's
head is only the eyebrow and the name. And on a laptop the head of a
piece takes nearly the whole screen: the site header, the title, the
lead, the date, the rule, and generous air above and below, so the
reading starts below the fold. The photographer likes that air and does
not want the head cramped; the question is proportion, not size.

This spec finishes the category row — a way back appears the moment a
category is chosen — and retunes the head's vertical air on the pages
that have a body under it, so that opening a piece on a laptop shows
the beginning of the reading. The title, the type, the body column, the
nav, and the index pages' heads stay as they are.

## Goals

1. **A way back from a category.** The category page's head carries
   the category row with the current category marked, not linked, and
   an "All" that returns to the pieces index. "All" appears only when a
   category is selected — on the pieces index, where nothing is
   selected, the row stays as it is. The galleries index gains the
   same row, without "All".
2. **Each kind has its own way back.** On a category page the two
   section headings, "Galleries" and "Pieces", are links to their own
   indexes, so a reader who filtered galleries returns to galleries.
3. **The reading starts on the first screen.** On the pages that have
   a body under the head — a piece, a gallery, a place — the head's
   vertical air comes down so that, on a laptop, the lead and the
   opening of the body are visible without scrolling. The title's size,
   the lead, the date line, and the accent rule stay; only the space
   changes.
4. **The heads that are the page stay.** The pieces, galleries, and
   places indexes, the category pages, About, and Contact keep the head
   they have. The image page's own head, under the photograph, is out
   of scope.
5. **Decided by looking.** The values are chosen at a visual gate on
   the photographer's two screens — a 16:10 laptop and a portrait
   monitor — from a sampler showing the same piece under the current
   head and two tighter ones, before any CSS is committed.

## Non-goals

- **The title's size, the lead's measure, the body column.** The
  reading typography pass owns those (`ROADMAP.md`).
- **The nav, the site header, the front door.**
- **The image page**, whose head sits under the photograph and has
  its own spec (006).
- **A category filter that remembers where you came from.** The site
  is static; "All" goes to one place, and the section headings cover
  the other kind.
- **Any change on the portrait monitor beyond what the laptop needs.**
  If the tighter head reads worse there, the values differ by
  viewport rather than compromise.

## Key user flows

- **Filtering and unfiltering.** On `/pieces/` the reader clicks
  Landscape. The category page's head reads "Category / Landscape"
  with the row beneath: "All · Landscape · Street · Portrait · Event",
  Landscape marked. Clicking All returns to `/pieces/`; clicking Street
  goes to that category. The "Galleries" heading on the page links to
  `/galleries/`, the "Pieces" heading to `/pieces/`.
- **The galleries index.** `/galleries/` shows the same row under its
  title, each category linking to its category page; no "All", since
  nothing is selected.
- **Opening a piece on the laptop.** The site header, the title, the
  lead, the date, the rule, and the first lines of prose are all on
  the first screen. Scrolling begins with the reading under way, not
  before it.
- **Opening a piece on the portrait monitor.** Nothing looks
  different from today, or the head is a little tighter and no worse.
- **The gate.** The photographer opens the sampler on both screens,
  sees the fog piece's head three ways side by side or stacked, and
  names the one to keep.

## Design requirements

- **The row** is the one the pieces index has today, extended: on a
  category page it starts with "All", the current category is marked
  in the row's own way (not a link, and visibly the current one), and
  it sits in the head under the title where the pieces index puts it.
  On the galleries index it is the pieces index's row exactly.
- **The section headings as links** keep their eyebrow style; the link
  is the heading text.
- **The head's air**: today the head on every page has the same
  padding above and below and the same gap before the body. On a
  piece, a gallery, and a place the values come down; on the other
  pages they do not. Measured at 1440×900 on the fog piece, the head
  runs from the site header's bottom at 74 to 560, and the first
  paragraph begins at 638 of 900; the criterion is that the lead and
  at least the first four lines of prose are visible, which the
  sampler's candidates must each meet or fall short of visibly, so the
  gate compares real options. At 1080×1920 the same head is a fifth of
  the screen and needs no change; at 375×812 the head is already
  compact and must not get tighter.
- **The sampler** is a fixture page under the dev server, never built
  into the site, showing one piece's head under the current values and
  two candidate sets, labelled, with the site's real type and rule.

## Authoring requirements

None: no frontmatter, no content, no template changes. `README.md`'s
description of the category pages and the galleries index mentions
the row.

## Acceptance criteria

- [ ] A category page's head carries the row with "All" first, the
      current category marked and not a link, the others linking to
      their category pages, and "All" linking to `/pieces/`; the
      pieces index's row is unchanged and has no "All"; the galleries
      index has the row without "All"
- [ ] On a category page the "Galleries" heading links to `/galleries/`
      and the "Pieces" heading to `/pieces/`
- [ ] At 1440×900 the fog piece's page shows the lead and at least the
      first four lines of prose without scrolling, measured; the
      gallery page and the place page use the same tightened head; the
      pieces, galleries, and places indexes, the category pages, About,
      and Contact measure the same as before
- [ ] At 1080×1920 and 375×812 the piece head measures no tighter than
      the photographer accepted at the gate (the portrait monitor
      unchanged unless the gate chose otherwise; the phone unchanged)
- [ ] The sampler existed for the gate and is gone from the built site
- [ ] The whole test suite green; the build with its barriers green;
      docs updated

## Decided

- **"All" only when a category is selected** (2026-09-06, product
  owner): the row on the pieces index stays as it is; "All" is the
  category page's, first in the row. Its destination, the pieces
  index, and the section headings as each kind's way back were left to
  the orchestrator.
- **Reading pages are the piece, the gallery, and the place; the
  criterion is the lead plus four lines of prose at 1440×900; the
  values are chosen at a visual gate from a three-way sampler**
  (2026-09-06, left to the orchestrator by the product owner).

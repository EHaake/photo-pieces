# Roadmap

Deliberately unordered and unscheduled — this is a backlog to revisit
once there's a working v1 site to actually use, not a plan with dates
attached.

- **Shop / print sales** — let visitors purchase prints of showcased
  images. Deferred out of `specs/001-site-foundation` because it's a
  substantial feature in its own right (payments, fulfillment,
  licensing) that deserves its own spec once the core site exists.
- **Comments** — not wanted for v1. Revisit if reader engagement makes
  the moderation overhead feel worth it.
- **User accounts** — no identified need without comments or a shop;
  would likely arrive alongside whichever of those gets built first.
- **Site search** — revisit once the number of pieces/images makes
  category browsing alone insufficient.
- **Newsletter / subscription** — revisit if there's a reason to want a
  push channel independent of Instagram.
- **A CMS** (e.g. Keystatic) — not planned; the Obsidian + live-preview
  workflow covers v1 authoring. Revisit only if authoring away from the
  project repo becomes a real need.
- **The "sequence" block's final interaction design** — the underlying
  data (an ordered list of image + label pairs, for image-processing/
  editing narratives) is reserved in the content model now. The actual
  presentation — carousel, step-through, before/after slider — needs a
  dedicated Claude Design exploration once real processing-themed pieces
  exist to test it against.
- **Internal piece-to-piece link rewriting** — links between pieces
  authored as vault-relative markdown links (which is what Obsidian's
  `[[` autocomplete inserts, and what feeds its graph/backlinks) need a
  small build-time remark transform to become published route URLs
  (`/pieces/<slug>/`). Same pipeline as the block directives. Needed
  the day the first cross-piece link gets written, not before.
- **Obsidian live rendering for photo blocks** — built, in a
  deliberately minimal form: a custom plugin in `obsidian-plugin/`
  renders `fullbleed` directives as images in Live Preview, the mode
  actually used while writing. The bar was set at seeing the photo
  instead of raw directive text, not matching the real site's styling —
  see `DECISIONS.md` for that scoping. What remains on the roadmap is
  the rest: Reading View is intentionally not handled, and
  `diptych`/`triptych` — which now do exist on the Astro side
  (transform, styling, and tests landed with spec 001) — still render
  as raw directive text in Obsidian until the plugin gains a regex and
  widget class per block, following the fullbleed pattern.
- **Contact form** — wanted (decided at spec 002 review), deferred to
  its own spec: form handling on a static site means either a form
  service (new dependency to justify) or host-provided handling, and
  the choice interacts with the hosting decision. Until then the
  Contact page carries direct email + Instagram.
- **Block vocabulary expansion** — treatments the photographer already
  anticipates beyond the built set (single, fullbleed, diptych,
  triptych): images floated left/right sharing a row with prose;
  image-beside-text rows without wrap; a centered breakout wider than
  the prose column but not full-bleed. To be specced from a concrete
  list gathered by *writing real pieces* and noting where the current
  vocabulary pinches — not speculatively. Two structural notes for
  that spec: prose-sharing blocks likely need the `:::container`
  directive form (currently rejected deliberately), and every new
  treatment carries an Obsidian-plugin live-preview cost alongside the
  transform + CSS pair.
- **Dark mode removal** — the site is deliberately light-only
  (`spec.md`, `design/brief.md`), but the forked theme's dark palette,
  toggle component, and `prefers-color-scheme` handling are still
  present and active: a dark-preference visitor currently sees pieces
  against a dark background, exactly what the brief rules out. Full
  removal is a cleanup pass touching `BaseLayout.astro` and
  `global.css`'s duplicated token blocks (which would also return the
  accent color to being a single-line change).

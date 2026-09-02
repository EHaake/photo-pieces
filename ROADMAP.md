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
- ~~**Site search**~~ — inherited working from the theme (Pagefind at
  `/search`, indexing piece bodies); never needed building. Revisit
  only if its scope should widen beyond pieces.
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
  rendered `fullbleed` directives as images in Live Preview, the mode
  actually used while writing. The bar was set at seeing the photo
  instead of raw directive text, not matching the real site's styling —
  see `DECISIONS.md` for that scoping. As of spec 003 the plugin
  renders the leaf form of every standalone block (single, fullbleed,
  wide, tall, inset, diptych, triptych). What remains: Reading View is
  intentionally not handled, and container forms stay raw text (see
  the vocabulary entry below).
- **Contact form** — wanted (decided at spec 002 review), deferred to
  its own spec: form handling on a static site means either a form
  service (new dependency to justify) or host-provided handling, and
  the choice interacts with the hosting decision. Until then the
  Contact page carries direct email + Instagram.
- ~~**Block vocabulary expansion**~~ — done in spec 003, which chose
  breadth over the demand-driven growth this entry originally
  prescribed (the photographer's call: better to have the vocabulary
  ready before writing than to interrupt writing to build it — see
  `DECISIONS.md`). What remains: Obsidian Live Preview for container
  forms (captions, grid, strip, aside, row), which needs a real parser
  rather than the plugin's line regex.
- ~~**Dark mode removal**~~ — done in spec 002 (T104/T105): palette,
  toggle, and `prefers-color-scheme` handling all removed; the accent
  is a single-line change again.

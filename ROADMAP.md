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
- **Obsidian live rendering for photo blocks** — a custom Obsidian
  plugin could render `fullbleed`/`diptych`/etc. directly in Obsidian
  instead of needing the `astro dev` browser tab. Real and buildable
  (`registerMarkdownPostProcessor` for Reading View, a separate
  CodeMirror 6 extension for Live Preview specifically — two rendering
  paths, not one), but a second implementation to keep from drifting
  out of sync with the real site's styling, forever. Not pursued yet:
  single images already render natively in Obsidian, so this only
  helps the occasional special blocks. Revisit once real pieces reveal
  how often that friction actually bites, rather than building it on
  spec.

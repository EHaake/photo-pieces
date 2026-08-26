# Decisions

Business, product, and process context that doesn't fit the structured
docs — naming rationale, tooling choices, comparisons between options
that were considered and passed on. Keeps `plan.md` from accumulating
things that aren't actually technical design, and keeps this reasoning
from being lost the moment a chat conversation ends.

## Base theme: astro-keel

Five Astro themes were compared against real reference images before
forking one as the site's foundation:

- **refined-x** — ruled out. Its standout feature, "Ask this site," is
  a chat interface wired to a live MCP server (NLWeb-compatible), not a
  static search index — that needs a running backend, which conflicts
  with the static-only, no-server rule in `CLAUDE.md`. Also visually
  busy with agent-infrastructure chrome (`llms.txt`, `openapi.json`,
  MCP-discovery links) irrelevant to a photography audience.
- **astro-tone** — not chosen as the fork base, but its architecture
  informed the project regardless: a single token file controlling all
  color/spacing/type theme-wide, and an explicit "two or three custom
  blocks per post is plenty" philosophy that's essentially the closed
  block vocabulary already committed to in `CLAUDE.md`.
- **astro-sienna** — not chosen (skews warm/editorial-tech rather than
  the neutral direction wanted), but its image pipeline — Zod-validated
  frontmatter, build-time resize/re-encode/content-hash, lazy-loaded
  body images, eager-loaded cover — is worth referencing when the real
  image pipeline gets built, independent of which theme's skin won.
- **template-journal** — not chosen as a fork base at all: it's a
  commercial template (linked to a paid marketplace), not an
  open-source repo. Still the best reference seen for how a piece
  should *feel* — large cover-led entries, generous whitespace,
  essay-first framing.
- **astro-keel** — chosen. Its own stated design philosophy ("readable
  first, decorative last") matches the target aesthetic almost
  word-for-word: a single accent color carried through thin structural
  rules, a steady baseline rhythm for long-form reading, distinct
  light/dark values both clearly designed. (Dark mode was later dropped
  entirely — see `spec.md` — but the light-mode system it left behind
  was the actual reason for picking this theme.)

## CMS: none adopted; Keystatic is the leading candidate if ever needed

`spec.md` records the actual decision — no CMS for v1, the Obsidian +
`astro dev` live-preview loop covers the need. This is the tooling
comparison behind that, kept for whenever it's revisited:

- **Keystatic** — cleanest Astro-specific integration seen, with a
  genuinely usable editor and support for custom component blocks
  matching the directive-based block vocabulary. Runs in local mode
  (filesystem) or GitHub mode (API-backed), no database. Sources
  disagreed on maturity — one flagged it as still experimental, another
  called it the best git-based CMS available for Astro today.
- **TinaCMS** — true in-context visual editing, a real differentiator
  over Keystatic. Worse fit for this stack specifically: visual editing
  needs React-hook instrumentation, and Astro support is explicitly
  experimental. Shines on Next.js, not here.
- **EmDash** — ruled out; a different category of tool than a
  comparison, really. It's database-backed (SQLite locally, Cloudflare
  D1 in production), which conflicts with the file-based, git-based
  content model chosen for this project — not a stylistic mismatch, an
  architectural one. Also still in beta (launched this year) — real
  maturity risk for a project meant to last decades. *(Relocated here
  from `spec.md`, where it was originally logged as a resolved
  decision — this is a tooling comparison, not a spec-level behavior
  decision.)*

## Repository naming: `photo-pieces`

Domain is `erikhaakephoto.com` (already the plan), so the repo name
never needed to carry brand weight — just needed to be descriptive
without undermining the project's own framing.

Considered and passed on:
- **"Photography Portfolio Site"** — too generic to mean anything, and
  not usable as-typed anyway (repo names are conventionally
  lowercase-with-hyphens).
- **"portfolio-pieces"** — closer, but re-introduces the exact word the
  whole project has been de-emphasizing. Pieces were never meant to be
  a flavor of portfolio-as-gallery — they're the alternative to
  gallery-first browsing, with galleries kept as secondary. Putting
  "portfolio" back in the name quietly re-centers that framing.

Landed on **`photo-pieces`** — keeps "pieces," the one word that's done
real conceptual work throughout every document, without reintroducing
the word the project deliberately moved away from.

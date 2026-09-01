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
  should _feel_ — large cover-led entries, generous whitespace,
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
  maturity risk for a project meant to last decades. _(Relocated here
  from `spec.md`, where it was originally logged as a resolved
  decision — this is a tooling comparison, not a spec-level behavior
  decision.)_

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

## Obsidian live-preview plugin: fullbleed only, approximation accepted

Built rather than deferred, once the actual bar was clarified: not
matching the real site's styling, just seeing an image instead of raw
directive text while writing in Live Preview. That's a much smaller
target than a Reading-View-and-Live-Preview, style-matched renderer —
a single CodeMirror 6 `StateField` supplying the decorations (it began
as a `ViewPlugin`, but CodeMirror requires block decorations to come
from a `StateField` — the cause of the 0.1.0 editor crash), using a
plain regex rather than a full remark-directive parser, since it only
needs to recognize the one
block type actually built on the Astro side so far (`fullbleed`).
Reading View is intentionally not handled — Live Preview is the mode
actually used while writing, which is the specific problem this
solves.

Source lives in `obsidian-plugin/` in this repo. Extending it to
`diptych`/`triptych` once those exist on the Astro side follows the
same pattern: a regex and a widget class per block type.

## Markdown processor: legacy remark pipeline kept over Sätteri

Astro 7's default Markdown processor is Sätteri, which implements
directives natively but does not run remark/rehype plugins at all.
This project's `astro.config.mjs` opts into the legacy unified
pipeline (`markdown.processor: unified({...})`) — a deliberate
commitment, recorded here after the T004 review flagged it as
undocumented: the block vocabulary is built on `remark-directive`
plus a custom remark transform, and the transform's whole mechanism
(emitting mdast image nodes for Astro's collector to optimize)
depends on the remark plugin hooks Sätteri removes. Revisit only if
the unified path is ever deprecated outright; the ROADMAP item about
rewriting internal vault links at build time is the natural moment to
re-evaluate, since Sätteri handles wikilinks natively.

## Hosting: Cloudflare Workers static assets

Chosen at spec 002 review against GitHub Pages and Netlify, on the
photographer's criteria (stability, low ongoing hassle, free/cheap,
push-to-deploy testing before anything is publicly live):

- **Netlify** — ruled out: accounts created after Sept 2025 sit on a
  300-credit/month pool shared across bandwidth, builds, and compute;
  the most restrictive free tier of the three for an image-heavy site,
  with expensive overages. Its built-in form handling (relevant to the
  roadmapped contact form) has good free alternatives.
- **GitHub Pages** — closest second: zero new accounts, the deploy
  workflow already ships in the repo, and unmatched platform
  stability. Passed on because a photography site is the genre most
  likely to meet its soft ~1GB site / ~100GB-month limits, it has no
  per-branch preview URLs, and its project-page base path makes test
  and live URL structures differ.
- **Cloudflare Workers (static assets)** — chosen: unlimited free
  static-asset bandwidth (the criterion that compounds as a photo site
  grows), git-connected deploys with per-branch preview URLs, a free
  workers.dev subdomain for the whole pre-live phase, and identical
  URL structure between test and live. Known trade-off, accepted:
  Cloudflare's recommended path churned once recently (Pages →
  Workers), so this is guidance-stable, not GitHub-Pages-stable.
  Workers static assets, not the legacy-track Pages product.

The domain (erikhaakephoto.com) stays registered at Squarespace with
DNS pointed at Cloudflare when the flip happens — no registration
transfer required or planned.

Post-decision cleanup (caught by 002's pre-merge review): the theme's
GitHub Pages workflow (`.github/workflows/deploy.yml`) was still armed
to publish on every push to `main` — removed, since Pages lost the
comparison and the go-live pause forbids any auto-publish. CI
(`ci.yml`) stays, and now runs the unit suite too.

## Go-live paused; repo private; images stay in git for now

Three decisions from spec 002's Phase 3 review (2026-08-31):

- **Public availability is paused.** Deploy, domain flip, and the
  author-content tasks moved to `specs/005-going-live/` (deferred).
  The order the photographer wants before anyone sees the site: block
  vocabulary (003), sample pieces written against it, galleries (004).
  Until then the site is `npm run dev` only.
- **The GitHub repo went private** for the pre-launch period — a
  public repo would have exposed pieces and photos before launch.
  Cloudflare Workers Builds supports private repos, so the eventual
  deploy is unaffected. Revisit visibility at launch (the
  workflow-demonstration value of a public repo returns once the site
  itself is public).
- **Images stay committed to git, export-sized.** Asked directly
  whether a separate asset store should come first, the answer stays
  what the constitution says: not until repo size or clone speed is a
  real problem. Visitors never receive committed originals — the build
  generates optimized derivatives — so the only cost is repo growth.
  Practice that keeps that cost low: commit web exports (~2560px long
  edge, 1–3MB), never RAW or full-res masters; at that size, ~100
  pieces ≈ 1GB. When the trigger fires, the likely destination is
  Cloudflare R2 (same account as hosting); the remark transform is the
  single seam where relative paths would become store URLs, so pieces
  themselves won't change. Git LFS was considered and rejected: it
  complicates CI and its bandwidth pricing punishes exactly this use.

## Mattes: site-applied, never baked into files

Surfaced at spec 003 review: the photographer mattes every image they
present, on every channel — so the site presents images matted, and
the design brief's skeuomorphism ban was amended (its own commit) to
carve out the flat matte specifically. Frames, shadows, bevels, and
textures remain banned; the matte is a flat, token-driven color field.

How to apply them was compared directly:

- **Baked into uploaded files** — rejected: retuning means
  re-exporting every image ever committed; files become unusable
  elsewhere without double-matting; the matte shrinks with the image
  on small viewports; srcset pixels are wasted on matte; and every
  aspect ratio lies to the layout math (including diptych/triptych
  centered alignment).
- **Applied by site CSS** — chosen: one token retunes all mattes;
  source files stay clean exports; responsive behavior is controlled;
  the pipeline's dimensions stay honest; edge-to-edge treatments
  (fullbleed, tall, strip) can stay unmatted since the bleed is the
  point.

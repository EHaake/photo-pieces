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

Source lives in `obsidian-plugin/` in this repo. _Superseded in part
by spec 003 — see "Spec 003: breadth over demand-driven growth; plugin
approximations" below: the plugin now renders every standalone leaf
block; container forms stay raw._

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

## Ground tone: warmed so the mattes read

At the spec-003 sampler review the pure-white mattes were nearly
invisible against the paper-white page (~1% lightness apart). Four
candidates were compared live on the sampler via a dev-only switcher:
current ground, two warmed grounds, and a hairline mat edge on the
current ground. Chosen: **gallery warm** — background to
oklch(0.968 0.006 95) with surface/soft shifted in step (0.945/0.92)
and the line hue warmed to match. The photographer's read: "initially
looks slightly too warm, but our eyes adjust quickly." The mat-edge
option was rejected as visually noisy; tinted mats were rejected as
inverting the mat-brighter-than-wall logic. Derived copies resynced:
the OG route's bg hex (#f6f4f0) and public/og.jpg.

## Header: full width, hides on scroll down

Surfaced at the spec-003 sampler review on the photographer's laptop:
the sticky header inherited the content-width `.section` rule, so an
edge-to-edge image scrolling beneath it showed on both sides of a
narrower header band. Options weighed — full-width sticky, the
headroom pattern (hide on scroll down, reveal on scroll up; the
editorial/portfolio standard), a non-sticky header, and a translucent
header (out: the brief bans glassmorphism). Chosen: full width **and**
hide/reveal, the photographer's own instinct — the width fixes the
bug; the hide/reveal keeps chrome off the photographs while reading,
per the brief's images-as-interface principle. Details that keep it
from being annoying: always visible near the top of the page, an
8px jitter threshold, a reveal when keyboard focus enters the header,
and the global reduced-motion rule collapsing the slide.

## Spec 003: breadth over demand-driven growth; plugin approximations

ROADMAP originally prescribed growing the block vocabulary "from a
concrete list gathered by writing real pieces — not speculatively."
At spec 003 the photographer reversed that deliberately: the vocabulary
was built broad first (eleven treatments plus captions and mattes), on
the reasoning that unused treatments cost little now that the pipeline
is proven, while missing ones interrupt writing. Real writing may still
surface a gap; additions have become cheap (a descriptor, CSS, tests).

The Obsidian plugin's approximation widened accordingly and stays an
approximation: it renders the leaf form of the seven standalone blocks (eight since
spec 007's pause)
(pairs and triptychs as side-by-side thumbnails), anchored to whole
lines so it agrees with the pipeline about mid-paragraph directives,
and no longer shows `alt` as a caption. Container forms — captions,
grid, strip, aside, row — remain raw text in Live Preview: they need a
real parser, not a line regex, and raw text is honest about the build
being the source of truth. Reading View stays out of scope.

## EXIF via `exifr`; GPS never leaves the build

Spec 004's wall label reads exposure fields from each image file at
build time. `exifr` (7.1.3, pinned) was chosen over `sharp().metadata()`
plus a second decoder: purpose-built, zero transitive dependencies,
and its `pick` option plus `gps: false` let the read be scoped to an
allowlist at the source. It is a single-maintainer package with no
release since 2022 — accepted, because it is small, stable, and does
one thing; if it ever breaks, the reader is one file (`src/lib/exif.mjs`)
behind a pure formatter, and the fixture-backed tests say exactly what
a replacement must return.

The standing constraint is that no location data can reach the site,
enforced three ways because each covers a different failure: the
reader's allowlist (tested against a fixture that carries GPS, and
shown to fail against a naive reader before the test was trusted),
the registry's output shape, and a post-build scan of every raster in
`dist/` (`scripts/check-no-gps.mjs`, wired into `npm run build`'s
`postbuild`, which CI runs — though CI itself has yet to execute for
this repo, see spec 005 — and shown to fail on a planted file). One
fixture image in content carries GPS on purpose so the last barrier
always has something real to strip.

The last barrier caught two real leaks on its first run. First, the
Open Graph request for a 1200px-wide JPEG at 1200px as JPEG: Astro's
service passes the original through untouched when width and format
match the source, so the page's OG image was the file itself, GPS
included (`src/lib/og.ts` now asks for one pixel less in that case).
Second, and larger: Astro emits every ESM-imported image into
`dist/_astro/` as an untouched original so its service can read it,
and is meant to delete the ones nothing references afterwards — but
in this static build its "referenced outside processing" check marks
every imported image (piece covers and registry imports alike), so
33 originals shipped unlinked from any page, metadata and all. It
predates spec 004 (covers were already imported) and is Astro's
behavior, not the registry's. `scripts/prune-unreferenced-originals.mjs`
now does the deletion Astro meant to, in `postbuild` before the scan:
an original with transform siblings that no file in `dist/` mentions
is removed. If Astro fixes the check the pruner becomes a no-op; the
scan stays regardless.

## Category browsing: one route family, not per-genre sections

Spec 001 ruled out per-genre site sections; spec 004 needed category
browsing anyway (galleries grouped by category, pieces filterable).
Chosen at plan review: a single `/categories/<category>/` route family
listing a category's galleries then its pieces, reached only from
category labels on piece, gallery, and image pages and from a link row
on `/pieces/` — never from the nav. The alternative, per-category list
pages under `/pieces/`, would have needed a second family for
galleries and drifted toward the sections the site deliberately
doesn't have.

## Gallery layout: rows packed to equal short sides, in editorial order

Spec 004's plan and the design brief said "plain grid" — equal
columns, each image at its own height, rows midline-centered. At the
sampler review (2026-09-01) the photographer saw a 3:1 panorama render
as a sliver in one of three columns beside a full-height portrait and
set the rule the layout now follows: _every image's short side should
render about the same_, so a pano fills a row, a 3:2 takes one and a
half times a portrait's width, and nothing looks small for being wide.

The mechanism is the triptych's `match="height"` math with a different
target: each cell's flex basis is its width at a common short side S,
grow is proportional to that width, rows wrap in the photographer's
order, and one factor scales each row to fill — so short sides are
exactly equal within a row. Integer column spans were rejected (a 3:2
in two of three columns is a third too big, in one a third too small,
and spans leave holes once order is fixed). Masonry was never on the
table (it reorders); equal-height justified rows were rejected because
they make portraits the smallest frames on the page — the opposite of
the rule. The accepted cost: a row that can't fill stays short and
centered rather than pulling a later image forward. Density (S) and
the short-row stretch cap are knobs. The index's gallery cards keep
the plain grid, since a card's text wants uniform columns.

## Spec 006: the rich image page

Decisions made at the mock-up review, the plan gate, and the visual
gate (2026-09-02), recorded here because the code only shows the
outcome.

**Private rasters by `_` prefix, not a sidecar field.** The camera's
frame for the compare is `_land-b.jpg` beside `land-b.jpg` — the
sidecar's own underscore rule, extended. A sidecar field pointing at
any file was the alternative; it would have been a second mechanism
saying the same thing (drift), and it would still have needed the
private rule to keep the frame off the site. Two relations share one
prefix on purpose (`_x.md` is _about_ x, `_x.jpg` is _the raw of_ x);
`AUTHORING.md` says so. One frame per photograph; an orphan or a
second frame fails the build. The photographer delegated this call.

**Story first.** The photographer, over the recommendation of label
first: "if there is a story, I want that to be more important than the
settings." A page without a story is the same page minus one section;
the title is the story's heading.

**Related frames are the outing only.** Six nearest in the piece's
order; none for gallery-root images — the flat gallery root is a pool,
not an outing, and would have listed every fixture it holds. The strip
uses the gallery's own equal-short-side packing at a smaller target
(`gallery-layout.ts`), not a second rule.

**Set selection by a click, with the default as every failure mode.**
Static pages can't know the referrer, so the HTML shows the default
set (the newest gallery holding the image, else the piece). A
capture-phase click handler in the layout is the one writer of the
set (a neighbour link's own set, else the gallery or piece the click
came from); the image page reads it. A typed URL or an outside link
shows the default or the last clicked set — accepted.

**Search takes pages with something to find.** Image pages join the
Pagefind index only with a story, a caption, or a place; exposure
rows, from-lines, navs, and the related strip are ignored. Thirty
label-only fixture pages would otherwise swamp four pieces with
junk excerpts.

**Quiet view dims the ground — the one dark surface.** The first cut
kept the light ground and the reading width, and the photographer's
verdict was that it "didn't really do anything". Now a click on the
photograph hides the chrome, dims `html`, `body`, and the stage to a
`--color-quiet` token beside the matte tokens, and gives the frame the
viewport with a small margin: "the dark mode, but only in specific
controlled situations". Spec 002's light-only decision stands
everywhere else; this is a state of one page, entered and left on
purpose, not a mode.

**The pruner prunes every unreferenced original.** The spec-004 rule
required a transform sibling as the sign Astro had processed an image;
the camera's-frame fixture, imported by the registry but not yet
rendered, shipped as an untouched original with its GPS block and the
scan failed the build at T403. Unreferenced is the whole test: nothing
can reach a file no page names.

**Unknown sidecar fields are stripped, not rejected.** Astro's
collection schemas aren't strict, none here are, and Obsidian writes
properties of its own into frontmatter; a strict schema would fail the
build on them. A wrong-typed known field is rejected with its name.

## Spec 007: the held image and the pause

Decisions from the exploration branch (`explore/held-block`, deleted
at close-out) and the plan gate, recorded here because the shipped CSS
only shows the outcome.

**Words beside the frame, never over or under it.** Text over a
photograph is a standing non-goal; the exploration also tried the
words below a held frame, and the photographer's call on a portrait
desktop settled it — beside, in a narrow column, or not held at all.
That is why a hold exists only where a column fits.

**Script-driven pause, CSS-only holds.** A hold is a sticky figure —
no script, so it works everywhere and can't stutter. The pause's dim
and approach need scroll progress, which CSS scroll-driven animations
would give if Safari before 26 and older Firefox supported them; a
small page-level script does it instead, and without script a pause
still pins, on the light ground. Per the constitution, an interactive
block is enhancement over the transform's HTML, never an island.

**Frames sized by ratio, never by `sizes`.** The exploration's trap: a
responsive image with `width: auto` takes its natural width from the
`sizes` hint, so a 3:2 frame was sized by a media-query string instead
of the space it had. The layout now computes every frame from `--ar`
and the height available; `sizes` is a hint for the srcset choice
alone, and the two are allowed to disagree.

**The `sizes` hints are `calc()` in `vmin`, not a share of the
screen.** A pause's margin is a clamp in `vmin`, not a percentage, so
treating it as one made the hint fall 3.7% under at 1440×900 — and a
short hint picks a soft image, since the srcset picks the next size up
from what the hint asks. The hints are written `calc(95.24vw −
9.52vmin)` and its height twin, coefficients rounded so the hint can
never fall under (T504 review).

**Margins, not padding, around a scene.** A hold ends with its last
line: padding inside the scene would leave the frame parked over empty
space after the words are spent, which the photographer named as the
failure to avoid ("the text keeps scrolling up for a while"). Margins
put the air outside the sticky context, so the release is exact.

**No hold where no column fits.** A landscape frame on a portrait
viewport, and anything on a phone, renders as an ordinary figure with
its words after it. The orientation comes from the image's own pixels
at build time — a class on the wrapper from the transform, no script
and no measurement — so the decision is made before the page loads,
and a square counts as landscape because it is width-starved the same
way.

**The hold's margin is the pause's.** One token (`--hold-margin`,
about 5vmin) sets both, so a held frame and a pinned one sit the same
distance from the edge and the page has one rhythm rather than two
that nearly match.

**The pause's words go down with the lights.** The alternative — dark
text left on a darkening ground — was tried and read as a fault. Text,
headings, captions, the page head's and the footer's text, and the
hairlines all mix toward `--color-quiet` as the ground does, each from its own token, which means the rule is a
list: an element outside it would stay light on the dark ground. A
link in the text inherits its paragraph's colour and needs no rule;
only the footer's and the page head's links are named. The words do
not disappear into the ground, though — the ground stops short and
the words go all the way — and the mats are not on the list: see the
two entries below. The sampler carries a link and a heading after its
pause as the standing check, read by eye.

**The words anchor to the frame** (visual gate, 2026-09-04). On the
exploration the paragraph before a pause scrolled away above the
pinned frame and the next one arrived out of an empty space below; the
photographer wants the words anchored to the frame. The transform
moves the two neighbouring paragraphs into the stage, so they pin with
it and stay above and below it for the whole pause — and only
paragraphs: a heading, a list, an image, or another block beside a
pause stays outside the scene, which keeps the rule one an author can
predict from the source.

**The dark is a depth, not the quiet ground** (visual gate).
"The screen shouldn't go entirely black": the ground stops 85 percent
of the way to `--color-quiet` (`--pause-depth`) and reads as a dark
grey, while the words go all the way, so they sit a shade darker than
the ground and stay faintly readable instead of dissolving into it.
One knob sets how dark the ground gets, and the words' end colour
stays the palette's own — no second scale to keep in step with it.

**The mat stays** (visual gate). The mats used to mix toward the quiet
colour with everything else, and the photographer's note was "the
matte goes away". A white mat on a dark ground is what quiet view
already does, so the mats are simply left out of the lights' list.

**A pause needs room after it: half of what the stage leaves empty.**
The sticky stage releases only when the scene's bottom reaches the
stage's bottom, which needs about half the empty viewport's worth of
document below the scene: a pause nearer than that to the end of a piece
never lightens on a tall viewport, and the page ends with the lights
part-way up (T506b measured exactly that on the sampler). An authoring
rule rather than a mechanism — `AUTHORING.md` says leave words after a
pause, and the sampler now carries closing paragraphs after its own.

**A collapsed hold keeps the held reading size** (1.05rem / 1.85). On
a phone, or a landscape frame on a portrait screen, the passage reads
a little larger than its neighbours rather than changing size with the
window — the block is the same block whether or not it holds.

**The image page's passage reads captions by body kind.** A spec-006
defect this spec's fixtures forced open: `passageFor` treated every
non-image line of a container's body as a caption, so converting a
`wide` to a `held` would have quoted two paragraphs of the piece's own
prose as an italic caption on the image page. The body kinds now live
in one map (`BLOCK_BODIES` in `image-meta.mjs`), a test asserts the
transform's table against it, and only caption-bodied blocks
contribute a caption — a `held`, `row`, or `aside` body never does.

**The second visual gate (2026-09-05): a tall sits inside the screen; a
fullbleed does not shrink.** On the laptop a 2:3 `tall` at 92vh was
hard to centre while scrolling so the whole frame showed, so
`--tall-max` is 85svh — the same share of the screen the pause's frame
takes, so the site's verticals have one sense of air. The 3:2
`fullbleed` is taller than a 16:10 screen and stays so: a fullbleed
that shrank would not be full bleed, and the photographer's own
leaning was to choose wider frames for it — so the fix is a rule in
`AUTHORING.md` (a frame's shape picks its treatment) rather than a
mechanism.

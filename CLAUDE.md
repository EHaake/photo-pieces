# Project Constitution

This file is the standing contract for how this codebase is built. It loads
into every Claude Code session automatically. Specs and plans must not
contradict it; if a spec needs to, the constitution gets amended first,
explicitly, in its own commit.

## What this project is

A personal photography website, spanning landscape/nature (primary),
street, portrait, and event work. The core experience is "pieces" —
blog-style entries that pair writing with a small, closed set of image
treatments; a piece can be a photo essay about a specific outing, gear
notes, or an announcement, not exclusively image-heavy content. Galleries
are a secondary, hand-curated view organized by category, with gallery
images linking back to their originating piece where one exists. The site
also carries a simple About page and a Contact page. It's meant to be
authored continuously for years, with Obsidian as the writing tool and no
CMS or backend service for v1.

## Platform

- **Target**: A fully static site for v1 — no server-rendered pages, no
  database. Static output deploys to Cloudflare Workers static assets
  (decided at spec 002 — comparison in `DECISIONS.md`; deployment
  itself is paused until `specs/005-going-live/` executes).
- **Framework**: Astro (latest stable at scaffold time — pin the exact
  version in `package.json` when the repo is created).
- **Language**: TypeScript, Astro's default.
- **Content format**: Plain Markdown (`.md`) with YAML frontmatter.
  Custom image-block types (diptych, triptych, full-bleed, etc.) are
  written as remark directives (`::name{...}` / `:::name ... :::`), not
  as MDX/JSX. This is a hard rule, not a style preference — piece content
  lives in an Obsidian vault, and MDX would break Obsidian's ability to
  render and edit those files.
- **No CMS for v1**: content is authored directly as files in the
  Obsidian vault / Astro content folder, previewed live via `astro dev`,
  and published via `git push`. No database-backed content layer. See
  `ROADMAP.md` for when this might get revisited.

## Architecture

- **Content model**: a single `pieces` content collection is the primary
  data source. Beside it sits the **image registry** (spec 004): a
  build-time index, _derived_ automatically over every accepted raster
  in a published piece's folder and in `src/content/gallery-images/`,
  giving each image a stable id (`<folder>/<basename>`), a page at
  `/images/<id>/`, exposure metadata read from the file's EXIF, and an
  optional frontmatter-only sidecar (`_<basename>.md`) that overrides
  it. Galleries are the opposite kind of thing: a separate,
  hand-_curated_ collection of ordered image ids — never auto-generated
  from the registry — each tagged with a category. An image belongs to
  at most one piece, by folder; galleries reference images, not pieces,
  and the page for an image links back to its piece where one exists.
  **Places** (spec 009) are a third kind: a `places` collection of
  files _declared_ once (a title, a description, an optional cover,
  the writing), then _grown_ by the registry — a photograph names its
  place in its sidecar (`at: <slug>`, or `at: none`), a piece may set
  one default for its folder with the same line, and the build refuses
  a slug with no file, listing the places that exist. A place's page
  groups its published frames by the piece they live in, outings
  oldest first, own-folder frames only; a place is never inferred from
  camera metadata, and never from the sidecar's free-text `place`,
  which stays prose for the wall label.
- **Closed block vocabulary**: image treatments inside a piece's body are
  limited to a defined set of directive-backed treatments — as of spec
  007: single, fullbleed, wide, tall, inset, diptych, triptych, grid,
  strip, aside, row, and the two durational blocks, held and pause,
  with captions via the container form and site-applied mattes; a
  `sequence` type is reserved but its final presentation is undecided
  — see `ROADMAP.md`. Adding a new
  treatment means deliberately adding a new directive + presentation
  contract — a handler in the remark transform (the vocabulary's single
  source of truth) plus the CSS that styles its output — not writing
  one-off markup inline. There are deliberately no per-block `.astro`
  components: mapping rendered elements to components is an MDX-only
  feature, and pieces are plain `.md` by hard rule. For the same reason
  a future _interactive_ block (`sequence`'s carousel/slider candidates)
  must be built as page-level progressive enhancement over the
  transform's HTML — `.md` content cannot mount islands. The Obsidian
  plugin and the site CSS mirror the transform's vocabulary by
  convention (see `DECISIONS.md` on the accepted approximation).
- **Theme boundary**: global chrome (nav, footer, base typography and
  color tokens, base list/tag pages) comes from a forked base Astro
  theme. The piece-reading layout and its block treatments are
  custom-built, but must consume the theme's design tokens rather than
  redefining their own — this keeps the custom parts visually coherent
  with the rest of the site.
- **Images**: local and co-located with each piece for initial
  development (`src/content/pieces/<slug>/`), plus one flat
  `src/content/gallery-images/` root for images that belong to no piece
  (spec 004), using Astro's built-in image handling — no external store
  required to start. A piece's folder is public territory: every
  accepted image in it gets a page, referenced by the body or not, and
  images under a `draft: true` piece are unpublished with it. Not the final
  architecture: migrate to an external store once repo size or clone
  speed becomes a real, not hypothetical, problem. See `plan.md` for
  the reasoning.

## Testing

- Astro's content collections provide schema validation at build time —
  the first, automatic layer of testing for piece and gallery
  frontmatter. A malformed entry should fail the build loudly, not
  silently.
- For logic that schema validation doesn't cover (the remark-directive
  transform, block styling, the image pipeline), add real unit tests.
  Vitest is the natural pairing with Astro's Vite-based tooling and is
  the reasonable default — confirm before scaffolding rather than
  treating it as settled.
- A task is not complete until the build succeeds and, where a test
  exists for what changed, it's been run and its actual output reported
  — not paraphrased or assumed from reading the code.
- Don't weaken, skip, or delete a test to make it pass — if a test seems
  wrong, flag it and ask.
- A test's assertions must be able to fail for the reason the test's
  name gives. A test that passes on both the correct and the broken
  behavior it's named for is worse than no test — it documents a
  guarantee that doesn't exist.

## Dependencies

Default policy: prefer Astro's built-ins (content collections,
`astro:assets`, the built-in Markdown/remark pipeline) over third-party
packages. Any new dependency gets named and briefly justified here — or
at minimum flagged in the relevant `plan.md` — before it's added, since
this project is meant to stay maintainable by one person for years.

Named here because they carry a standing constraint, not only a
justification:

- **`exifr`** (spec 004, build-time only): reads the exposure fields
  the image registry publishes (camera, lens, focal length, aperture,
  shutter, ISO, capture date) straight from the image files. Chosen
  over `sharp().metadata()` plus a second decoder because it is
  purpose-built, has zero transitive dependencies, and lets the read be
  scoped to an allowlist with GPS parsing disabled. The constraint:
  **GPS is never read and never emitted** — the reader stays configured
  with `gps: false`, the registry's output is asserted allowlist-only
  against a GPS-bearing fixture, and a post-build scan of every image
  in `dist/` must find no GPS block.

## Project file safety

No project-format file with a known corruption risk has been identified
yet for this codebase (nothing like Xcode's `.pbxproj`). The one file
that needs special handling once implementation starts is `tasks.md` —
see "The multi-writer file problem" in the spec-driven-development skill
for the actual handling rules. It's a different kind of risk (concurrent
editing, not binary corruption) but worth the same discipline.

## Involvement level

**Product owner.** The person owns `spec.md`, attests to behavior by
using the site at phase pauses, and decides escalations. They do not
approve technical work: `plan.md` and `tasks.md` are signed off by Plan
Mode plus the `skeptical-reviewer`, foundational tasks are reviewed by
the `skeptical-reviewer` rather than the person, and what reaches the
person is a spec-conformance summary, not an architecture review.
Implementation pauses after each phase unless the person says to run
further, and whenever something unexpected bears on spec adherence.

## Model policy

- **Decisions run at the best available tier**: the spec conversation,
  plan and task drafting (the `sdd-planner` subagent, one dispatch per
  spec on a planning bundle), Step 1 triage, orchestration of
  implementation, and the `skeptical-reviewer` when it's judging a
  decision — plan/tasks sign-off and reviews of routine-but-real
  decisions — via a per-call model override up from its default.
- **The `skeptical-reviewer` runs one tier down by default** (its
  definition says `opus`) for per-task reviews in foundational phases,
  per-phase reviews in mechanical ones, and the pre-merge sweep. Each
  review gets a single bundle file assembled with shell — diff, task
  lines, plan sections, acceptance criteria; for the sweep, the
  documents and the spec's full diff — and reads nothing else.
- **Review loop cap**: one review and at most one re-review per
  invocation — task, phase, sign-off, or sweep. The re-review sees the
  findings and the fix diff only. Blocking
  means it would fail an acceptance criterion or a test, or contradicts
  `plan.md` or `CLAUDE.md`; nothing else blocks. Anything open after
  the re-review goes to the tier log and the sweep.
- **Implementation runs one tier down**, in the `sdd-implementer`
  subagent, one task per dispatch, sequentially. The orchestrating
  session triages each task, dispatches routine ones on a task bundle
  assembled with shell (task line, plan section, acceptance criteria,
  files, the pattern file to copy), and on return verifies with the
  verification command below — re-run by the orchestrator in
  foundational phases, taken from the implementer's verbatim output in
  mechanical ones — never by re-reading the diff. Only the orchestrator
  edits `tasks.md` or commits.
- **Fresh orchestrator session at each phase pause**, resuming from
  the first unchecked task, so the top-tier context doesn't accumulate
  the whole spec.
- **Escape hatch**: two failed verifications on one task, or a "stopped
  on a judgment call" the orchestrator considers well-specified, and
  the orchestrator does that task itself at the top tier, noting the
  miss in `tasks.md`.
- **Third tier**: off. <!-- Turn on per project once the first spec's
  tier log justifies it: "Sonnet for tasks with an automated Verify
  check, a named pattern file, and a small footprint." -->
- **Log token usage per implementer run and per reviewer invocation**,
  plus tier misses, in `tasks.md`'s tier log for the first spec under
  this policy, and compare against a previous spec before treating the
  policy as settled.

## Spec-driven workflow

This project follows spec → plan → tasks → implement, gated by review
between each phase — the person's or the `skeptical-reviewer`'s, per
the involvement level above. Artifacts live in `specs/<NNN>-<slug>/`:

- `spec.md` — what and why, user-facing behavior, acceptance criteria,
  explicit non-goals. No implementation detail.
- `plan.md` — technical design: types, data flow, what changes where.
- `tasks.md` — ordered, small, independently verifiable tasks.

`DECISIONS.md` (repo root) carries business, product, and process
context that doesn't fit the docs above — naming rationale, tooling
choices, comparisons between options considered and passed on.

Authorship: `spec.md` is written in the chat design conversation.
Until this project has shipped code, `plan.md` and `tasks.md` are too;
once shipped code is what plans extend, the `sdd-planner` subagent
drafts them instead — at the top tier, from a planning bundle, against
the actual codebase — and the orchestrator commits them to the spec
branch with the PR still in draft. Both are signed off before any
implementation task starts: at the product-owner level by the
`skeptical-reviewer` (blocking findings fixed and re-reviewed), with
the person receiving a spec-conformance summary to approve; at the
technical-lead level by the person directly.

Do not begin implementation on a feature without an approved spec and
plan in that feature's directory. When resuming a session, check
`specs/<feature>/tasks.md` for current state before doing anything else.

## Verification

The verification command for this project is:

    sh scripts/verify.sh

(`sh scripts/verify.sh tests` runs Vitest alone, for a task that
changes a pure rule and nothing a build renders.) It builds, runs
`astro check`, and runs the tests, printing the counts and every
flagged line — the full logs go to a temp folder it names — and on a
failure the last forty lines. Green: `BUILD EXIT 0`, `CHECK EXIT 0`,
`TEST EXIT 0`, and no failed tests.

After any implementation task, Claude Code must run that command and
report its actual output, not a paraphrase.

A task is not complete until that output is green. Do not weaken, skip,
or delete a test to make it pass — if a test seems wrong, flag it and
ask. When the task was dispatched to the `sdd-implementer`, its verbatim
output is the verification in mechanical phases; in foundational phases
the orchestrator re-runs the command itself before committing.

## Git conventions

- **One branch per spec, not per task or phase.**
- **Never commit directly to `main`.** All implementation work happens
  on a spec branch.
- Open the PR as a draft immediately after pushing the branch, for a
  running diff. Only mark it ready and merge once every task in the
  spec's `tasks.md` is complete and verified.
- Keep AI co-authorship attribution on commits — accurate, and worth
  keeping for a project meant to demonstrate this workflow.
- Never force-push.

## Commits

- One commit per completed task where practical, referencing the task ID
  — made by the orchestrating session after its own verification, never
  by the implementer subagent.
- Commit messages describe what changed and why, not "implement task 3".

## Collaboration workflow

If the `spec-driven-development` skill is installed
(`~/.claude/skills/spec-driven-development/` or a project-level
`.claude/skills/`), its collaboration workflow applies automatically —
routine tasks proceed normally, real decisions resolve via Plan Mode and
the `skeptical-reviewer` subagent, and beyond the pauses their
involvement level defines, the person is looped in only when something
in the design turns out infeasible or needs real rework, or a
previously-unknown consideration surfaces that would materially change
the project's direction. Nothing needs to be repeated here.

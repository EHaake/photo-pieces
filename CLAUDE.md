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
approve technical work: `plan.md` and `tasks.md` are drafted by the
`sdd-planner` and signed off by the `skeptical-reviewer`, each phase
(and any task the planner marked for its own review) is reviewed by
the `skeptical-reviewer` rather than the person, and what reaches the
person is a spec-conformance summary, not an architecture review.
Implementation pauses after each phase unless the person says to run
further, and whenever something unexpected bears on spec adherence.

## Model policy

- **Tiers by name**: top tier `fable`; implementation tier `opus`;
  session tier `claude-opus-4-8` (the full ID — a previous-generation
  model has no short alias). These three names are the only place a
  model is spelled out; everything below refers to the roles.
- **The session runs at the session tier, at medium effort**, set in
  this repo's `.claude/settings.json` — written at project setup from
  the skill's `assets/settings-template.json` (`"model":
  "claude-opus-4-8"`, `"effortLevel": "medium"`, and a level under
  `"modelSettings"` for each tier's full model ID). If that file is missing or lacks these
  keys, recreate it from the template and commit it before dispatching
  anything; nobody creates it by hand. Project settings outrank user
  settings, so a model picked in the app's picker only affects the
  session it was picked in — new sessions in this repo start here
  regardless. The app's effort indicator may show the model's default
  rather than the level in effect; `/effort status` inside the session
  is the authoritative check. The orchestrating session takes many
  bookkeeping turns and re-sends its whole context on each one — the
  dominant cost of the workflow — and it makes no design decisions: it
  assembles bundles, dispatches, verifies, commits, and reports. If it
  drops the protocol (a skipped review, a stale `tasks.md` edit, a
  task done by hand), the first fix is high effort, one line in the
  same file.
- **The session tier never resolves a design question.** When triage
  finds a task that isn't routine, the session frames the question in
  Plan Mode — so nothing is touched meanwhile — and dispatches the
  `skeptical-reviewer` at the top tier on a decision bundle: the task
  line, the plan section, the acceptance criteria, and the options as
  the session sees them. It transcribes the recommendation into
  `plan.md` and dispatches what remains. A product question `spec.md`
  doesn't settle goes to the person instead.
- **Everything the person reads is plain language.** Pause reports,
  spec-conformance summaries, and questions use short sentences and
  everyday words — no task IDs, agent names, tier names, or internal
  shorthand unless the person asks — and assume the reader won't open
  `plan.md`. Say what can now be tried, where execution deviated from
  the spec and why, and what needs a decision. Technical detail
  belongs in `plan.md` and the commit log, not in the report.
- **What the person's walkthrough finds is a finding, not a task
  line.** When the person reports at a phase pause that something is
  wrong, the session restates it — which acceptance criterion, what
  they saw, what the spec says — and dispatches a diagnosis bundle to
  the `sdd-implementer` (the report, the restatement, the task line,
  the plan section, the acceptance criterion, the files). The
  implementer finds the cause and fixes it if the fix is routine and
  inside the footprint; otherwise it returns the diagnosis and
  options, which go to a decision review at the top tier. A fix is
  logged as a sub-lettered task; a finding that is really the spec
  being ambiguous goes back to the person as a product question. The
  session never diagnoses in place.
- **The top tier runs only inside the decisions**: the `sdd-planner`
  (one dispatch per spec) and the `skeptical-reviewer` on plan/tasks
  sign-off and on decision reviews — each dispatched with an explicit
  per-call override to the top tier's name. The three agent
  definitions carry `effort: high`, which overrides the session's
  medium, so reasoning stays at full strength where it matters.
- **Spec conversations happen in a Claude Code session of their own**,
  at the top tier, and end with a new session (not `/clear`, which
  keeps the model) when the spec is approved — never inside an
  orchestrating session. The spec session's last message is the
  continuation prompt that starts planning in the new session. A
  session in this repo opens at the session
  tier, so a spec session states its model first and, if it isn't the
  top tier, asks the person to switch to the top tier for this
  session — the model selector in the app, or `/model fable` — before
  continuing. `.claude/settings.json` pins effort per model, so
  picking the top tier brings high effort with it and the next session
  still opens at the session tier. (The project's very first spec,
  with no codebase yet, happened in chat.)
- **The `skeptical-reviewer` runs at the implementation tier by
  default** (its definition says `opus`) for per-phase reviews, the
  per-task reviews the planner marks, and the pre-merge sweep. Each
  review gets a single bundle file assembled with shell — diff, task
  lines, plan sections, acceptance criteria; for the sweep, the
  documents and the spec's full diff — and reads nothing else.
- **Review loop cap**: one review and at most one re-review per
  invocation — task, phase, sign-off, or sweep. The re-review sees the
  findings and the fix diff only. Blocking
  means it would fail an acceptance criterion or a test, or contradicts
  `plan.md` or `CLAUDE.md`; nothing else blocks. Anything open after
  the re-review goes to the tier log and the sweep.
- **Implementation runs at the implementation tier**, in the
  `sdd-implementer` subagent (its definition says `opus`), one task
  per dispatch, sequentially. The orchestrating
  session triages each task, dispatches routine ones on a task bundle
  assembled with shell (task line, plan section, acceptance criteria,
  files, the pattern file to copy), and on return verifies with the
  verification command below — re-run by the orchestrator for tasks
  marked `review: per-task`, taken from the implementer's verbatim
  output otherwise — never by re-reading the diff. Only the
  orchestrator edits `tasks.md` or commits, and the orchestrator never
  implements second-look notes or does device or browser checks by
  hand.
- **Clear at every phase boundary and at spec end** (`/clear`, resuming
  from the first unchecked task). Cache re-sends are context size times
  turn count; a phase boundary is where the carried context has the
  least remaining value. Compact mid-phase only if the context grows
  large; never clear mid-task.
- **Every session-ending pause ends with a continuation prompt.** When
  the next step belongs in a fresh session — after a phase pause,
  after a spec is approved, after a merge with the next spec waiting
  on `ROADMAP.md` — the report's last item is the exact prompt to
  paste there, in its own fenced block. It names the spec directory,
  the files to read, where to resume, the involvement level, the
  pause cadence, and any model switch the next session needs. Write
  anything the next session needs to a file first; the prompt points
  at files. If nothing can proceed until the person decides
  something, say so instead.
- **Batch the bookkeeping**: commit, checkbox, and tier-log row in one
  shell command; bundle assembly and dispatch back to back. Every turn
  saved is one fewer re-send of the whole context.
- **Fallback**: if the top tier's usage budget runs out, dispatch the
  planner and sign-off at the implementation tier for the rest of the
  window (drop the override; both definitions default to `opus`).
  Nothing else changes; the tier log records what ran.
- **Escape hatch**: two failed verifications on one task, or a "stopped
  on a judgment call" the orchestrator considers well-specified, and
  the orchestrator does that task itself, noting the
  miss in `tasks.md`.
- **Lighter implementer**: off. <!-- Turn on per project once the
  first spec's tier log justifies it: "the session tier for tasks with
  an automated Verify check, a named pattern file, and a small
  footprint." -->
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
output is the verification; for a task marked `review: per-task` the
orchestrator re-runs the command itself before committing.

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

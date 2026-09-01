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
  data source. Galleries are a separate, hand-curated collection of image
  references — never auto-generated from all site images — and each
  gallery entry may optionally reference the piece it came from.
- **Closed block vocabulary**: image treatments inside a piece's body are
  limited to a defined set of directive-backed treatments — as of spec
  003: single, fullbleed, wide, tall, inset, diptych, triptych, grid,
  strip, aside, row, with captions via the container form and
  site-applied mattes; a `sequence` type is reserved but its
  final presentation is undecided — see `ROADMAP.md`. Adding a new
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
  development (`src/content/pieces/<slug>/`), using Astro's built-in
  image handling — no external store required to start. Not the final
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

## Project file safety

No project-format file with a known corruption risk has been identified
yet for this codebase (nothing like Xcode's `.pbxproj`). The one file
that needs special handling once implementation starts is `tasks.md` —
see "The multi-writer file problem" in the spec-driven-development skill
for the actual handling rules. It's a different kind of risk (concurrent
editing, not binary corruption) but worth the same discipline.

## Spec-driven workflow

This project follows spec → plan → tasks → implement, gated by human
review between each phase. Artifacts live in `specs/<NNN>-<slug>/`:

- `spec.md` — what and why, user-facing behavior, acceptance criteria,
  explicit non-goals. No implementation detail.
- `plan.md` — technical design: types, data flow, what changes where.
- `tasks.md` — ordered, small, independently verifiable tasks.

`DECISIONS.md` (repo root) carries business, product, and process
context that doesn't fit the docs above — naming rationale, tooling
choices, comparisons between options considered and passed on.

Do not begin implementation on a feature without an approved spec and
plan in that feature's directory. When resuming a session, check
`specs/<feature>/tasks.md` for current state before doing anything else.

## Verification

After any implementation task, Claude Code must:

1. Build the project (`astro build`).
2. Run the test suite, where one exists for what changed.
3. Report the actual pass/fail output, not a paraphrase.

A task is not complete until steps 1–2 are green. Do not weaken, skip, or
delete a test to make it pass — if a test seems wrong, flag it and ask.

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

- One commit per completed task where practical, referencing the task ID.
- Commit messages describe what changed and why, not "implement task 3".

## Collaboration workflow

If the `spec-driven-development` skill is installed
(`~/.claude/skills/spec-driven-development/` or a project-level
`.claude/skills/`), its collaboration workflow applies automatically —
routine tasks proceed normally, real decisions resolve via Plan Mode and
the `skeptical-reviewer` subagent, and the person is looped in only when
something in the design turns out infeasible or needs real rework, or a
previously-unknown consideration surfaces that would materially change
the project's direction. Nothing needs to be repeated here.

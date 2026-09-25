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
  shows its published frames as one wall, outings oldest first,
  own-folder frames only, naming no piece; a place is never inferred
  from camera metadata, and never from the sidecar's free-text
  `place`, which stays prose for the wall label.
- **Closed block vocabulary**: image treatments inside a piece's body are
  limited to a defined set of directive-backed treatments — as of spec
  017: single, fullbleed, wide, tall, inset, diptych, triptych, grid,
  strip, aside, row, and one durational block, held, with captions via
  the container form; the site mats only the image page's quiet view
  (spec 015, narrowed at 017: the mat is worn where the ground is dark)
  — a piece's frames and the stage on paper sit unmatted on the ground.
  The pause block (spec 007) was withdrawn at spec 017 and is not in
  the vocabulary; the transform reserves nothing for it, so a piece
  that still writes it fails the build as any unknown directive does,
  naming the piece. Its code is `main`'s history up to spec 017, and
  the hero stage built on it is archived unmerged on
  `016-the-hero-stage`. A `sequence` treatment is a roadmap candidate
  whose presentation is undecided; it is not in the vocabulary and the
  transform reserves nothing for it — see `ROADMAP.md`. Adding a new
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
  A transform error is the same kind of failure: Astro's content
  loader would only log it and publish the entry bodiless, so every
  Markdown collection sets `deferRender: true` (spec 017, T1501a) and
  the error fails the build from the page instead. That option is the
  mechanism behind every "fails the build" claim about the transform;
  removing it reopens the gap.
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

<!-- Decided once, alongside the involvement level. Adjust the tier
names as models change; the roles don't. A project can move between
profiles later — change the names here and swap the settings file, one
commit — and the tier log shows from which spec. -->

**This project runs the Fable profile.** (Skill reconciled
2026-09-24: the profiles were renamed from standard/economy to
Fable/Opus and Opus is `claude-opus-5-5` everywhere; `claude-opus-4-8`
appears only if the person asks for it.)

**Fable profile.** Top tier `fable`; implementation tier `opus`;
session tier `claude-fable-5-1` at medium effort (the top and session
tiers are the same model at different effort). The fallback session
model is `claude-opus-5-5`. Settings from the skill's
`project/.claude/settings.json`.

**Opus profile.** Opus for everything: top tier `opus`;
implementation tier `opus`; session tier `claude-opus-5-5` at medium
effort. Every dispatch runs at high effort — the agent definitions'
own default — and only orchestration runs at medium. Nothing runs on
Fable: the planner and sign-off dispatches carry no override, the
close-out goes to `sdd-implementer`, and the top-tier fallback below
never applies. Settings from the skill's
`project/.claude/settings.opus.json`. Neither profile is the budget
option: Opus 5.5 costs less per token than Fable 5.1, and the two
orchestrators measured close per task. Hard design calls lean Fable;
well-understood building leans Opus.

These names are the only place a model is spelled out; everything below
refers to the roles.

### The role table

Every dispatch in this project resolves here. Cells hold tier names,
never model IDs, so switching profile re-points every row at once and
the three names above stay the only place a model is spelled out.
"Override" means the orchestrator passes a per-call model override on
that dispatch; without one, the agent's own frontmatter applies, and
every agent definition defaults to the implementation tier except
`sdd-implementer-fable`, which pins the top tier's model at medium.

| Role                          | Dispatched as           | Model                             | Effort                    |
| ----------------------------- | ----------------------- | --------------------------------- | ------------------------- |
| Spec conversation             | the spec session itself | session tier                      | high (raised per session) |
| Plan and tasks draft          | `sdd-planner`           | implementation tier (no override) | high                      |
| Plan and tasks sign-off       | `skeptical-reviewer`    | **top tier** (override)           | high                      |
| Decision review               | `skeptical-reviewer`    | **top tier** (override)           | high                      |
| Task implementation           | `sdd-implementer`       | implementation tier               | high                      |
| Close-out task                | `sdd-implementer-fable` | top tier                          | medium                    |
| Per-task and phase review     | `skeptical-reviewer`    | implementation tier               | high                      |
| Pre-merge sweep               | `skeptical-reviewer`    | implementation tier               | high                      |
| Orchestration and bookkeeping | the session itself      | session tier                      | medium                    |

<!-- Spec 018 ran stepped down to Opus 5.5 throughout at the person's
request (2026-09-23, low Fable allowance); restored at 018's merge,
2026-09-24, at the person's word: "The next spec can go back to Fable
since we're coming up on the allowance reset later today."

Trial, at the person's request on 2026-09-24, starting with the spec
after 018 (the next one planned): the plan-and-tasks draft row runs at
the implementation tier with no override. The sign-off stays at the top
tier, so a planner that needed the stronger model shows up as a
sign-off that keeps finding blocking problems. That spec's tier log
must record the trial as starting there; revert the row only if the
person says so. -->

**Moving a role.** Edit its row, nothing else. To step a role down,
replace **top tier** (override) with "implementation tier (no
override)"; the dispatch then carries no override and the agent runs at
its own default. To change the implementer, change the agent name in
that row — both definitions stay installed, so it is a word, not a
reinstall. Under the Opus profile the top tier _is_ the
implementation tier, so the overrides become no-ops and the close-out
row reads `sdd-implementer` at high; nothing else in the table
changes.

**A change the person asks for gets written here before it is acted
on.** If they say to move a role — for one window, for this project,
for good — edit the row, note it in the current spec's tier log with the
date and which spec it changed at, and commit, in the same turn,
_before_ the next dispatch. Then do it. A model preference that lives
only in a session's context is gone at the next session boundary and the
next session will not know it ever existed, which is the one failure
this whole repo-as-interface arrangement exists to prevent. If the
person frames it as temporary ("while my allowance is low"), write the
row with the condition and the date in the comment, so whoever reads it
next knows when it stops applying and can ask. Never infer the end of a
temporary change and revert it unasked.

<!-- Why the two rows most likely to be questioned read as they do.

Task implementation sits at the implementation tier because it was
measured there: with the implementer at the top tier's model at medium,
cost per completed task matched within noise, first-try rate matched,
and the top tier's separate allowance drew about a fifth more per task.
The honest limit is that it was measured on bounded transcription
against a fast automated check, the case least likely to reward a
stronger model, so a project whose tasks are genuinely hard is the open
question this row exists to let someone answer. Ask it once, at project
setup; don't re-open it per spec.

Close-out sits at the top tier because it writes the ROADMAP.md and
DECISIONS.md entries, the acceptance evidence and the spec summary —
synthesis and prose, the same work the top tier earns its place on
everywhere else. Its cost depends mostly on its bundle, not its model.
On the same model, one close-out that read the documents and hunted its
own evidence cost $12.38 over 111 turns. Another, handed the evidence
with full reads forbidden, cost $0.99 over 24 turns. So the close-out
bundle carries per-criterion evidence, the walkthrough record, the tier
log, the spec summary and the ROADMAP entries, and the dispatch says not
to read spec.md, plan.md or tasks.md in full. -->

- **The session runs at the session tier, at medium effort**, set in
  this repo's `.claude/settings.json` — written at project setup from
  the profile's settings file in the skill's `project/.claude/`
  (`"model"` set to the session tier's full ID, `"effortLevel":
"medium"`, and a level under `"modelSettings"` for each tier's full
  model ID). If that file is missing or lacks these
  keys, recreate it from the template and commit it before dispatching
  anything; nobody creates it by hand. Project settings outrank user
  settings, so a model picked in the app's picker only affects the
  session it was picked in — new sessions in this repo start here
  regardless. The app's effort indicator may show the model's default
  rather than the level in effect; `/effort status` inside the session
  is the authoritative check. The orchestrating session takes many
  bookkeeping turns and re-sends its whole context on each one — the
  dominant cost of the workflow — and it makes no design decisions: it
  assembles bundles, dispatches, verifies, commits, and reports. The
  role never needs the top tier. Under the Fable profile it sits on
  the top tier's model. Measured in this seat, Fable 5.1 at medium cost
  about a third per task of Opus 4.8, and close to Opus 5.5 ($1.10
  against $1.34) while taking about a third of the turns. The skill's
  design record has the numbers. Under the Opus profile it sits on Opus
  5.5, and the same discipline about turns applies.
  If it drops the protocol (a skipped review, a stale `tasks.md`
  edit, a task done by hand), the first fix is high effort, one line
  in the same file.
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
- **The top tier runs only where the role table says it does**: as
  the table now reads, the `skeptical-reviewer` on plan/tasks sign-off
  and on decision reviews, and the close-out dispatch (the
  `sdd-planner` row is stepped down on trial; see the comment under
  the table). The sign-off and decision-review dispatches carry an
  explicit per-call override to the top tier's name; drop the override
  and the definition's own implementation tier applies, which is
  exactly what stepping one of those rows down means. The agent definitions carry
  `effort: high`, which overrides the session's medium, so reasoning
  stays at full strength where it matters.
- **Spec conversations happen in a Claude Code spec session of their
  own**, at the top tier, never inside an implementation session. The
  spec session also runs planning once `spec.md` is approved — the
  planner dispatch, the sign-off, the spec-conformance summary — and
  ends when `plan.md` and `tasks.md` are final, with a new session
  (not `/clear`, which keeps the model) whose opening prompt is the
  spec session's last message. A session in this repo opens at the
  session tier — the top tier's model at medium — so a spec session
  states its model and effort first (`/effort status`) and asks the
  person to raise effort to high for this session (`/effort high`)
  before continuing. The next session opens at medium again from
  `.claude/settings.json`. (The project's very first spec, with no
  codebase yet, happened in chat.)
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
- **Implementation runs in the subagent the role table names** — the
  task implementation row for ordinary tasks, the close-out row for
  close-out — one task per dispatch, sequentially. Neither is
  re-decided per spec: the table is the answer until the person changes
  a row. The orchestrating
  session triages each task, dispatches routine ones on a task bundle
  assembled with shell (task line, plan section, acceptance criteria,
  files, the pattern file to copy), and on return verifies with the
  verification command below — re-run by the orchestrator for tasks
  marked `review: per-task`, taken from the implementer's verbatim
  output otherwise — never by re-reading the diff. Only the
  orchestrator edits `tasks.md` or commits, and the orchestrator never
  implements second-look notes or does device or browser checks by
  hand.
- **The close-out bundle carries the evidence**, so the close-out never
  goes looking for it. The orchestrator assembles it with shell, as for
  a review bundle: each acceptance criterion with the test names or
  Done notes that satisfied it, the walkthrough list and what the
  person said at each pause, the tier log, the spec's summary and its
  decided lines, the `ROADMAP.md` entries this spec touches, and the
  previous spec's `DECISIONS.md` section as the shape to copy. The
  dispatch says not to read `spec.md`, `plan.md` or `tasks.md` in
  full. The close-out runs before the pre-merge sweep, so the sweep
  verifies it instead of pre-dating it.
- **A device or browser pass runs outside the implementer.** Both
  implementer definitions have no simulator or browser tools, so a
  task whose Verify criterion needs one gets it from the person's
  walkthrough at the phase pause, or from a general-purpose agent the
  orchestrator dispatches for that check alone — never from the
  implementer's report read as if it had looked. Such a pass costs
  mostly re-read context, so: fold waits into the next call (`sleep 2
&& <screenshot>`, or wait on a condition) rather than spending a turn
  on a bare sleep; split a long pass into one dispatch per checklist
  section, each given only its section and returning a short pass/fail
  list; and leave the pass only what needs eyes — a check with a
  deterministic answer (an element exists, a label reads right, a
  click lands on the right page) goes into the automated UI tests the
  plan names, where it runs every build for nothing. The pass keeps
  layout, motion and feel. A smaller model or lower effort is not the
  lever; the bill is cache reads.
- **One implementation session per spec.** It opens when `plan.md` and
  `tasks.md` are final and ends at the merge; a phase pause is a pause
  in it, not a boundary — the person attests and says continue.
  `/compact` if the context grows large; never clear or compact
  mid-task. `/clear` is not part of the workflow: both session
  boundaries are new sessions.
- **Two pauses end with a continuation prompt, and only two**: plan and
  tasks final, and the merge with the next spec waiting on
  `ROADMAP.md`. At those the report's last item is the exact prompt to
  paste into the next session, in its own fenced block. It names the
  spec directory, the files to read, where to resume, the involvement
  level, the pause cadence, and any effort switch the next session
  needs. Write anything the next session needs to a file first; the
  prompt points at files. If nothing can proceed until the person
  decides something, say so instead.
- **A phase pause never ends with a continuation prompt.** The phase
  report ends with what to check in the app and how to say continue —
  nothing else. The session cannot know whether the person is about to
  stop, so a rule conditioned on that produces a prompt at every phase,
  which is what this line exists to prevent: the spec runs in one
  implementation session, and a prompt offered unasked invites a
  `/clear` that costs a re-read and buys nothing. If the person says
  they are stopping, or asks for a prompt, write one then, as the next
  message — the resume form from the first unchecked task. Asked for,
  it costs one turn; volunteered, it costs the session.
- **Batch the bookkeeping**: commit, checkbox, and tier-log row in one
  shell command; bundle assembly and dispatch back to back. Every turn
  saved is one fewer re-send of the whole context.
- **Fallback** (Fable profile): if the top tier's usage budget runs
  out, dispatch the planner and sign-off at the implementation tier for
  the rest of the window (drop the override; both definitions default
  to `opus`), switch the session itself to `claude-opus-5-5`
  mid-session (`/model claude-opus-5-5` — one cache re-write, then
  continue), and dispatch `sdd-implementer` for any row that names
  `sdd-implementer-fable`, including close-out. This is the whole role
  table stepped down at once, and it is the automatic form: it fires on
  the allowance, for the rest of the window, and the rows are not
  edited. A step-down the person _asks_ for is the other form — it
  edits the rows and persists until they say otherwise. Don't confuse
  them, and don't silently revert one the person asked for. Either way
  the tier log records what ran and when the switch happened.
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
- **A spec's implementation never goes to `main` directly.** Its code,
  its files under `specs/<NNN>-<slug>/`, and any README change
  describing its behavior live on that spec's branch and reach `main`
  through its PR.
- **Work that isn't a spec's implementation commits straight to
  `main`, and doesn't need to ask.** Roadmap grooming, a `DECISIONS.md`
  entry, a constitution amendment, a docs or README correction
  unrelated to a spec in flight, a design brief, the written residue of
  a conversation that didn't become a spec, tooling or config no spec
  touches. None of this has a spec branch, and none of it deserves one
  — a branch and a PR for a roadmap paragraph cost more than they
  protect, and stopping to ask costs a turn and interrupts the
  conversation that produced the change. The test is whether the change
  implements part of some spec's `tasks.md`, not whether the file
  appears on a list. If it doesn't: commit it to `main`, push, and say
  so in the report. This line is the permission; don't ask for it
  again. The one amendment that fails the test is the one a spec
  needs — a clause that describes a vocabulary, a rule or a file that
  exists only on that spec's branch. It rides the branch as the spec's
  first commit, before any code, so `main` never asserts what its own
  code rejects, and arrives with the spec (decided at spec 019's
  sign-off; spec 017 did the same).
- **Branch anyway when the change wants a diff someone will look at** —
  a dependency bump, a refactor with no spec behind it, anything where
  being wrong is expensive or awkward to unwind. Use
  `fix/<short-description>` or `chore/<short-description>`, not the
  spec `<NNN>-<slug>` convention, and open a PR. Size and risk decide
  this, not whether the work counts as "a spec."
- Open the PR as a draft immediately after pushing the branch, for a
  running diff. Only mark it ready and merge once every task in the
  spec's `tasks.md` is complete and verified.
- Marking ready has a close-out step, before any pre-merge review
  sweep: update `ROADMAP.md` (drop or annotate what this spec shipped,
  add follow-ups it surfaced) and the README if user-facing behavior
  or setup changed. README changes describing this spec's behavior
  ride the spec branch. It is dispatched on the close-out bundle
  described under model policy.
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

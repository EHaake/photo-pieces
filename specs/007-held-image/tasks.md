# Tasks: The Held Image and the Pause

**Status**: Signed off (skeptical-reviewer, 2026-09-03, sixth pass) —
awaiting the product owner's approval of the spec-conformance summary
**Implements**: plan.md in this directory

Ordered, small, independently verifiable. Per the constitution: every
implementation task ends with an actual build and test run reported,
not summarized. The existing 173-test suite stays green through every
task — no weakening tests to pass. Review cadence (product owner):
the skeptical-reviewer after each task in Phase 0, scoped to that
task's diff, the plan section it implements, and the acceptance
criteria it serves; after each phase from Phase 1 on. The person is
paused for after each phase and whenever something unexpected bears on
spec adherence. Phase 0 ends with the fixtures in place and measured,
so the first pause — the spec's "visual gate" — has something to
scroll.

Task ids: 007 = T5xx.

<!-- Once implementation starts this file has more than one writer.
Never edit it from a stale copy; prefer small targeted edits over
regenerating it; after any edit, grep the T5xx sequence and the phase
headers to confirm nothing was duplicated or dropped. -->

---

## Phase 0 — Foundation: transform, passage, fixtures, CSS, script (reviewer after each task; the person's visual gate at its end)

- [x] **T501** — The transform: `held` (container, body prose, split
      structure, `src` `alt` `side=left|right` and the `bleed` flag,
      `piece-held-prose`) and `pause` (leaf, one image, `piece-pause`
      with a `piece-pause-frame`); the descriptor generalizations —
      `rawAr`, `classes(attrs, ratios)` with `frame-landscape` /
      `frame-portrait`, `attrs.flags`, `rejectBodyImages`,
      `proseClass`, `probeAsker`, `--ar` on the wrapper; `BLOCKS`
      exported (T502's agreement test consumes it); `probeRatios` becomes
      `probeDimensions` (orientation-corrected width and height, the
      ratios derived at the call site, dims as `sizing`'s fourth
      argument) with messages naming the block; `sizing` per shape
      (the pause's from its raw pixel dimensions and ratio); the
      descriptor-model header comment updated to the four-argument
      `sizing` (`needsRatios` and `emitsAr` keep their names —
      deliberately, they still describe what a block asks for); `tests/fixtures/square.jpg` from the generator. Tests
      per plan.md's strategy, each shown to fail with its rule broken.
      _Verify: vitest — the new cases green (`--ar: 1.6` for photo.jpg,
      `frame-landscape` for the square, the pause's `sizes` exactly
      `(min-aspect-ratio: 8/5) calc(152.39vh - 15.23vmin), calc(95.24vw - 9.52vmin)`
      on photo.jpg (literally 8 × 5 pixels; the margin is vmin, so the
      hint is a calc — T504 review), every allowed
      combination and every must-fail case) and mutation-checked; 173 existing tests
      green; build green._
- [x] **T502** — The passage by body kind: `BLOCK_BODIES` exported from
      `image-meta.mjs`, `BLOCKS` exported from the transform, a test that
      the two agree (names, and `body ?? 'none'` per descriptor), `passageFor` taking a caption from
      `caption` and `images+caption` bodies only. _Verify: vitest — the
      agreement test fails when a descriptor's body or the map is
      changed (report once, restore); the existing caption cases stay green untouched (`wide` and
      `diptych` for `caption`, `strip` for `images+caption`) and a `grid`
      case joins them; passage cases for `row`, `aside`, `held`
      (prose before, no caption) and a `pause` leaf, beside the
      existing caption cases; 173+ green; build green._
- [x] **T503** — Fixtures: the sampler's held left, held right with
      bleed, and pause, with sample prose marked as such and, around the
      pause, a paragraph with an inline link and a heading (the lights
      list's check); the fog
      piece's ridgeline `wide` → `held` right with a new body of five
      fixture paragraphs absorbing the wide's caption line — enough to
      outlast the frame at the laptop viewport (the
      diptych and its introducing paragraph stay where they are), and its panorama `strip` → `pause` with
      its alt kept verbatim ("The full sweep of coastline after the
      fog cleared" — it is the image page's title) and a new paragraph
      after it, in addition to the existing "By ten the light…"
      paragraph (not the strip's "Drag sideways" line, which is false
      of a pause). _Verify: build green with the post-build barriers; the
      fog piece's image ids, pages, sidecar title, and galleries
      unchanged; `land-b`'s passage is its preceding paragraph alone
      and `pano`'s the paragraph before the pause (the T405-style dump,
      deleted); 173+ tests
      green (the fog's hold is measured at T504, once the CSS exists)._
- [x] **T504** — The CSS: the tokens (`--hold-margin`, `--pause-scale`,
      `--pause-stretch`); `.piece-held` (grid, breakout, side, bleed,
      sticky figure sized from `--ar` and the hold height, the prose
      column with no trailing air, margins not padding); the
      orientation and phone collapses to a static figure;
      `.piece-pause` (the scene's height, the centred sticky frame,
      the approach); the mats for both; the lights on
      `html[data-pause-active]`, each rule mixing from its element's
      own token; the header rule on `html[data-scene-active]`; reduced
      motion. _Verify: build green; on the sampler in the browser the
      held figure's viewport `top` measured at three real scroll
      offsets stays at `--hold-margin` while the prose passes and
      travels away at the scene's end (not merely `position: sticky`
      in computed style); the figure's max-width follows `--ar`; the fog's held frame
      confirmed to hold at 1440×900 — its five paragraphs outlast the
      frame; both new blocks matted; with `--pause-lights` forced to 0 and
      `data-pause-active` set by hand, every mixed element computes to
      its unmixed colour — compared by parsed colour components against
      a control element carrying the raw token, since `color-mix()` at
      0% serializes in the mix space; the matte comment's block list
      updated; the transform's held `sizes` assumptions (a 58% frame
      column at content width, 670px at 1160px — the exploration's
      grid) measured against the grid as drawn and corrected if wrong,
      in the transform, its test, plan.md's sizing line, and the
      sampler's sentence about the 44-character measure together, with
      the reciprocal keep-in-step note in `global.css` — naming the
      sampler's 44-character sentence too (T501, T503 reviews);
      the sampler's two holds measured too — its prose calls five and
      eight paragraphs the calibration, and the prose changes if the
      measurement disagrees (T503 review). Record: the lights were
      compared by serialized colour, not parsed components — the mix
      at 0% serialized as the token's own oklch string, an exact match
      (T504 review, deviation noted)._
- [x] **T505** — The script on the piece page: pauses' progress into
      `--pause-t` and `--pause-lights`, holds' parked state,
      `data-pause-active` / `data-scene-active`, static frames skipped,
      `will-change: transform` set on a pause's frame only while it is
      active (T504 review), init on `astro:page-load`. _Verify: on the sampler,
      `window.scrollTo` to computed offsets through the pause (before
      the pin, 14%, 28%, 50%, 86%, 100%, after) gives `--pause-lights`
      0 → 0.5 → 1 → 1 → 0.5 → 0 → 0 and the two attributes on and off
      accordingly; a parked hold sets `data-scene-active`; a collapsed
      (static) hold does not; `astro check` clean; build green.
      Record: `astro check` reported two hints, both unused `attrs`
      parameters in the transform (the pause's, from T501, and the
      strip's, pre-existing) — both renamed `_attrs`, check clean; the
      arithmetic was verified with scroll events dispatched by hand
      (the pane is hidden and never ticks a real scroll), so the scroll
      binding itself is exercised by the person at the visual gate
      (T505 review)._
- [x] **T505a** — `shape` extracted to `src/lib/pause-shape.ts` with a
      unit test (`pause-shape.test.mjs`): the ends, the held middle,
      half-way at half a ramp, smooth not linear, monotone on each
      ramp — from the T505 review; the plan's testing strategy records
      it. _Verify: vitest green; a `RAMP` or curve change fails it._
- [x] **T506** — Geometry pass at three viewports (1440×900, 1080×1920,
      375×812) on the sampler and the fog piece, judged against the
      spec's rules (not the exploration's numbers — the hold margin
      changed): each hold's frame at its resting place and share of
      the height, release when the prose's bottom meets the frame's,
      no hold where no column fits — at 1080×1920 the fog's side-right
      landscape hold with its figure before its prose, named (T504
      review); the pause's arrival distance, park
      at the centre, lights 0 → 1 → 0 with the words — the paragraph,
      its inline link, and the heading beside the sampler's pause —
      following (a link inherits its paragraph's colour), the approach with the
      margin surviving it, the header away and back; the footer's
      links and the page head looked at during a pause, not assumed
      (T504 review); the header's focus-reveal overridden during a
      scene, looked at (T505 review); reduced motion
      emulated (approach off, dim on); the 003 and 006 geometry checks
      re-run. _Verify: the measurements recorded here; any amendment a
      sub-lettered task. This phase's end is the person's visual gate._
- [x] **T506a** — A frame taller than its prose does not hold
      (acceptance criterion 3's last clause, unmeasured until the T506
      review): one held block's body truncated in the DOM to a single
      paragraph, measured at 1440×900. _Verify: the scene's height
      equals the frame's; the figure's viewport top moves with the
      page across three offsets instead of parking; `data-scene-active`
      never sets._

**T506 record.** Measured in the Chromium pane (Chrome 145; `100vw`
is scrollbar-aware there, so the 1440-wide numbers below are 1425 wide
— on a browser with a classic scrollbar and no gutter-aware `vw` the
pause scene is 1440 and about 37px stays clear at the sides, the
margin still surviving) with images forced eager, transitions
disabled, and scroll events dispatched by hand (the pane is hidden).
Resolved tokens: the matte 16.8px at 1440, 14.91px at 1080, 8px at 375;
`--hold-margin` 45px at 1440×900, 53.25px at 1080×1920, 24px at 375×812.

_1440×900 (the laptop)._ Sampler held left (3:2): sticky at 45px, frame
643 × 440 (the column governs; the height cap would allow 1198), prose
431 wide × 809 tall = the scene's height (no trailing air); the frame's
top at 45px through two offsets inside the hold and at −155px with the
scene's bottom exactly at the frame's bottom after it — release when the
prose's bottom meets the frame's. Held right bleed (2:3): frame
551 × 810, the full hold height, height-capped exactly as the formula
gives; prose 1139 tall; the same three-offset pattern. Fog held right
(3:2): 643 × 440 against 778 of prose — holds, with 337px of hold
scroll. T506a, the short body: prose 182 against a frame of 440, the
scene 440 tall, the figure's top equal to the scene's top at all three
offsets (145, −15, −155 — it moves with the page), the attribute never
set. Pause (pano.jpg, 2400 × 800 — 3:1 to the pixel; the 447 below
against the formula's 446.2 is the generated variant's rounded
intrinsic ratio): the frame in the flow 48px below the last paragraph
(the block margin, no empty stage) and 48px above the next; 1271 × 447
pinned at 227px = the centre; through the stretch the lights read
0 → 0.501 → 1 → 1 → 0.498 → 0 → 0 at p = −0.2, 0.14, 0.28, 0.5, 0.86,
1.0, 1.2, the two attributes on at every sampled offset inside the
stretch and off at both outside (the script's own condition is
0 < p < 1 — the whole pinned stretch, not the ramps); at the middle the
frame is scaled 1.05 to 1335 wide with 45px still clear on the left (the
margin survives the approach), and the ground, the paragraph before, the
paragraph after, its inline link, the heading after, the page head's
title, lead, date, and category link, the footer's text, links, and
hairlines, every figcaption, and both new blocks' mats compute to the
quiet colour; the header is translated away (bottom at 0) and focus into
the nav mid-pause does not bring it back (the recorded override); after
the stretch every colour is its token again, the frame travels with the
scene's end, and a scroll up brings the header back. The header rule
is one unconditional `html[data-scene-active] .site-header` that never
consults `data-hidden`, so the away state measured here (mid-pause,
mid-hold at 1080, under focus) is the mechanism at every viewport and
in both scroll directions. Without script,
emulated by stripping what the script set while parked at the middle:
the ground light, the words muted, the frame's transform identity and
still sticky at 227px — the light pin. Reduced motion, emulated by
switching the real rule's media condition to `all` before scrolling in:
at the middle the frame's transform is none at its resting 1271 width
while the ground and the words are quiet — the approach off, the dim
kept; the site's other reduced-motion block touches durations only.

_1080×1920 (the portrait desktop)._ Sampler held left (3:2):
collapsed — static, one 1022px column, figure first, prose 666 (68ch)
centred, never active. Held right bleed (2:3): keeps its side — sticky
at 53px, frame 495 × 728 (the half-viewport column governs), prose 1144
tall, holds and releases as at the laptop, the attribute on inside and
off after, the header away (bottom at 0) mid-hold. Fog held right (3:2):
collapsed with its figure before its prose (the named case), the prose
column at left 200 = the piece's own paragraph column. Pause: 913 × 324
at rest = (1065 − 106.5) ÷ 1.05, width-limited, pinned at 798px = the
centre; at the middle 958 wide with 53px clear on the left, centred
(790 above and below), the header away, the mat quiet.

_375×812 (the phone)._ Every hold static and figure-first at 343px (the
column), the prose at the held reading size (16.8px — kept by design,
recorded in the plan); the pause pins sticky at 349px = the centre with
the frame 327 wide at the middle (311 at rest), 24px clear on both sides,
the lights dim the ground and the words on a phone too, the header away;
the fog's likewise.

_003 re-run at 1440×900._ Fullbleed 1425 (the viewport), wide 1160,
half-bleed 1045, match-height pair 306 = 306, triptych 207 × 3, strip
band 405 (≤ 420), row columns 340px + the rest, single matted 16.8px,
fullbleed unmatted, aside floated; at 375 the row collapses figure-first.
_006 re-run on land-b's page._ Built sections in the spec's order
(story, label, record, compare, passage, related, print); the passage is
the paragraph before the held block with no caption element — and the
same on pano's page, whose passage is the paragraph before the pause (it
ends in a colon: for the Phase 0 report); quiet view on a click fills
the viewport (1259 × 839 of 1440 × 900) on the quiet ground and Escape
restores it; no scene attribute or `--pause-lights` on the image page.

No amendment needed: every measurement matches the spec's rules as the
plan states them. The scroll binding itself, and the hand-off's feel, are
the person's at the visual gate — the one thing the pane cannot exercise.

## Phase 1 — Plugin and docs (reviewer after the phase)

- [ ] **T507** — Obsidian plugin: `pause: one` in the leaf list, so
      Live Preview renders a pause as its image; `held` stays raw text
      like every container (`main.js` is gitignored — the author's
      local build). _Verify: `npm run build` in `obsidian-plugin/`
      succeeds; the README's block table and AUTHORING's raw-text list
      say so._
- [ ] **T508** — Docs: `AUTHORING.md` (both directives, the shapes, the
      hold's honesty — write enough for the frame or don't hold it —
      the pause's nothing-to-read rule, no hold where no column fits,
      `held` in the Obsidian raw-text list, and in "Hard-won syntax
      rules" that `bleed` is a flag on `held` and an enum on `wide`;
      a story is prose — no holds or pauses in a sidecar; the image
      page's passage quotes a caption from caption-bodied blocks only —
      a `held`, `row`, or `aside` body never appears there, T502
      review; the sampler's site-absolute link after its pause is the
      one exception to the vault-relative practice, written so because
      the rewrite doesn't exist yet, T503 review);
      `README.md`'s block table gains both rows; `DECISIONS.md` records
      the exploration's decisions (words beside, never over or under;
      script-driven pause; frames sized by ratio, not `sizes`; margins
      not padding; orientation rules; the passage by body kind).
      _Verify: Prettier clean; the examples in AUTHORING.md build when
      pasted into a temporary piece (reverted)._

## Phase 2 — Close-out (reviewer sweep, then merge)

- [ ] **T509** — Delete `src/pages/held-demo.astro` and the exploration
      branch `explore/held-block`; update `ROADMAP.md` (the held image
      shipped with the shapes as they are — it still lists "below" and
      a scroll-driven pause; follow-ups it surfaced; `CLAUDE.md`'s
      closed-vocabulary list was amended at T501, in its own commit;
      the fog-frames gallery's description still says "spec-003 demo
      piece" — the same spec-number leak the sampler lost at T503);
      request the
      pre-merge whole-spec sweep and resolve its findings; build,
      tests, check, GPS scan, and format all green — actual output
      reported; mark the PR ready and merge with a merge commit.
      _Verify: no `/held-demo/` route in the build; the branch is gone
      from the remote; ROADMAP matches the spec; the sweep came back
      clean or its findings were resolved; main green after the
      merge._

---

## Tier log (the first spec under the model policy)

<!-- The constitution's model policy (adopted 2026-09-04, mid-spec)
decides which tier runs each task at dispatch time. Recorded here: token
usage from each subagent return — implementer runs and reviewer
invocations alike — any escape-hatch miss, and, if the third tier is
on, which tasks it took. Phase 0 (T501–T506a) ran BEFORE the policy:
the orchestrating session implemented every task itself at the top
tier, and each reviewer invocation ran at the reviewer's default tier
with the diff in a scratch file plus pointers into plan/spec (not a
single bundle). Compare the spec's total against spec 006 before
treating the policy as settled. -->

| Task / invocation              | Tier             | Tokens                   | Outcome / miss reason                                       |
| ------------------------------ | ---------------- | ------------------------ | ----------------------------------------------------------- |
| plan/tasks sign-off (6 passes) | reviewer default | —                        | pre-policy; not logged                                      |
| T501 (implementation)          | top tier         | —                        | pre-policy: orchestrator implemented                        |
| T501 review ×3                 | reviewer default | 98,327 + 64,311 + 32,169 | fix and re-review ×2, then signed off                       |
| T502 (implementation)          | top tier         | —                        | pre-policy                                                  |
| T502 review                    | reviewer default | 52,260                   | signed off                                                  |
| T503 (implementation)          | top tier         | —                        | pre-policy                                                  |
| T503 review ×2                 | reviewer default | 62,757 + 56,129          | fix and re-review ×1, then signed off                       |
| T504 (implementation)          | top tier         | —                        | pre-policy                                                  |
| T504 review ×2                 | reviewer default | 103,409 + 66,801         | fix and re-review ×1 (three blocking hint/cascade findings) |
| T505 (implementation)          | top tier         | —                        | pre-policy                                                  |
| T505 review ×2                 | reviewer default | 72,243 + 50,281          | fix and re-review ×1, then signed off                       |
| T506 (measurement)             | top tier         | —                        | pre-policy                                                  |
| T506 review ×2                 | reviewer default | 96,435 + 47,934          | fix and re-review ×1 (T506a), then signed off               |

## Handoff note

> Read `CLAUDE.md` and `specs/007-held-image/{spec,plan,tasks}.md`,
> then begin at T501. Involvement level is product owner. For Phase 0,
> have the skeptical-reviewer review after each task, scoped to that
> task's diff, the plan section it implements, and the acceptance
> criteria it serves. From Phase 1 onward, review after each phase
> instead. Pause for the person after each phase, and whenever
> something unexpected bears on spec adherence.

Every pause produces a report in this shape, in this order. The person
may not be technical, and the report exists so they can act, not so
the work is documented:

1. **Why this pause** — a phase boundary, a spec-adherence question, or
   an escalation trigger. One line.
2. **What you can now do** — behavior that exists and can be tried,
   stated as a user would experience it, so attestation is possible.
3. **Where execution deviated from the spec, and why** — every place,
   per the "never silently" principle, not just the interesting ones.
4. **What needs your decision** — product questions only. Technical
   detail lives in plan.md and the commit log for anyone who wants it;
   it doesn't lead the report.

# Spec 019, sixth amendment — brief for the spec session

Written 2026-10-22 by the implementation session, at the Phase 3e look,
so the spec session starts from the decision and not from that
conversation. Working material: the amendment goes into `spec.md`,
`plan.md` and `tasks.md`, and this file is deleted once they carry it.

## What was asked, and decided

At the Phase 3e look the last question was a gap the fifth amendment
left open on purpose (plan.md, Known limitations (amendment 5): "A typo
of `none` is never measured"). `none` is the word for no place, so the
near-miss guard never measures a name against it; `at: nnoe` is a slug
with no file, so it quietly makes a place called "Nnoe" — a card on
`/places/`, the photograph's label linking there — and the only trace
is the build's made-place note.

Put to him in plain words: should a name one letter off `none` be
refused too? The cost named: a real place one letter off `none` (Nome,
Alaska) would be refused until its file is written. Recommendation: yes
— `none` is the one word typed on many sidecars, and the cost is rare.
He asked first why typos are refused at all (answer: a name now makes a
place, so a misspelt one would make a second place silently), then:

> Ok, yes then

## What it changes, as the implementation session sees it

- **AC 43** (the near-miss refusal) gains the case: an `at:` with no
  place file that is one letter off `none` is refused as a probable
  typo of `none`.
- **The way past** stays the guard's: correct the spelling, or, if it
  really is a place, write its file — a name with a file is never
  measured, so `nome` with `src/content/places/nome.md` builds.
- **The constitution's Places clause** already says "the build refuses
  a name … that is a near miss of another place's". Whether `none`
  needs naming there is the spec session's call; if it does, the
  clause rides the branch as this amendment's first commit.
- **The code**, likely small: `nearMissProblems` (`src/lib/image-meta.mjs`)
  measuring each name with no file against `none` as well, with its own
  message; its cases in `image-meta.test.mjs`; one one-time build;
  `AUTHORING.md`'s guard paragraph and README's Place paragraph; the
  plan's Known limitations line withdrawn.

## Left for the spec session to settle

- The message's words (it should say "none" is the word for no place,
  and give both ways past).
- One letter only (as `none` is four characters, the existing short
  rule already gives one), or something else.
- Whether a draft's `at:` is measured too, as the guard reads every
  `at:` today (the answer is presumably yes, for the same reason).

## Everything else at the look was kept

His answers, 2026-10-22: the made page keeps its line of counts ("Yes",
after asking whether "2026" meant the wall is split by year — it is
not: the wall is one continuous scroll, oldest first, and the year is
the span of the visits, a range once they cross years); the `place`
template keeps starting `draft: true` ("That's fine"); the title rule
and its small words, the guard's one-and-two-letter limits, the two
notes' words and grouping, and `AUTHORING.md`'s "Places" ("All yes").

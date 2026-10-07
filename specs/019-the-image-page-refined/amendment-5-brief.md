# Spec 019, fifth amendment — brief for the spec session

Written 2026-10-06 by the implementation session, at the Phase 4 wait,
so the spec session starts from the decision and not from this
conversation. This file is working material: the amendment itself goes
into `spec.md`, `plan.md` and `tasks.md`, and this file is deleted or
kept as the session decides.

## What he asked, and decided

Asked, as he was about to write his first piece — a photograph called
"Falls Creek Falls", at a place of the same name:

> I think most photographs should belong to a place automatically. Can
> we have it so that if I create a photograph piece before the place
> piece exists, it makes it automatically?

Three options were put to him: the site makes the place page itself;
the Obsidian plugin creates the place's file; keep the rule as it is.
The recommendation was the first, with two guards against typos, and
an auto-made place listed on the places index straight away. His
answer:

> Go with option 1, go with the recommendation.

The recommendation as he read it, in plain words:

- Naming a new place in a photograph is enough. The site builds a
  plain page for it — a title taken from the name, his photographs on
  its wall — until he writes the place's own file, which then takes
  over.
- Each build lists the places it made this way.
- A name that is one or two letters off an existing place is refused
  as a probable typo.
- An auto-made place appears in the places list straight away, since
  its wall is real content.

## What it changes

- **The constitution's Places clause** (`CLAUDE.md`, Content model):
  places are "_declared_ once … then _grown_ by the registry", and
  "the build refuses a slug with no file, listing the places that
  exist". Both sentences change. Rides this branch as the amendment's
  first commit, before any code (the rule spec 019's sign-off set).
- **Spec 009's rule** as built: the refusal in the registry, the place
  page, the places index, a place's cover, the note the build prints
  for a draft place.
- **`AUTHORING.md`'s "Places"** and the photographs folder's `at:`
  paragraph; `README.md` where it states the rule; the `place`
  template's role (now what he writes when he has something to say).

## How it serves the purpose

Against `VISION.md` and the constitution's test: a place is one of the
ways a visitor goes deeper from a photograph, and the photographer's
writing is the larger work — the site should not make him declare a
file before a photograph can lead somewhere. It must not become what a
gallery does by default (a tag page): the auto-made page is a place's
wall waiting for its writing, and says nothing it was not told.

## Left for the spec session — to settle with him or to decide

Product questions (his):

1. **"Most photographs should belong to a place automatically."** Is
   naming the place in the photograph enough (what was recommended and
   accepted), or does he also want the build to say which photographs
   name no place at all? Nothing is inferred from camera metadata —
   the constitution's rule, and GPS is never read.
2. **The title.** `falls-creek-falls` → "Falls Creek Falls" is easy;
   `the-jetty` would read "The Jetty" where his own file says "The
   jetty". Title case from the slug, or something else, until he
   writes the file?
3. **What the auto-made page says besides its title.** Nothing; or one
   quiet line. And what its card on the places index shows where a
   declared place shows its description.

Design questions (the plan's):

- The cover of an undeclared place (a declared one may name it).
- A journal entry's `at:` default naming an undeclared place — the
  same rule as a sidecar's line, presumably.
- A place whose only frames are drafts: no page, as a declared place
  with no published frames behaves today.
- A declared place file with `draft: true` stays what it is today ("no
  page, and its frames show no place") — declaring a draft is how he
  holds a place back; an undeclared place cannot be a draft.
- The near-miss guard: distance one or two, against declared and
  auto-made places alike; two undeclared names near each other (which
  is the typo?); short slugs, where two letters is most of the word;
  the message, naming both files and both spellings; how he overrides
  it when two real places are that close (declaring both files is the
  natural answer).
- The build's list of auto-made places: one line per place with its
  frame count, in the summary `sh scripts/verify.sh` prints.
- A gallery or a place `cover` that names an undeclared place's frame;
  search; the lexicon barrier's scans over the new pages; the
  photograph page's "At …" line and wall label for an undeclared place.
- The plugin: nothing asked. Obsidian's autocomplete for `at:` already
  offers the values written elsewhere.

## State of the spec when this was written

- Branch `019-the-image-page-refined`, draft PR #19, `main` merged in
  (the vision, the roadmap entries).
- Done since the fourth amendment: Phase 3d (T1748–T1753 and rounds
  T1753a–c), and two rounds under the authoring look — T1735d (Obsidian
  templates) and T1735e (a blank field means not set, reviewed).
- Open: the looks T1729, T1735 and T1745 (held open by him); Phase 4
  (T1716, T1717 — his piece, being written); Phase 5 (T1718).
- Task ids continue from T1753; the amendment is a new phase before
  Phase 4 (Phase 3e), with its own look, as 3d was.
- His piece does not wait on this: he creates `falls-creek-falls` from
  the `place` template in the meantime, and that file simply takes
  over once the amendment lands.
- The session model: this implementation session ran on
  `claude-opus-5-5` from 2026-10-02 (switched outside the session;
  tier log). The spec session checks `/effort status` and its model
  first, as the constitution says.

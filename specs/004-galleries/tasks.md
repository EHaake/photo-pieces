# Tasks: Galleries and Image Pages

**Status**: Draft — pending review
**Implements**: plan.md in this directory

Ordered, small, independently verifiable. Per the constitution: every
implementation task ends with an actual build and test run reported,
not summarized. The existing 82-test suite must stay green through
every task — no weakening tests to pass. Review cadence: stop after
each task in Phases 0–1 (data model and registry — a dozen later files
depend on them), after each phase from Phase 2 on. The photographer's
visual gate is the end of Phase 3, when galleries, image pages, and
linked piece images can all be seen together.

Task ids continue the numbering: 001 = T0xx, 002 = T1xx, 003 = T2xx,
004 = T3xx.

<!-- Once implementation starts this file has more than one writer.
Never edit it from a stale copy; prefer small targeted edits over
regenerating it; after any edit, grep the T3xx sequence and the phase
headers to confirm nothing was duplicated or dropped. -->

---

## Phase 0 — Foundations (review after each task)

- [x] **T301** — Amend CLAUDE.md (constitution rule: own commit, before
      implementation): the Content model gains the **image registry**
      (auto-derived over every accepted raster in published pieces and
      the `gallery-images` root — distinct from galleries, which stay
      hand-curated) and the `src/content/gallery-images/` root beside
      co-located piece images; `exifr` joins the Dependencies section
      with its one-line justification (build-time only, zero transitive
      deps, GPS never read). _Verify: the commit touches only CLAUDE.md;
      the wording names the registry as derived and galleries as
      curated, in that contrast._
- [x] **T302** — Pure core, part one — `src/lib/image-meta.mjs` +
      `src/lib/categories.ts` (the category enum extracted; both
      collections import it in T304): `imageIdFor(path)` for both
      callers' input forms (root-absolute glob keys and the transform's
      `file.path` + `src`), folder-must-be-a-slug failure with a rename
      hint, nested-path rejection, accepted-extension list, collision
      detection over a list of paths, `firstAltFor(body, basename)`
      (shorthand `![alt](./x)`, `src=… alt=…`, and the pair/triptych
      `…Alt` attributes) for the image-page title fallback. _Verify:
      vitest — id derivation identical for the two input forms on the
      same file; `Jetty Dawn/` fails with the hint; `./detail/img.jpg`
      fails; `shot.jpg` + `shot.webp` reported together; alt recovery
      for all three forms; 82 existing tests green; build green._
- [x] **T303** — Pure core, part two — EXIF: add `exifr` (pinned);
      `readExposure(path)` with `pick` on the allowlist (Make, Model,
      LensModel, FocalLength, FNumber, ExposureTime, ISO,
      DateTimeOriginal) and `gps: false`; `formatExposure()` reconstructing `1/500 s` /
      `2 s`, `f/5.6`, `35 mm`, `ISO 400`, a formatted date from exifr's
      real value shapes (decimal exposure, `Date`); `mergeOverrides()`
      where each sidecar string wins verbatim. Extend
      `scripts/gen-placeholders.mjs` with a GPS-bearing variant (IFD3)
      and generate `tests/fixtures/gps.jpg` from it. _Verify: vitest —
      values read from `tests/fixtures/photo.jpg`'s real EXIF (or a
      generated fixture) format as specified; output object keys
      asserted **exactly** equal to the allowlist against the GPS
      fixture, and the same assertion fails if the allowlist filter is
      removed (prove it once, report it, restore); override merge;
      build green._

## Phase 1 — Content model and registry (review after each task)

- [x] **T304** — Collections and fixtures: `galleries` (`title`,
      `category` from the shared enum, `description`, optional `date`,
      optional `cover` id defaulting to the first image, `images`
      non-empty ordered ids) and `imageMeta` (a glob loader based at
      `./src/content` with pattern `{pieces,gallery-images}/**/_*.md`,
      with a custom `generateId` returning the path verbatim so
      `pieces/<slug>/_land-b` maps deterministically to `<slug>/land-b`;
      schema fields title, caption, date, camera, lens, focalLength,
      aperture, shutter, iso — all optional). Fixture content: two
      `gallery-images/` placeholders with synthetic EXIF (one **with
      GPS** — the build-level leak test's subject), two galleries over
      the demo pieces' images (a landscape set and a "best of" across
      both essays — the piece-owned back-reference cases; the layout
      galleries are T304A), two sidecars (title + caption; overrides),
      and all of it added to `specs/005-going-live/spec.md`'s unpublish
      list. _Verify: build green with the fixtures loaded; a
      deliberately malformed gallery (bad category) fails schema
      validation loudly — output reported, then reverted._
- [x] **T304A** — Example galleries graded by uniformity
      (photographer's addition at tasks review): extend
      `scripts/gen-placeholders.mjs` with a `gallery-images/` set —
      enough frames at 3:2, 2:3, 4:5, 5:8, 1:1, 16:9, and 3:1, each
      labeled with its ratio, palettes varied, synthetic EXIF — and
      four galleries, one per category, stepping from very uniform to
      very disparate: (1) landscape — all 3:2 horizontals; (2) portrait
      — all verticals, but at near-ratios (2:3, 4:5, 5:8: the "slightly
      shorter than 2:3" case); (3) street — horizontals and verticals
      mixed (3:2, 2:3, 1:1); (4) event — everything at once (3:1 pano,
      16:9, 3:2, 1:1, 4:5, 2:3, 5:8). Eight to twelve images each, the
      description naming its rung of the ladder; added to spec 005's
      unpublish list (gallery-folder fixtures are deleted, not drafted
      — they have no owning piece). _Verify: build green with the four
      galleries schema-valid (id resolution is proven by T305's
      registry); T307's browser pass then reviews the ladder end to
      end._
- [x] **T305** — The registry, `src/lib/images.ts` (thin Astro wrapper
      over T302/T303): `import.meta.glob` discovery of
      `{pieces,gallery-images}/**/*.{jpg,jpeg,png,webp,avif,tiff}`,
      draft-owned exclusion via the same `draft` definition
      `getPublishedPieces` uses, nested-file build warning, slug and
      collision failures surfaced as build errors, EXIF read, sidecar
      merge with **orphan sidecars failing the build**, gallery
      validation (missing / duplicate / draft-owned id) reporting
      **file + line** by re-reading the gallery source for the
      offending id, back-references (owning piece, galleries), a
      module-level cached promise so every `getStaticPaths` awaits one
      build, and `latestWork(n)` ordering (gallery `date` desc, gallery
      order, de-duplicated, EXIF date as tiebreak only for undated
      galleries) as a pure function in `image-meta.mjs`. _Verify:
      vitest — `validateGalleries` cases incl. line recovery and
      `latestWork` ordering; build green; each loud path demonstrated
      once with actual output and reverted: a gallery naming a missing
      id (file + line shown), an orphan sidecar, a fixture piece set
      `draft: true` (its images gone from the registry — count reported
      before/after)._

## Phase 2 — Pages (review after the phase)

- [x] **T306** — `/images/[...id].astro`: `<Image>` (constrained,
      matted), title chain (sidecar → first alt in the owning piece →
      humanized filename), wall label as a `<dl>` in the theme's
      eyebrow + hairline language, "From the piece …", "In galleries
      …", caption (markdown), category eyebrow; OG image = the image
      itself via `getImage()` (optimized output, never the original);
      header hide-on-scroll applies. _Verify: build green; count of
      `dist/images/**/index.html` equals the registry size; a
      placeholder's label shows its synthetic EXIF; the override
      sidecar's values win on its page; a `gallery-images/` image with
      no piece renders without error; the OG `<meta>` points at a
      `/_astro/` URL._
- [x] **T307** — Galleries: `/galleries/index.astro` grouped by
      category in enum order (cover, title, count), and the gallery
      page `/galleries/[slug].astro` as the plain grid — 3 columns at
      ≥ 1160px, 2 between, 1 below the shared 720px breakpoint, rows midline-
      centered, cells `a > img` matted, no cropping (mixed ratios
      accepted as-is per plan review; equal-height rows are a future
      spec if ever wanted), description, category eyebrow, cover as OG
      image; **Galleries** nav entry in `consts.ts`. _Verify: build
      green; browser-measured column counts at three widths; a
      landscape beside a portrait share a row midline; the four T304A
      ladder galleries screenshotted in order, uniform to disparate,
      for the photographer's judgement of the mixed-ratio grid; every
      cell links to the right `/images/` URL; nav shows Galleries._
- [x] **T308** — Category browsing: `/categories/[category].astro`
      (that category's galleries as cards, then its pieces via
      `PieceList`); category eyebrows on piece, gallery, and image
      pages link there; `/pieces/` gains a category link row; nothing
      added to the nav. _Verify: build green; all four category pages
      exist even when one is empty (renders an honest empty state);
      every eyebrow resolves; `NAV_ITEMS` unchanged by this task._
- [x] **T309** — `src/components/LatestWork.astro` (a strip of the N
      newest curated images from `latestWork`, each linked) plus a
      temporary review page at `/latest-review/` (an underscore-prefixed
      route is excluded from routing, so not `/_latest/`) that **T314
      deletes before merge**. _Verify: build green; the temp page shows the expected
      order for the fixture galleries' dates; the component is imported
      nowhere else._

## Phase 3 — Piece images as links (review after the phase; photographer's visual gate)

- [ ] **T310** — Transform: wrap every emitted image node and every
      shorthand `image` node not already inside a link in an mdast
      `link` to `/images/<piece-folder>/<basename>/` (folder from
      `file.path`; comment on why `withBase` can't apply here);
      `alt=""` images not wrapped; remote and root-absolute `src` left
      to Astro and not wrapped; `src` containing `/` fails loudly;
      `--ar` style and `class="image-link"` on the anchor. _Verify:
      vocabulary suite — every block's images wrapped to the derived
      URL (`/images/fixtures/photo/`), shorthand wrapped, `alt=""` not,
      `--ar` on the anchor, subfolder fails with file + line, remote
      not wrapped; 82 legacy + vocabulary tests green; build green._
- [ ] **T311** — CSS: the matte moves to the anchor for every matted
      block (background + padding on the anchor; the img inside becomes
      `display: block; width: 100%`), with every retarget the plan
      enumerates (match-height flex + `--ar` → anchor; strip's sizing →
      anchor with `height: 100%` re-applied to the img; tall keeps
      `width: auto; max-height` on the img under an `inline-block`
      anchor; grid/collapse `img` rules → `a > img`;
      `.prose > p > img` → `.prose > p > a > img`;
      `a.image-link` drops the theme underline and gains the site focus
      ring). Then **re-run the full 003 geometry pass**. _Verify:
      browser-measured — mats on anchors everywhere the 003 map says
      matted and nowhere else; `match="height"` heights equal to the
      pixel with mats; midline centering; wide/fullbleed pair spans;
      strip scroll + focus; aside wrap; every block's mobile collapse;
      caption alignment on bleeds; keyboard focus ring visible on an
      image link; build green; screenshots delivered for the
      photographer's review of galleries, an image page, and a linked
      piece together._

## Phase 4 — Proof, docs, close-out

- [ ] **T312** — GPS leak scan: `scripts/check-no-gps.mjs` parses EXIF
      from every `dist/**/*.{jpg,jpeg,webp,avif,tiff}` with `exifr` and
      exits non-zero on any GPS block; wired into `postbuild` after
      pagefind and therefore into CI's build step. _Verify: the scan
      passes on the real build with the GPS fixture present in source;
      a GPS-bearing file planted in `dist/` makes it fail (actual
      output reported, then removed) — the check can fail for its named
      reason._
- [ ] **T313** — Docs: README (galleries, image pages, sidecars, ids —
      a syntax table for gallery and sidecar frontmatter); AUTHORING.md
      (a piece folder is public territory; EXIF must survive the web
      export, with the sidecar as the correction path; image ids and
      the move/rename URL consequence; gallery curation); DECISIONS.md
      (`exifr` over sharp-plus-decoder; category pages as one route
      family; mixed-ratio grid rows accepted, equal-height deferred);
      plan.md status → implemented with any corrections made in place;
      spec.md acceptance boxes checked against actual behavior.
      _Verify: build green; grep finds no doc describing galleries or
      image pages as future._
- [ ] **T314** — Close-out: delete the `/latest-review/` page; update
      `ROADMAP.md` (galleries shipped; the rich image detail page entry
      points at 004's id/URL/metadata model as its base; category
      filtering no longer deferred) — on the spec branch per the
      constitution's never-commit-to-main rule; run the pre-merge
      skeptical-reviewer sweep over the whole spec and resolve its
      findings; mark PR #4 ready and merge with a merge commit.
      _Verify: `grep -r latest-review src` empty; ROADMAP no longer lists
      this spec's work as future; the sweep came back clean or every
      finding is resolved or explicitly deferred with a reason; all
      boxes above checked; CI green on the merged commit._

---

## Handoff note

> Read CLAUDE.md and specs/004-galleries/spec.md, plan.md, tasks.md,
> then begin at the first unchecked task. Stop for review after each
> task in Phases 0–1, after each phase from Phase 2 on. The end of
> Phase 3 is the photographer's visual gate — expect knob-tuning
> feedback (grid density, label typography, matte-on-anchor feel)
> before Phase 4. Transform changes need a dev-server restart and a
> cleared `.astro/data-store.json`.

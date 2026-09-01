# Authoring Environment: Obsidian Setup & Usage

Reference for how the writing environment is set up and why. The piece
_format_ (frontmatter fields, directive syntax) is documented in
`README.md`; this file covers the vault around it.

## Vault layout

The vault is a **parent** of the repo, not the content folder itself:

```
~/photo-brain/                  <- Obsidian vault root
├── photo-pieces/               <- this repo, a normal git clone
│   └── src/content/pieces/     <- published pieces live here
├── notes/                      <- private second-brain material
└── templates/                  <- Obsidian template files
```

Why this shape:

- **Astro only reads its configured content directory**, so nothing
  outside `src/content/pieces/` can leak into the built site.
- **Private notes live outside the repo entirely** — shoot planning,
  location scouting, gear research, journal fragments. They can never
  be committed by accident because git never sees them. No `.gitignore`
  discipline required.
- **One vault means one graph.** A scouting note can link to the piece
  that came out of that trip; the graph grows across private and
  published material together.

## Obsidian settings that matter

- **Files & links → "Use Wikilinks": OFF.** Obsidian then writes
  standard markdown links, which the Astro build can parse. The `[[`
  autocomplete still works exactly the same — it just inserts a
  portable link instead of wiki syntax.
- **Files & links → Excluded files:** add `.git`, `node_modules`, and
  `dist` so search, the graph, and link suggestions don't drown in
  repo machinery.
- **Core Templates plugin:** point it at `templates/`, and keep a
  `piece.md` template there (skeleton below).
- **Community plugins → Photo Pieces Blocks: enabled.** Renders
  `::fullbleed{...}` as an image while writing. Live Preview only —
  Reading view is intentionally out of scope (see `DECISIONS.md`).
  Install/rebuild instructions: `obsidian-plugin/README.md`.

## Piece template

Contents for `templates/piece.md` — frontmatter is simultaneously the
Astro schema (build-validated) and Obsidian's Properties panel, so
there is no separate metadata system to maintain:

```markdown
---
title:
publishDate:
categories: []
description:
cover:
draft: true
---
```

`categories` values: `landscape`, `street`, `portrait`, `event`.

## Hard-won syntax rules

Learned by breaking them — each of these fails quietly if violated:

- **`---` must be the literal first line of the file** or frontmatter
  doesn't parse anywhere, in Obsidian or the build.
- **Directives go on their own line.** The Obsidian plugin's regex
  tolerates a directive mid-paragraph; the real remark pipeline does
  not — it will render as literal text on the site.
- **Images must live in the vault**, in the piece's own folder
  (`src/content/pieces/<slug>/`). Absolute OS paths (`~/Downloads/...`)
  resolve nowhere — not in Obsidian's preview, not in the build. The
  plugin's dashed "not found" box is telling the truth about what
  production would do.

## Linking practice

Type `[[`, pick the note, and a standard markdown link gets inserted.
Those links feed backlinks and the graph the same as wiki-links would —
no Obsidian feature is lost by the wikilinks-off setting.

One known seam: a link from one piece to another resolves inside the
vault but is not yet rewritten to its published URL
(`/pieces/<slug>/`) at build time. That transform is logged in
`ROADMAP.md` and becomes necessary the day the first cross-piece link
is written. Fine to write such links now; they just aren't live on the
site yet.

## The writing loop

Obsidian on one side, a browser tab running `npm run dev` on the
other. Save in Obsidian, the tab hot-reloads. Single images are plain
markdown (`![alt](./photo.jpg)`) and preview natively in Obsidian;
special treatments use directives and render via the plugin. Publish
is `git commit` + `git push` from the repo — though until spec 005
executes, a push updates only the private repo; nothing deploys
anywhere.

## Deliberately no methodology

No Zettelkasten, no PARA, no tagging discipline. Frontmatter that has
to be written anyway, plus `[[` links whenever a connection genuinely
occurs, is the entire system — the graph is a byproduct of writing,
not a thing to maintain. If using Obsidian starts feeling like a
second project, that's the signal it's gone past what this setup
needs.

## Image exports, not masters

Commit web-sized exports to the piece folder — roughly 2560px on the
long edge, 1–3MB. Never RAW files or full-resolution masters: git
history keeps every byte forever, and the build only needs enough
pixels for its largest responsive variant. Masters live in the photo
archive, not the repo. (Decision and numbers: `DECISIONS.md`, "Images
stay committed to git".)

# The Obsidian vault's configuration

The writing surface is part of the project: this folder is the
`photo-brain` vault's settings as the photographer uses them, so a new
machine (or a reset vault) reads pieces the way the site presents them.

What is here, under `vault/` (mirroring the vault root):

- `.obsidian/app.json` — Markdown links instead of wikilinks; the
  repo's `.git`, `node_modules`, `dist` and `.astro` excluded from
  search and the graph (see `AUTHORING.md`, "Obsidian settings that
  matter"); vim mode.
- `.obsidian/appearance.json` — the Maple theme on the light base, 20px
  text, and the two snippets below enabled.
- `.obsidian/snippets/photo-pieces-measure.css` — the note's line width
  set to the site's measure, 68 characters.
- `.obsidian/snippets/photo-pieces-site.css` — the site's type (Public
  Sans, Spectral headings, JetBrains Mono, embedded) and its paper
  ground and colours in the writing area. Its values are copied from
  `src/styles/global.css`; re-copy them if the site's tokens change.
- `.obsidian/community-plugins.json`, `core-plugins.json`, `graph.json`
  — which plugins are on.
- `.obsidian/plugins/<id>/manifest.json` (and `data.json` where a plugin
  has settings) — the community plugins in use and their versions;
  their code is not committed, it comes from Obsidian's store.
- `.obsidian/themes/Maple/manifest.json` — the theme and its version,
  likewise installed from the store.
- `.obsidian.vimrc` — the vim mappings.
- `.obsidian/templates.json` — the core Templates plugin pointed at the
  vault's `templates/` folder.
- `templates/` — one template for each thing written for the site: a
  journal entry (`journal.md`), a photograph of the photographs folder
  (`photograph.md`, its sidecar), a photograph in a journal entry's
  folder (`journal-photograph.md`, its sidecar, without the three
  fields that are the photographs folder's alone), a gallery
  (`gallery.md`) and a place (`place.md`). Each holds only fields its
  collection's schema accepts, in the schema's order
  (`src/content.config.ts`; `obsidian-templates.test.mjs` holds every
  key to it), and only lines that build once filled: an empty line
  fails the schema, so the optional fields are left out and written as
  needed. The two sidecars carry a `stages:` example as comment lines.
  `AUTHORING.md`, "Templates", says what each needs before it builds.

The workspace layout (`workspace.json`) is left out: it is window state,
rewritten on every change of pane.

## Restoring a vault

With Obsidian closed:

```sh
sh obsidian/install.sh ~/photo-brain
```

It copies the settings and snippets, copies each template the vault
does not have yet — one already there is never overwritten, and the
script lists those that differ from the repo's — builds and installs
the site's own plugin (`obsidian-plugin/`), links this repo into the
vault as `photo-pieces` if nothing is there yet, and lists the
community plugins and the theme to install from Obsidian's store; run
it again after installing them to restore their settings.

## Saving changes back

After changing a setting worth keeping, copy the file from the vault
into `obsidian/vault/` and commit it — this folder is not synced
automatically. A template changed in the vault is saved back the same
way; to take the repo's version of one again, delete it from the vault
and run the script.

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

The workspace layout (`workspace.json`) is left out: it is window state,
rewritten on every change of pane.

## Restoring a vault

With Obsidian closed:

```sh
sh obsidian/install.sh ~/photo-brain
```

It copies the settings and snippets, builds and installs the site's own
plugin (`obsidian-plugin/`), links this repo into the vault as
`photo-pieces` if nothing is there yet, and lists the community plugins
and the theme to install from Obsidian's store; run it again after
installing them to restore their settings.

## Saving changes back

After changing a setting worth keeping, copy the file from the vault
into `obsidian/vault/` and commit it — this folder is not synced
automatically.

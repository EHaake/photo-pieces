#!/bin/sh
# Restore the photo-brain vault's configuration from obsidian/vault/.
# Usage: sh obsidian/install.sh [vault-dir]   (default ~/photo-brain)
# Run with Obsidian closed: it rewrites the vault's settings files.
set -eu
REPO=$(cd "$(dirname "$0")/.." && pwd)
SRC="$REPO/obsidian/vault"
VAULT=${1:-"$HOME/photo-brain"}
CFG="$VAULT/.obsidian"

mkdir -p "$CFG/snippets" "$CFG/plugins"
cp "$SRC/.obsidian.vimrc" "$VAULT/"
cp "$SRC"/.obsidian/*.json "$CFG/"
cp "$SRC"/.obsidian/snippets/*.css "$CFG/snippets/"

# The templates the core Templates plugin inserts (templates.json names
# the folder). A template changed in the vault stays as it is there:
# copy only where the vault has no file of that name, and list the ones
# that differ from the repo's.
mkdir -p "$VAULT/templates"
kept=""
for file in "$SRC"/templates/*.md; do
  name=$(basename "$file")
  if [ ! -e "$VAULT/templates/$name" ]; then
    cp "$file" "$VAULT/templates/"
  elif ! cmp -s "$file" "$VAULT/templates/$name"; then
    kept="$kept $name"
  fi
done

# The site's own plugin, built from this repo.
(cd "$REPO/obsidian-plugin" && npm install --legacy-peer-deps --silent && npm run build --silent)
mkdir -p "$CFG/plugins/photo-pieces-blocks"
cp "$REPO/obsidian-plugin/manifest.json" "$REPO/obsidian-plugin/main.js" "$REPO/obsidian-plugin/styles.css" \
  "$CFG/plugins/photo-pieces-blocks/"

# The repo inside the vault, as AUTHORING.md lays it out.
[ -e "$VAULT/photo-pieces" ] || ln -s "$REPO" "$VAULT/photo-pieces"

# Community plugins and the theme come from Obsidian's store; restore
# their settings where they are installed, list the rest.
missing=""
for dir in "$SRC"/.obsidian/plugins/*/; do
  id=$(basename "$dir")
  if [ -f "$CFG/plugins/$id/main.js" ]; then
    [ -f "$dir/data.json" ] && cp "$dir/data.json" "$CFG/plugins/$id/"
  else
    missing="$missing $id"
  fi
done
for dir in "$SRC"/.obsidian/themes/*/; do
  name=$(basename "$dir")
  [ -f "$CFG/themes/$name/theme.css" ] || missing="$missing theme:$name"
done

echo "Restored the vault's settings into $VAULT."
if [ -n "$kept" ]; then
  echo "Templates changed in the vault, left as they are (not overwritten):$kept"
fi
if [ -n "$missing" ]; then
  echo "Install from Obsidian's store (Settings → Community plugins / Appearance → Themes):$missing"
  echo "then run this again to restore their settings."
fi

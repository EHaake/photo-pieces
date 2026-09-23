#!/bin/sh
# The constitution's verification command (CLAUDE.md, "Verification"):
# build, type-check, and test, printing a short summary instead of the
# raw logs — the full build log runs to ~800 lines, and every agent that
# reads one carries it in its context. Green means every EXIT line is 0
# and vitest reports no failures. Full logs stay in $LOGDIR for anyone
# who needs the detail.
#
#   sh scripts/verify.sh            # everything
#   sh scripts/verify.sh tests      # vitest only (fast, for a pure-rule task)
set -u
TMP=${TMPDIR:-/tmp}; LOGDIR=${VERIFY_LOGDIR:-${TMP%/}/photo-pieces-verify}
mkdir -p "$LOGDIR"
only=${1:-all}

if [ "$only" != tests ]; then
  # The content store caches entry data between builds. Bodies render at
  # page build (deferRender, src/content.config.ts), so a transform change
  # no longer needs this; the removal stays as cheap insurance.
  rm -f node_modules/.astro/data-store.json
  { npm run build 2>&1; echo "BUILD EXIT $?"; } > "$LOGDIR/build.log"
  echo "## build (full log: $LOGDIR/build.log)"
  # Anything the registry, the transform, or Astro flagged, capped.
  grep -nE "error|Error|ERROR|warn|WARN|\[images\]|\[places\]|failed|Failed" "$LOGDIR/build.log" \
    | grep -vE "no GPS|0 errors|0 warnings" | head -n 30
  grep -E "page\(s\) built|Indexed [0-9]+ pages|\[prune-originals\]|\[check-no-gps\]|\[check-no-dev-routes\]|\[check-motion\]|BUILD EXIT" "$LOGDIR/build.log"
  if ! grep -q "BUILD EXIT 0" "$LOGDIR/build.log"; then
    echo "--- last 40 lines"; tail -n 40 "$LOGDIR/build.log"
  fi

  { npx astro check 2>&1; echo "CHECK EXIT $?"; } > "$LOGDIR/check.log"
  echo "## astro check"
  grep -E "^- [0-9]+ (errors|warnings|hints)|CHECK EXIT" "$LOGDIR/check.log" | tr '\n' ' '; echo
  if ! grep -q "CHECK EXIT 0" "$LOGDIR/check.log"; then
    echo "--- last 40 lines"; tail -n 40 "$LOGDIR/check.log"
  fi
fi

{ npx vitest run 2>&1; echo "TEST EXIT $?"; } > "$LOGDIR/test.log"
echo "## vitest (full log: $LOGDIR/test.log)"
grep -E "Test Files|Tests  |TEST EXIT" "$LOGDIR/test.log"
if ! grep -q "TEST EXIT 0" "$LOGDIR/test.log"; then
  echo "--- failures"; grep -nE "FAIL|AssertionError|Error:|✗|×" "$LOGDIR/test.log" | head -n 30
  echo "--- last 40 lines"; tail -n 40 "$LOGDIR/test.log"
fi

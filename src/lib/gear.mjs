// The gear table (spec 019): src/content/gear.md maps the camera and
// lens strings a photograph's EXIF carries to the names the wall label
// prints. The file is Markdown in the content folder so it opens in the
// vault, and belongs to no collection. Its format, one line per string:
//
//   ## Cameras
//   - `ILCE-7RM4` = Sony α7R IV
//   ## Lenses
//   - `FE 16-35mm F2.8 GM II` = Sony FE 16-35mm f/2.8 GM II
//
// The EXIF string sits in backticks, exact, so a `|` or a double space
// needs no escaping; a camera is keyed by its Model alone. Prose may sit
// above the first section; inside a section only entries, blank lines
// and one-line HTML comments. A malformed table fails the build, naming
// the file and line; a string the table lacks prints as the camera
// wrote it, and the registry warns once per distinct string (`[gear]`).

/** The table's path from the project root. */
export const GEAR_FILE = 'src/content/gear.md';

/** No table: formatExposure prints the EXIF strings as they are. */
export const EMPTY_GEAR = Object.freeze({ cameras: new Map(), lenses: new Map() });

const SECTIONS = Object.freeze({ '## Cameras': 'cameras', '## Lenses': 'lenses' });
const SECTION_NAMES = Object.freeze({ cameras: 'Cameras', lenses: 'Lenses' });
const ENTRY = /^- `([^`]+)` = (\S.*)$/;
const LIST_ITEM = /^\s*(?:[-*+]|\d+[.)])\s/;
const HEADING = /^#{2,}\s/;
const COMMENT = /^<!--.*-->$/;

/**
 * Parses the table's text into `{ cameras, lenses }`, each a Map from
 * the EXIF string (NULs dropped, trimmed — as the label's reader
 * leaves it) to its display name. Throws on a malformed line, a line
 * outside the two sections, or a key listed twice in one section,
 * naming `file` and the line.
 */
export function parseGearTable(text, file) {
  const gear = { cameras: new Map(), lenses: new Map() };
  let section = null;
  String(text)
    .split(/\r?\n/)
    .forEach((raw, index) => {
      const line = raw.trimEnd();
      const where = `${file}:${index + 1}`;
      if (line in SECTIONS) {
        section = SECTIONS[line];
        return;
      }
      if (section === null) {
        // Above the first section: prose only — a heading, a paragraph.
        if (LIST_ITEM.test(line) || HEADING.test(line)) throw malformed(where);
        return;
      }
      if (line.trim() === '' || COMMENT.test(line.trim())) return;
      const m = line.match(ENTRY);
      const key = m ? clean(m[1]) : undefined;
      if (!key) throw malformed(where);
      const entries = gear[section];
      if (entries.has(key)) {
        throw new Error(
          `[gear] ${where} — "${key}" is listed twice under ${SECTION_NAMES[section]}`,
        );
      }
      entries.set(key, m[2].trim());
    });
  return gear;
}

/**
 * The strings the table lacks, from `entries` = `[{ file, raw }]` with
 * `raw` a photograph's EXIF tags as readExposure returns them: one
 * `{ kind: 'camera' | 'lens', value, file }` per distinct string, with
 * the first file that carries it, in entry order. Absent strings are
 * not unknown.
 */
export function unknownGear(entries, gear) {
  const unknown = [];
  const seen = new Set();
  for (const { file, raw } of entries) {
    for (const [kind, tag, table] of [
      ['camera', 'Model', gear.cameras],
      ['lens', 'LensModel', gear.lenses],
    ]) {
      const value = clean(raw?.[tag]);
      if (!value || table.has(value) || seen.has(`${kind}\0${value}`)) continue;
      seen.add(`${kind}\0${value}`);
      unknown.push({ kind, value, file });
    }
  }
  return unknown;
}

function malformed(where) {
  return new Error(
    `[gear] ${where} — expected "- \`<EXIF string>\` = <display name>" under "## Cameras" or "## Lenses"`,
  );
}

// The key as image-meta.mjs's cleanString leaves an EXIF string, so a
// table key and a label lookup agree.
function clean(value) {
  if (typeof value !== 'string') return undefined;
  const cleaned = value.replaceAll('\0', '').trim();
  return cleaned === '' ? undefined : cleaned;
}

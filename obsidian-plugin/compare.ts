// The body of the three blocks that take stages — `:::compare`, `:::side`
// and `:::slider` — read stage by stage, and the one image pattern the
// plugin reads. Kept free of the `obsidian` import so the site's test
// suite can read it (obsidian-plugin.test.mjs at the repo root).

/** An image, `![alt](src "title")` — group 1 the alt, group 2 the src. The
 *  one image pattern the plugin reads, here and in blocks.ts (use with the
 *  `g` flag). */
export const IMAGE_PATTERN = '!\\[([^\\]]*)\\]\\(\\s*([^)\\s]+)(?:\\s+"[^"]*")?\\s*\\)';

export type Stage = { src: string; label: string; note: string };

/** A compare's body, stage by stage, by the site transform's rule: an
 *  image opens a stage, its text is the label, and the text up to the
 *  next image is its note — so one stage per line, or stages separated by
 *  blank lines, read alike. Text before the first image belongs to no
 *  stage and is skipped (the site build names it and fails). */
export function parseCompareBody(body: string): Stage[] {
  const image = new RegExp(IMAGE_PATTERN, 'g');
  const stages: Stage[] = [];
  let noteFrom = -1;
  let m: RegExpExecArray | null;
  while ((m = image.exec(body))) {
    if (stages.length > 0) stages[stages.length - 1].note = body.slice(noteFrom, m.index).trim();
    stages.push({ src: m[2], label: m[1], note: '' });
    noteFrom = m.index + m[0].length;
  }
  if (stages.length > 0) stages[stages.length - 1].note = body.slice(noteFrom).trim();
  return stages;
}

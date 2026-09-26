// The one container this plugin renders in Live Preview: a `:::compare`
// block, shown as its stages' images with their labels. Kept free of the
// `obsidian` import so the site's test suite can read it
// (obsidian-plugin.test.mjs at the repo root).

/** A whole `:::compare` block, fence to fence, anchored to whole lines
 *  (use with the `gm` flags). Group 1 is the attribute braces, if any;
 *  group 2 the body. */
export const COMPARE_PATTERN = '^:::compare(\\{[^}]*\\})?[ \\t]*\\n([\\s\\S]*?)\\n:::[ \\t]*$';

export type Stage = { src: string; label: string; note: string };

/** A compare's body, stage by stage, by the site transform's rule: an
 *  image opens a stage, its text is the label, and the text up to the
 *  next image is its note — so one stage per line, or stages separated by
 *  blank lines, read alike. Text before the first image belongs to no
 *  stage and is skipped (the site build names it and fails). */
export function parseCompareBody(body: string): Stage[] {
  const image = /!\[([^\]]*)\]\(\s*([^)\s]+)(?:\s+"[^"]*")?\s*\)/g;
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

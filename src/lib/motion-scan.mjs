// The literal-motion scan (spec 018). The rule it enforces: every
// transition and animation on the site reads the motion grammar — the
// duration and easing tokens declared once on :root in global.css — and
// nothing loops. So in a `transition*` or `animation*` declaration, once
// its `var(…)` and `calc(…)` groups are set aside, there may be no
// literal time, no easing keyword or function, no iteration count and no
// `infinite`. The one allowance is a zero: `transition-duration: 0s`
// (or a bare `0`) switches motion off and names no feel.
//
// Pure and import-free: motion.test.mjs runs it over global.css and every
// `.astro` <style> block, and scripts/check-motion.mjs over the built
// stylesheets and every <style> in dist/.

const PROPERTIES = [
  'transition',
  'transition-duration',
  'transition-delay',
  'transition-timing-function',
  'animation',
  'animation-duration',
  'animation-delay',
  'animation-timing-function',
  'animation-iteration-count',
];

// A property at a declaration start (not `view-transition-name`, not a
// custom property), up to the declaration's end — minified or not.
const DECLARATION = new RegExp(`(?<![\\w-])(${PROPERTIES.join('|')})\\s*:([^;{}]*)`, 'g');

/** The groups in `text` opened by `open` (e.g. `var(`), each through its
 *  balanced closing paren, and `text` with them blanked to spaces —
 *  offsets kept. */
function groups(text, open) {
  const pattern = new RegExp(`(?<![\\w-])${open.replace('(', '\\(')}`, 'gi');
  const found = [];
  let out = text;
  let match;
  while ((match = pattern.exec(out))) {
    let depth = 0;
    let end = out.length;
    for (let i = match.index + match[0].length - 1; i < out.length; i += 1) {
      if (out[i] === '(') depth += 1;
      else if (out[i] === ')' && --depth === 0) {
        end = i + 1;
        break;
      }
    }
    found.push({ at: match.index, text: out.slice(match.index, end) });
    out = out.slice(0, match.index) + ' '.repeat(end - match.index) + out.slice(end);
    pattern.lastIndex = end;
  }
  return { found, out };
}

/** The literals in one declaration's value, in order of appearance. */
function literals(value) {
  let rest = groups(groups(value, 'var(').out, 'calc(').out;
  const found = [];
  // Easing functions first, taken whole, so their arguments are not read
  // as bare numbers.
  for (const open of ['cubic-bezier(', 'steps(', 'linear(']) {
    const easing = groups(rest, open);
    found.push(...easing.found);
    rest = easing.out;
  }
  const patterns = [
    // A time, signed or not; a zero is the allowance.
    [/(?<![\w.-])-?\d*\.?\d+(ms|s)(?![\w-])/gi, (text) => parseFloat(text) !== 0],
    [/(?<![\w-])(ease-in-out|ease-in|ease-out|ease|linear|step-start|step-end)(?![\w-])/gi],
    [/(?<![\w-])infinite(?![\w-])/gi],
    // A bare number: an iteration count.
    [/(?<![\w.-])-?\d*\.?\d+(?![\w.%-])/g, (text) => parseFloat(text) !== 0],
  ];
  for (const [pattern, keep = () => true] of patterns)
    for (const match of rest.matchAll(pattern))
      if (keep(match[0])) found.push({ at: match.index, text: match[0] });
  return found.sort((a, b) => a.at - b.at).map((one) => one.text);
}

/**
 * Every motion declaration in `css` that carries a literal.
 * @param {string} css a stylesheet, or a <style> block's contents
 * @param {string} [file] carried through to each result
 * @returns {{ file: string, line: number, declaration: string, findings: string[] }[]}
 *   `line` is 1-based within `css`.
 */
export function scanMotion(css, file = '') {
  // Comments blanked, newlines kept, so line numbers stay true.
  const text = css.replace(/\/\*[\s\S]*?\*\//g, (comment) => comment.replace(/[^\n]/g, ' '));
  const out = [];
  for (const match of text.matchAll(DECLARATION)) {
    const findings = literals(match[2]);
    if (findings.length === 0) continue;
    out.push({
      file,
      line: text.slice(0, match.index).split('\n').length,
      declaration: `${match[1]}: ${match[2].replace(/\s+/g, ' ').trim()}`,
      findings,
    });
  }
  return out;
}

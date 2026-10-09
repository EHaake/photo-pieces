/**
 * A blank field means not set (spec 019, T1735e). Every collection's
 * schema in `src/content.config.ts` reads its frontmatter through
 * `withoutBlankFields` before it validates, so a field written with
 * nothing after it (`place:`, which YAML reads as null), an empty or
 * whitespace-only string, or an empty list (`categories: []`, what
 * Obsidian's Properties panel writes for an empty list property) is
 * read as if the line were not there — and the same inside each item of
 * a list (a stage's blank `note:`). A required field left blank then
 * fails as a missing one does; an optional one is unset. `0`, `false`
 * and every other written value are kept.
 */
const isBlank = (value: unknown): boolean =>
  value === null ||
  value === undefined ||
  (typeof value === 'string' && value.trim() === '') ||
  (Array.isArray(value) && value.length === 0);

export function withoutBlankFields(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(withoutBlankFields);
  // Only a plain mapping has fields: a date YAML has already parsed is
  // a value, kept whole.
  if (value === null || typeof value !== 'object') return value;
  if (Object.getPrototypeOf(value) !== Object.prototype) return value;
  return Object.fromEntries(
    Object.entries(value)
      .filter(([, field]) => !isBlank(field))
      .map(([key, field]) => [key, withoutBlankFields(field)]),
  );
}

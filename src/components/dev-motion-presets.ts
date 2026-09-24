/**
 * The motion switch's named settings for the appearance (spec 018,
 * T1606c; amended at the Phase 1 pause, decision review D1606 Q2) — a
 * DEV-ONLY, data-only module.
 *
 * Imported by the panel (src/components/dev-motion-panel.ts, served by
 * the dev server, never bundled) and by motion.test.mjs, and by nothing
 * a page bundles, so none of it ships. Each setting writes exactly
 * `APPEARANCE_TOKENS` — the appearance's duration, curve, rise and
 * threshold together — so the photographer switches between a few
 * whole feels instead of typing four values. The travel's and the
 * quiet view's tokens are in no setting: he kept them as built.
 *
 * `faint` is the appearance as first built; the committed :root is not
 * pinned to any setting, so a round may keep a value between them.
 */

/** The four tokens every setting sets, in the grammar's order. */
export const APPEARANCE_TOKENS = [
  '--dur-appear',
  '--ease-appear',
  '--arrive-rise',
  '--arrive-threshold',
] as const;

export type AppearancePreset = {
  name: string;
  description: string;
  tokens: Record<(typeof APPEARANCE_TOKENS)[number], string>;
};

/** The named settings, quietest first. */
export const APPEARANCE_PRESETS: readonly AppearancePreset[] = [
  {
    name: 'faint',
    description: 'As first built: a quick, light fade where the photograph sits. Easy to miss.',
    tokens: {
      '--dur-appear': '400ms',
      '--ease-appear': 'ease',
      '--arrive-rise': '0px',
      '--arrive-threshold': '0.15',
    },
  },
  {
    name: 'soft',
    description: 'A slower, gentle fade where the photograph sits. Nothing moves.',
    tokens: {
      '--dur-appear': '700ms',
      '--ease-appear': 'cubic-bezier(0.4, 0, 0.2, 1)',
      '--arrive-rise': '0px',
      '--arrive-threshold': '0.2',
    },
  },
  {
    name: 'settle',
    description:
      'An unhurried fade while the photograph drifts a short way into place as you scroll to it.',
    tokens: {
      '--dur-appear': '800ms',
      '--ease-appear': 'cubic-bezier(0.33, 1, 0.68, 1)',
      '--arrive-rise': '0.75rem',
      '--arrive-threshold': '0.25',
    },
  },
  {
    name: 'float',
    description:
      'The slowest: a long fade while the photograph glides further into place, once more of it is on screen.',
    tokens: {
      '--dur-appear': '1100ms',
      '--ease-appear': 'cubic-bezier(0.16, 1, 0.3, 1)',
      '--arrive-rise': '1rem',
      '--arrive-threshold': '0.3',
    },
  },
];

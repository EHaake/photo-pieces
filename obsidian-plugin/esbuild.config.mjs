import esbuild from 'esbuild';
import process from 'process';

const banner = `/* photo-pieces-blocks — built ${new Date().toISOString()} */`;

const context = await esbuild.context({
  banner: { js: banner },
  entryPoints: ['main.ts'],
  bundle: true,
  // Obsidian ships its own copy of CodeMirror 6 and expects plugins to use
  // that shared instance rather than bundling a second one — bundling your
  // own copy is a well-known source of subtle live-preview bugs.
  external: [
    'obsidian',
    'electron',
    '@codemirror/autocomplete',
    '@codemirror/collab',
    '@codemirror/commands',
    '@codemirror/language',
    '@codemirror/lint',
    '@codemirror/search',
    '@codemirror/state',
    '@codemirror/view',
    '@lezer/common',
    '@lezer/highlight',
    '@lezer/lr',
  ],
  format: 'cjs',
  target: 'es2020',
  logLevel: 'info',
  sourcemap: 'inline',
  outfile: 'main.js',
});

if (process.argv.includes('watch')) {
  await context.watch();
} else {
  await context.rebuild();
  process.exit(0);
}

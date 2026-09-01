// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import remarkDirective from 'remark-directive';
import { remarkReadingTime } from './remark-reading-time.mjs';
import { remarkPiecesBlocks } from './remark-pieces-blocks.mjs';

// https://astro.build/config
export default defineConfig({
  // Used for sitemap, canonical, and RSS links. Set to the real domain even
  // while the site only serves from the workers.dev test URL — pre-launch
  // canonicals pointing forward is harmless, and the domain flip then needs
  // no code change (see specs/002-going-live/plan.md).
  site: 'https://erikhaakephoto.com',
  // Global responsive layout: markdown images (including the plain
  // ![alt](...) single shorthand) get srcset/sizes, keeping the
  // shorthand equivalent to ::single per spec 003. Set once its 001-era
  // blocker (/blog/ also changing) died with the 002 teardown.
  image: { layout: 'constrained' },
  integrations: [mdx(), sitemap()],
  markdown: {
    processor: unified({
      // remarkDirective must run before remarkPiecesBlocks — it parses the
      // ::block syntax into directive nodes the transform then renders.
      remarkPlugins: [remarkReadingTime, remarkDirective, remarkPiecesBlocks],
    }),
    // Single light theme — the site is light-only (spec 002 removed dark
    // mode); global.css neutralizes the highlighter's own background.
    shikiConfig: {
      theme: 'github-light',
      wrap: true,
    },
  },
});

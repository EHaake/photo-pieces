import { createMarkdownProcessor } from '@astrojs/markdown-remark';

/**
 * Renders a frontmatter string as markdown — used for image sidecar
 * captions (spec 004), which live in frontmatter rather than a body so
 * the sidecar stays a plain metadata file in Obsidian. The site's own
 * markdown pipeline is the processor, minus the directive transform
 * (a caption is inline prose, not a place for image blocks) and
 * syntax highlighting.
 */
let processor: ReturnType<typeof createMarkdownProcessor> | undefined;

export async function renderMarkdown(text: string): Promise<string> {
  processor ??= createMarkdownProcessor({ syntaxHighlight: false });
  const { code } = await (await processor).render(text);
  return code;
}

/** Tags stripped and entities decoded — for meta descriptions. */
export function plainText(html: string): string {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&#(?:39|x27);/gi, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

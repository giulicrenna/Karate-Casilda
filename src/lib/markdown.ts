import 'server-only';
import { marked, type Tokens } from 'marked';

// ponytail: render custom para resolver drive:FILE_ID → proxy /api/thumb
const renderer = new marked.Renderer();

renderer.image = ({ href, title, text }: Tokens.Image): string => {
  let safeHref = href;
  if (href.startsWith('drive:')) {
    const fileId = encodeURIComponent(href.slice('drive:'.length));
    safeHref = `/api/thumb/${fileId}?size=1600`;
  }
  const alt = text ? ` alt="${text.replace(/"/g, '&quot;')}"` : ' alt=""';
  const t = title ? ` title="${title.replace(/"/g, '&quot;')}"` : '';
  return `<img src="${safeHref}"${alt}${t} loading="lazy" class="rounded-md my-4" />`;
};

// ponytail: links externos reciben rel seguro por construcción
renderer.link = ({ href, title, text }: Tokens.Link): string => {
  const isExternal = /^https?:\/\//i.test(href);
  const t = title ? ` title="${title}"` : '';
  const rel = isExternal ? ' rel="noopener noreferrer" target="_blank"' : '';
  return `<a href="${href}"${t}${rel}>${text}</a>`;
};

marked.setOptions({
  gfm: true,
  breaks: true,
  renderer,
});

export function renderMarkdown(md: string): string {
  return marked.parse(md, { async: false }) as string;
}
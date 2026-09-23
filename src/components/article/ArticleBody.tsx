import { renderMarkdown } from '@/lib/markdown';

interface Props {
  source: string;
}

export default function ArticleBody({ source }: Props) {
  const html = renderMarkdown(source);
  return (
    <div
      className="prose-custom text-base leading-relaxed text-ink-200"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
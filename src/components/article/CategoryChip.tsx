import { ARTICLE_CATEGORY_LABELS, ARTICLE_CATEGORY_COLORS } from '@/lib/constants';

interface Props {
  category: string;
  className?: string;
}

const COLOR_CLASSES: Record<string, string> = {
  shiroi: 'bg-shiroi-900/30 text-shiroi-300 border-shiroi-700/40',
  emerald: 'bg-emerald-900/30 text-emerald-300 border-emerald-700/40',
  amber: 'bg-amber-900/30 text-amber-300 border-amber-700/40',
  sky: 'bg-sky-900/30 text-sky-300 border-sky-700/40',
  ink: 'bg-ink-800 text-ink-300 border-ink-700',
};

export default function CategoryChip({ category, className = '' }: Props) {
  const label = ARTICLE_CATEGORY_LABELS[category] ?? category;
  const color = ARTICLE_CATEGORY_COLORS[category] ?? 'ink';
  const colorClass = COLOR_CLASSES[color] ?? COLOR_CLASSES.ink;

  return (
    <span
      className={
        'inline-block rounded-sm border px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.18em] ' +
        colorClass +
        ' ' +
        className
      }
    >
      {label}
    </span>
  );
}
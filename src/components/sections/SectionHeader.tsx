import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
  as?: 'div' | 'section' | 'header';
  align?: 'left' | 'center';
}

export default function SectionHeader({
  eyebrow,
  title,
  description,
  className,
  as: Tag = 'div',
  align = 'left',
}: SectionHeaderProps) {
  return (
    <Tag className={cn('max-w-3xl', align === 'center' && 'mx-auto text-center', className)}>
      {eyebrow && (
        <div className={cn('flex items-center gap-3', align === 'center' && 'justify-center')}>
          <span className="h-px w-8 bg-shiroi-600" aria-hidden />
          <span className="eyebrow">{eyebrow}</span>
        </div>
      )}
      <h2 className={cn('h-section mt-4 text-balance text-ink-50')}>{title}</h2>
      {description && (
        <p className="mt-4 text-base leading-relaxed text-ink-300 sm:text-lg text-pretty">
          {description}
        </p>
      )}
    </Tag>
  );
}

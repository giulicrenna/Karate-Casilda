interface Author {
  name: string;
  photoDriveFileId: string | null;
}

interface Props {
  author: Author;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
}

const SIZES = {
  sm: { img: 'h-7 w-7', initials: 'h-7 w-7 text-[10px]', name: 'text-xs' },
  md: { img: 'h-10 w-10', initials: 'h-10 w-10 text-xs', name: 'text-sm' },
  lg: { img: 'h-16 w-16', initials: 'h-16 w-16 text-base', name: 'text-base' },
};

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function AuthorBadge({ author, size = 'md', showName = true }: Props) {
  const s = SIZES[size];

  return (
    <div className="inline-flex items-center gap-2.5">
      {author.photoDriveFileId ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={`/api/thumb/${encodeURIComponent(author.photoDriveFileId)}?size=${
            size === 'lg' ? 160 : size === 'md' ? 80 : 80
          }`}
          alt={author.name}
          className={`${s.img} rounded-full object-cover border border-ink-800`}
        />
      ) : (
        <span
          className={`${s.initials} grid place-items-center rounded-full bg-ink-800 border border-ink-700 font-display text-shiroi-400`}
          aria-hidden
        >
          {initialsOf(author.name)}
        </span>
      )}
      {showName && (
        <span className={`${s.name} text-ink-200 font-medium`}>{author.name}</span>
      )}
    </div>
  );
}
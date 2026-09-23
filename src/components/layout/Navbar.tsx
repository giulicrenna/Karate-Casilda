'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SITE_CONFIG, type NavGroup } from '@/lib/site';
import SessionAwareButton from '@/components/layout/SessionAwareButton';

const isActive = (href: string, pathname: string | null) =>
  !!pathname && (pathname === href || (href !== '/' && pathname.startsWith(href + '/')));

const isGroupActive = (group: NavGroup, pathname: string | null) =>
  group.children.some((c) => isActive(c.href, pathname));

function StandaloneNavItem({
  href,
  label,
  pathname,
}: {
  href: string;
  label: string;
  pathname: string | null;
}) {
  const active = isActive(href, pathname);
  return (
    <Link
      href={href}
      className={cn(
        'relative flex h-full items-center px-3 text-xs font-medium uppercase tracking-[0.18em] transition-colors',
        active ? 'text-shiroi-400' : 'text-ink-300 hover:text-ink-50'
      )}
    >
      {label}
      {active && <span className="absolute inset-x-3 bottom-0 h-px bg-shiroi-500" aria-hidden />}
    </Link>
  );
}

function GroupDropdown({ group, pathname }: { group: NavGroup; pathname: string | null }) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const active = isGroupActive(group, pathname);

  const handleEnter = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const handleLeave = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  };

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div
      className="relative flex h-full items-center"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'relative flex h-full items-center gap-1.5 px-3 text-xs font-medium uppercase tracking-[0.18em] transition-colors',
          active || open ? 'text-shiroi-400' : 'text-ink-300 hover:text-ink-50'
        )}
      >
        {group.label}
        <ChevronDown
          className={cn('h-3 w-3 transition-transform duration-200', open && 'rotate-180')}
          aria-hidden
        />
        {(active || open) && (
          <span className="absolute inset-x-3 bottom-0 h-px bg-shiroi-500" aria-hidden />
        )}
      </button>

      <div
        role="menu"
        className={cn(
          'absolute left-1/2 top-full -translate-x-1/2 pt-3 transition-all duration-200 ease-out',
          open
            ? 'pointer-events-auto translate-y-0 opacity-100'
            : 'pointer-events-none -translate-y-1 opacity-0'
        )}
      >
        <div className="relative min-w-[210px] rounded-sm border border-ink-800 bg-ink-950/95 py-2 shadow-2xl shadow-black/70 backdrop-blur-md">
          <span
            className="pointer-events-none absolute -top-px left-1/2 h-px w-12 -translate-x-1/2 bg-shiroi-500"
            aria-hidden
          />
          {group.children.map((item) => {
            const itemActive = isActive(item.href, pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                role="menuitem"
                className={cn(
                  'group/item flex items-center justify-between gap-3 px-5 py-2.5 text-xs uppercase tracking-[0.18em] transition-colors',
                  itemActive
                    ? 'text-shiroi-400'
                    : 'text-ink-300 hover:bg-ink-900/50 hover:text-shiroi-300'
                )}
              >
                <span>{item.label}</span>
                <span
                  className={cn(
                    'h-px transition-all duration-200',
                    itemActive
                      ? 'w-5 bg-shiroi-500'
                      : 'w-3 bg-shiroi-700/60 group-hover/item:w-5 group-hover/item:bg-shiroi-500'
                  )}
                  aria-hidden
                />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MobileLink({
  href,
  label,
  pathname,
}: {
  href: string;
  label: string;
  pathname: string | null;
}) {
  const active = isActive(href, pathname);
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center justify-between border-b border-ink-900 py-3 text-sm uppercase tracking-[0.18em] transition-colors',
        active ? 'text-shiroi-400' : 'text-ink-200 hover:text-shiroi-300'
      )}
    >
      {label}
      <span className="text-ink-700">/</span>
    </Link>
  );
}

function MobileGroup({
  group,
  pathname,
  expanded,
  onToggle,
}: {
  group: NavGroup;
  pathname: string | null;
  expanded: boolean;
  onToggle: () => void;
}) {
  const active = isGroupActive(group, pathname);
  return (
    <div className="border-b border-ink-900">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className={cn(
          'flex w-full items-center justify-between py-3 text-sm uppercase tracking-[0.18em] transition-colors',
          active || expanded ? 'text-shiroi-400' : 'text-ink-200 hover:text-shiroi-300'
        )}
      >
        {group.label}
        <ChevronDown
          className={cn('h-4 w-4 transition-transform duration-200', expanded && 'rotate-180')}
          aria-hidden
        />
      </button>
      <div
        className={cn(
          'grid transition-all duration-300 ease-out',
          expanded ? 'grid-rows-[1fr] pb-2 opacity-100' : 'grid-rows-[0fr] opacity-0'
        )}
      >
        <div className="overflow-hidden">
          {group.children.map((item) => {
            const itemActive = isActive(item.href, pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center justify-between py-2 pl-4 pr-1 text-xs uppercase tracking-[0.2em] transition-colors',
                  itemActive ? 'text-shiroi-400' : 'text-ink-400 hover:text-shiroi-300'
                )}
              >
                <span>{item.label}</span>
                <span
                  className={cn(
                    'h-px transition-all',
                    itemActive ? 'w-4 bg-shiroi-500' : 'w-2 bg-shiroi-700/60'
                  )}
                  aria-hidden
                />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setMobileExpanded(null);
  }, [pathname]);

  if (pathname?.startsWith('/admin')) return null;

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled
          ? 'border-b border-ink-800 bg-ink-950/85 backdrop-blur-md'
          : 'border-b border-transparent bg-transparent'
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-3" aria-label={SITE_CONFIG.name}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo.png"
            alt=""
            width={36}
            height={36}
            className="h-9 w-9 rounded-sm transition-transform duration-300 group-hover:scale-105"
          />
          <span className="hidden flex-col leading-tight sm:flex">
            <span className="font-display text-base font-medium text-ink-50">Karate Casilda</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-ink-400">
              Dojo Shiroi Ryu
            </span>
          </span>
        </Link>

        <nav
          className="hidden h-full items-stretch gap-1 lg:flex"
          aria-label="Principal"
        >
          <StandaloneNavItem href="/" label="Inicio" pathname={pathname} />
          {SITE_CONFIG.navGroups.map((group) => (
            <GroupDropdown key={group.label} group={group} pathname={pathname} />
          ))}
          <StandaloneNavItem href="/contacto" label="Contacto" pathname={pathname} />
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <SessionAwareButton />
          <Link href="/contacto" className="btn-secondary text-[10px]">
            Sumate
          </Link>
        </div>

        <button
          type="button"
          className="-mr-2 grid h-10 w-10 place-items-center rounded-sm text-ink-200 hover:bg-ink-900 hover:text-ink-50 lg:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          'overflow-hidden border-b border-ink-800 bg-ink-950/95 backdrop-blur-md transition-all duration-300 lg:hidden',
          mobileOpen ? 'max-h-[80vh]' : 'max-h-0 border-transparent'
        )}
      >
        <nav
          className="mx-auto flex max-w-7xl flex-col overflow-y-auto px-4 py-4"
          aria-label="Móvil"
        >
          <MobileLink href="/" label="Inicio" pathname={pathname} />
          {SITE_CONFIG.navGroups.map((group) => (
            <MobileGroup
              key={group.label}
              group={group}
              pathname={pathname}
              expanded={mobileExpanded === group.label}
              onToggle={() =>
                setMobileExpanded((prev) => (prev === group.label ? null : group.label))
              }
            />
          ))}
          <MobileLink href="/contacto" label="Contacto" pathname={pathname} />
          <div className="mt-4 flex gap-2">
            <SessionAwareButton />
            <Link href="/contacto" className="btn-primary flex-1 text-xs">
              Sumate
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}

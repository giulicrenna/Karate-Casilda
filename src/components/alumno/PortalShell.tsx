'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, User, Wallet, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

const NAV: NavItem[] = [
  { href: '/alumno', label: 'Inicio', icon: <User className="h-4 w-4" /> },
  { href: '/alumno/perfil', label: 'Mi perfil', icon: <User className="h-4 w-4" /> },
  { href: '/alumno/deuda', label: 'Deuda', icon: <Wallet className="h-4 w-4" /> },
  { href: '/alumno/certificados', label: 'Certificados', icon: <Award className="h-4 w-4" /> },
  { href: '/alumno/cambiar-password', label: 'Cambiar contraseña', icon: <User className="h-4 w-4" /> },
];

export default function PortalShell({
  children,
  email,
  mustChangePwd,
  hideNav,
}: {
  children: React.ReactNode;
  email?: string;
  mustChangePwd?: boolean;
  hideNav?: boolean;
}) {
  const pathname = usePathname();

  const onLogout = async () => {
    await fetch('/api/auth/student-logout', { method: 'POST' });
    window.location.href = '/alumno/login';
  };

  return (
    <div className="min-h-screen flex flex-col bg-ink-950 text-ink-50">
      <header className="sticky top-0 z-30 border-b border-ink-800 bg-ink-950/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/alumno" className="flex items-center gap-3">
            <span className="grid h-8 w-8 place-items-center rounded-sm border border-shiroi-700 bg-ink-900 text-shiroi-500 font-display">
              空
            </span>
            <div className="leading-tight">
              <div className="font-display text-sm text-ink-50">Portal del alumno</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-ink-400">
                Dojo Shiroi Ryu
              </div>
            </div>
          </Link>

          {email && !hideNav && (
            <div className="hidden md:flex items-center gap-2">
              <span className="text-xs text-ink-400 truncate max-w-[200px]">{email}</span>
              <button
                type="button"
                onClick={onLogout}
                className="inline-flex items-center gap-1 rounded-sm border border-ink-700 px-3 py-1.5 text-xs uppercase tracking-wider text-ink-200 hover:border-ink-500 hover:bg-ink-900"
              >
                <LogOut className="h-3 w-3" />
                Salir
              </button>
            </div>
          )}
        </div>

        {!hideNav && (
          <nav className="mx-auto max-w-6xl px-2 sm:px-6 overflow-x-auto" aria-label="Portal">
            <ul className="flex gap-1 min-w-max">
              {NAV.filter((n) => n.href !== '/alumno/cambiar-password' || mustChangePwd).map((item) => {
                const active =
                  item.href === '/alumno'
                    ? pathname === '/alumno'
                    : pathname?.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'inline-flex items-center gap-2 rounded-sm px-3 py-2 text-xs uppercase tracking-wider transition-colors',
                        active
                          ? 'bg-shiroi-900/30 text-shiroi-300'
                          : 'text-ink-300 hover:bg-ink-900 hover:text-ink-50'
                      )}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  </li>
                );
              })}
              <li className="md:hidden">
                <button
                  type="button"
                  onClick={onLogout}
                  className="inline-flex items-center gap-2 rounded-sm px-3 py-2 text-xs uppercase tracking-wider text-ink-300 hover:bg-ink-900"
                >
                  <LogOut className="h-4 w-4" />
                  Salir
                </button>
              </li>
            </ul>
          </nav>
        )}
      </header>

      <main className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 py-8">{children}</main>

      <footer className="border-t border-ink-800 py-6 text-center text-xs text-ink-500">
        Karate Casilda · Dojo Shiroi Ryu
      </footer>
    </div>
  );
}
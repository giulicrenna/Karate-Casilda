'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Calendar,
  Images,
  FileText,
  Home,
  Plug,
  UserCircle,
  Newspaper,
  Users,
  Wallet,
  Receipt,
  ShieldCheck,
  Bell,
  Timer,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AdminRole } from '@/lib/guards';

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  allowed?: (role: AdminRole | undefined) => boolean;
};

const NAV: NavItem[] = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: <Home className="h-4 w-4" /> },
  { href: '/admin/alumnos', label: 'Alumnos', icon: <Users className="h-4 w-4" /> },
  { href: '/admin/pagos', label: 'Pagos', icon: <Wallet className="h-4 w-4" /> },
  { href: '/admin/cuotas', label: 'Cuotas', icon: <Receipt className="h-4 w-4" /> },
  { href: '/admin/eventos', label: 'Eventos', icon: <Calendar className="h-4 w-4" /> },
  { href: '/admin/albumes', label: 'Álbumes', icon: <Images className="h-4 w-4" /> },
  { href: '/admin/articulos', label: 'Artículos', icon: <Newspaper className="h-4 w-4" /> },
  { href: '/admin/autores', label: 'Autores', icon: <UserCircle className="h-4 w-4" /> },
  { href: '/admin/contenido', label: 'Contenido', icon: <FileText className="h-4 w-4" /> },
  {
    href: '/admin/integraciones',
    label: 'Integraciones',
    icon: <Plug className="h-4 w-4" />,
    allowed: (r) => r === 'superadmin',
  },
  { href: '/admin/notificaciones', label: 'Notificaciones', icon: <Bell className="h-4 w-4" /> },
  {
    href: '/admin/cron',
    label: 'Cron jobs',
    icon: <Timer className="h-4 w-4" />,
    allowed: (r) => r === 'superadmin' || r === 'admin',
  },
  {
    href: '/admin/usuarios',
    label: 'Usuarios',
    icon: <ShieldCheck className="h-4 w-4" />,
    allowed: (r) => r === 'superadmin' || r === 'sensei',
  },
];

export default function AdminShell({
  children,
  role,
}: {
  children: React.ReactNode;
  role?: AdminRole;
}) {
  const items = NAV.filter((i) => !i.allowed || i.allowed(role));
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex">
      <aside className="hidden md:flex w-64 flex-col border-r border-ink-900 bg-ink-950 sticky top-0 h-screen">
        <div className="p-5 border-b border-ink-900">
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-sm border border-shiroi-700 bg-ink-900 text-shiroi-500 font-display text-lg">
              空
            </span>
            <div>
              <div className="font-display text-sm text-ink-50">Admin</div>
              <div className="text-[10px] uppercase tracking-wider text-shiroi-500">
                Dojo Shiroi Ryu
              </div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-0.5" aria-label="Admin">
          {items.map((item) => {
            const active = pathname === item.href || pathname?.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-sm px-3 py-2 text-sm transition-colors',
                  active
                    ? 'bg-shiroi-900/30 text-shiroi-300'
                    : 'text-ink-300 hover:bg-ink-900 hover:text-ink-50'
                )}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-ink-900">
          <Link
            href="/"
            target="_blank"
            className="block rounded-sm px-3 py-2 text-xs text-ink-500 hover:bg-ink-900 hover:text-ink-200"
          >
            ↗ Ver sitio público
          </Link>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed inset-x-0 top-0 z-30 border-b border-ink-900 bg-ink-950/95 backdrop-blur p-3">
        <div className="flex items-center justify-between">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-sm border border-shiroi-700 bg-ink-900 text-shiroi-500 font-display text-sm">空</span>
            <span className="font-display text-sm text-ink-50">Admin</span>
          </Link>
        </div>
        <nav className="mt-2 flex gap-1 overflow-x-auto" aria-label="Admin">
          {items.map((item) => {
            const active = pathname === item.href || pathname?.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 rounded-sm px-3 py-1.5 text-xs whitespace-nowrap',
                  active ? 'bg-shiroi-900/30 text-shiroi-300' : 'text-ink-400 hover:text-ink-100'
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <main className="flex-1 min-w-0 md:p-8 p-4 pt-28 md:pt-8">{children}</main>
    </div>
  );
}

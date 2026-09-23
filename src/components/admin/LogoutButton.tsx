'use client';

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  const onLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <button type="button" onClick={onLogout} className="btn-secondary text-xs">
      <LogOut className="h-4 w-4" />
      Cerrar sesión
    </button>
  );
}

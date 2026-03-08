'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/lib/context/AuthContext';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAuthenticated, hydrated } = useAuth();
  const isLogin = pathname === '/login';

  if (isLogin || !hydrated || !isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className='flex min-h-screen bg-slate-50'>
      <Sidebar />
      <div className='flex min-h-screen flex-1 flex-col'>
        <Header />
        <main className='page-gradient flex-1 p-6'>{children}</main>
      </div>
    </div>
  );
}

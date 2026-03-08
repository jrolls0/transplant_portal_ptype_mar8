'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, ClipboardList, Inbox, ShieldCheck, Stethoscope } from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';
import { useCases } from '@/lib/context/CaseContext';
import { roleLabels } from '@/lib/data/mockUsers';
import { cn } from '@/lib/utils';
import { RoleSwitcher } from '@/components/layout/RoleSwitcher';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { href: '/pipeline', label: 'Pipeline', icon: ClipboardList },
  { href: '/inbox', label: 'Inbox', icon: Inbox }
];

export function Sidebar() {
  const pathname = usePathname();
  const { currentUser, currentRole } = useAuth();
  const { messages } = useCases();

  const unread = messages.filter((message) => !message.readAt).length;

  return (
    <aside className='sticky top-0 flex h-screen w-72 flex-col border-r border-slate-200 bg-white'>
      <div className='border-b border-slate-200 p-5'>
        <div className='flex items-center gap-2 text-lg font-semibold text-slate-900'>
          <Stethoscope className='h-5 w-5 text-blue-600' />
          TransplantFlow
        </div>
      </div>

      <nav className='space-y-1 p-4'>
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center justify-between rounded-lg px-4 py-2.5 text-sm transition-all',
                active
                  ? 'border-l-4 border-blue-600 bg-blue-50 font-medium text-blue-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              <span className='flex items-center gap-2'>
                <item.icon className='h-4 w-4' />
                {item.label}
              </span>
              {item.href === '/inbox' ? (
                <span className='rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600'>{unread}</span>
              ) : null}
            </Link>
          );
        })}

        {currentRole === 'senior-coordinator' ? (
          <Link
            href='/admin'
            className={cn(
              'mt-2 flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm transition-all',
              pathname.startsWith('/admin')
                ? 'border-l-4 border-blue-600 bg-blue-50 font-medium text-blue-700'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            )}
          >
            <ShieldCheck className='h-4 w-4' />
            Admin
          </Link>
        ) : null}
      </nav>

      <div className='mt-auto border-t border-slate-200 p-4'>
        <div className='mb-3 rounded-lg border border-slate-200 bg-slate-50 p-3'>
          <p className='text-sm font-semibold text-slate-900'>{currentUser?.name}</p>
          <p className='text-xs text-slate-600'>{roleLabels[currentRole ?? 'front-desk']}</p>
        </div>
        <RoleSwitcher />
      </div>
    </aside>
  );
}

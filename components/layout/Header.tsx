'use client';

import { useMemo } from 'react';
import { Bell, RefreshCw, Search } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/lib/context/AuthContext';
import { useCases } from '@/lib/context/CaseContext';
import { useNotification } from '@/lib/context/NotificationContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function Header() {
  const { currentUser } = useAuth();
  const { resetDemoData, tasks } = useCases();
  const { notify } = useNotification();

  const notifications = useMemo(
    () => tasks.filter((task) => task.status === 'pending' && ['urgent', 'high'].includes(task.priority)).length,
    [tasks]
  );

  return (
    <header className='sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur'>
      <div className='flex items-center justify-between gap-4 px-6 py-3'>
        <div className='flex flex-1 items-center gap-3'>
          <div className='relative max-w-sm flex-1'>
            <Search className='pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400' />
            <Input className='pl-9' placeholder='Search patient, case, task...' />
          </div>
          <Badge variant='info'>Demo Mode</Badge>
        </div>

        <div className='flex items-center gap-3'>
          <div className='flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600'>
            <Bell className='h-4 w-4' />
            <span>{notifications}</span>
          </div>

          <Button
            variant='secondary'
            size='sm'
            onClick={() => {
              if (window.confirm('Reset all demo data to initial state? This cannot be undone.')) {
                resetDemoData();
                notify('Demo data reset successfully');
                window.location.reload();
              }
            }}
          >
            <RefreshCw className='mr-2 h-3.5 w-3.5' />
            Reset Demo
          </Button>

          <div className='text-right'>
            <p className='text-sm font-semibold text-slate-900'>{currentUser?.name}</p>
            <p className='text-xs text-slate-500'>{format(new Date(), 'EEE, MMM d, yyyy')}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

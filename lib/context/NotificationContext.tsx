'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type ToastTone = 'success' | 'warning' | 'info' | 'error';

interface ToastItem {
  id: string;
  title: string;
  tone: ToastTone;
}

interface NotificationContextValue {
  toasts: ToastItem[];
  notify: (title: string, tone?: ToastTone) => void;
  dismiss: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback(
    (title: string, tone: ToastTone = 'success') => {
      const id = `toast-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      setToasts((current) => [{ id, title, tone }, ...current].slice(0, 6));
      window.setTimeout(() => dismiss(id), 4200);
    },
    [dismiss]
  );

  const value = useMemo(() => ({ toasts, notify, dismiss }), [toasts, notify, dismiss]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <Toaster />
    </NotificationContext.Provider>
  );
}

function toneClasses(tone: ToastTone) {
  if (tone === 'success') return 'border-emerald-300 bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-900';
  if (tone === 'warning') return 'border-amber-300 bg-gradient-to-r from-amber-50 to-amber-100 text-amber-900';
  if (tone === 'error') return 'border-red-300 bg-gradient-to-r from-red-50 to-red-100 text-red-900';
  return 'border-blue-300 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-900';
}

function ToneIcon({ tone }: { tone: ToastTone }) {
  if (tone === 'success') return <CheckCircle2 className='h-4 w-4' />;
  if (tone === 'warning') return <AlertCircle className='h-4 w-4' />;
  if (tone === 'error') return <AlertCircle className='h-4 w-4' />;
  return <Info className='h-4 w-4' />;
}

function Toaster() {
  const context = useContext(NotificationContext);
  if (!context) return null;

  return (
    <div className='fixed right-4 top-4 z-[60] flex w-[360px] flex-col gap-2'>
      {context.toasts.map((toast) => (
        <div key={toast.id} className={`flex items-start gap-3 rounded-lg border p-3 shadow-lg ${toneClasses(toast.tone)}`}>
          <ToneIcon tone={toast.tone} />
          <p className='flex-1 text-sm font-medium'>{toast.title}</p>
          <Button variant='ghost' size='icon' className='h-6 w-6 text-current' onClick={() => context.dismiss(toast.id)}>
            <X className='h-4 w-4' />
          </Button>
        </div>
      ))}
    </div>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
}

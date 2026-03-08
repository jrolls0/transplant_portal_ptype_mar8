'use client';

import { AuthProvider } from '@/lib/context/AuthContext';
import { CaseProvider } from '@/lib/context/CaseContext';
import { NotificationProvider } from '@/lib/context/NotificationContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <NotificationProvider>
        <CaseProvider>{children}</CaseProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

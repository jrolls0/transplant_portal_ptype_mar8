'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { demoRoles, useAuth } from '@/lib/context/AuthContext';
import { roleLabels } from '@/lib/data/mockUsers';

const roleIcons: Record<string, string> = {
  'front-desk': '👩‍💼',
  ptc: '👨‍⚕️',
  'senior-coordinator': '👩‍⚕️',
  financial: '💰',
  dietitian: '🍎',
  'social-work': '👥',
  nephrology: '🩺'
};

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, loginAsRole } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, router]);

  return (
    <main className='flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-slate-50 to-emerald-50 p-6'>
      <section className='w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 shadow-xl'>
        <div className='mb-8 text-center'>
          <div className='mb-3 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-blue-700'>
            <Stethoscope className='h-4 w-4' />
            TransplantFlow
          </div>
          <h1 className='text-3xl font-semibold text-slate-900'>Kidney Transplant Referral Management</h1>
          <p className='mt-2 text-slate-600'>Select your role to continue</p>
        </div>

        <div className='grid gap-3 md:grid-cols-2'>
          {demoRoles.map((role) => (
            <Button
              key={role}
              variant='secondary'
              className='h-auto justify-start gap-3 px-4 py-4 text-left'
              onClick={() => {
                loginAsRole(role);
                router.push('/dashboard');
              }}
            >
              <span className='text-xl'>{roleIcons[role]}</span>
              <span className='text-sm font-semibold text-slate-900'>{roleLabels[role]}</span>
            </Button>
          ))}
        </div>

        <div className='mt-6 flex items-center justify-center'>
          <Badge variant='info'>Demo Mode - Select any role</Badge>
        </div>
      </section>
    </main>
  );
}

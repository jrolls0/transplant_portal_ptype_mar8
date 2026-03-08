'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Apple, ClipboardList, DollarSign, Shield, Stethoscope, User, Users, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { demoRoles, useAuth } from '@/lib/context/AuthContext';
import { roleLabels } from '@/lib/data/mockUsers';
import { UserRole } from '@/types';
import { ElementType } from 'react';

const roleMeta: Record<UserRole, { icon: ElementType; color: string; description: string }> = {
  'front-desk': {
    icon: ClipboardList,
    color: 'bg-blue-500',
    description: 'Intake, document validation, and scheduling support'
  },
  ptc: {
    icon: User,
    color: 'bg-purple-500',
    description: 'Case management and patient follow-up'
  },
  'senior-coordinator': {
    icon: Shield,
    color: 'bg-indigo-500',
    description: 'Decision oversight and workflow governance'
  },
  financial: {
    icon: DollarSign,
    color: 'bg-green-500',
    description: 'Insurance verification and financial screening'
  },
  dietitian: {
    icon: Apple,
    color: 'bg-orange-500',
    description: 'Nutritional assessment and recommendations'
  },
  'social-work': {
    icon: Users,
    color: 'bg-pink-500',
    description: 'Psychosocial review and patient support'
  },
  nephrology: {
    icon: Stethoscope,
    color: 'bg-red-500',
    description: 'Nephrology review and clinical recommendations'
  },
  pharmacist: {
    icon: Activity,
    color: 'bg-slate-500',
    description: 'Medication risk review'
  },
  surgeon: {
    icon: Activity,
    color: 'bg-slate-500',
    description: 'Surgical candidacy review'
  }
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
    <main className='flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4'>
      <section className='w-full max-w-2xl'>
        <div className='mb-8 text-center'>
          <div className='mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600'>
            <Activity className='h-8 w-8 text-white' />
          </div>
          <h1 className='text-3xl font-bold text-slate-900'>TransplantFlow</h1>
          <p className='mt-2 text-slate-600'>Kidney Transplant Referral Management</p>
        </div>

        <div className='rounded-2xl border border-slate-200 bg-white p-6 shadow-xl'>
          <div className='mb-6 text-center'>
            <h2 className='text-lg font-semibold text-slate-900'>Select Your Role</h2>
            <p className='mt-1 text-sm text-slate-500'>Choose a role to explore the portal</p>
          </div>

          <div className='grid gap-3'>
          {demoRoles.map((role) => (
            (() => {
              const meta = roleMeta[role];
              const Icon = meta.icon;
              return (
                <button
                  key={role}
                  onClick={() => {
                    loginAsRole(role);
                    router.push('/dashboard');
                  }}
                  className='group flex items-center gap-4 rounded-xl border-2 border-slate-200 p-4 text-left transition-all hover:border-blue-300 hover:bg-blue-50'
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-white transition-transform group-hover:scale-110 ${meta.color}`}>
                    <Icon className='h-6 w-6' />
                  </div>
                  <div className='flex-1'>
                    <p className='font-semibold text-slate-900'>{roleLabels[role]}</p>
                    <p className='text-sm text-slate-500'>{meta.description}</p>
                  </div>
                  <div className='text-slate-400 transition-colors group-hover:text-blue-500'>→</div>
                </button>
              );
            })()
          ))}
          </div>

          <div className='mt-6 border-t border-slate-200 pt-6 text-center'>
            <span className='inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800'>
              <span className='h-2 w-2 animate-pulse rounded-full bg-amber-500' />
              Demo Mode - ChristianaCare Prototype
            </span>
          </div>
        </div>

        <p className='mt-6 text-center text-sm text-slate-400'>Built for ChristianaCare Kidney Transplant Program</p>
      </section>
    </main>
  );
}

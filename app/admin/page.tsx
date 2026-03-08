'use client';

import Link from 'next/link';
import { useRequireAuth } from '@/lib/context/AuthContext';
import { Button } from '@/components/ui/button';

const cards = [
  {
    title: 'Stages',
    description: 'Configure stage definitions, SLAs, and order.',
    href: '/admin/stages'
  },
  {
    title: 'Documents',
    description: 'Manage document catalog requirements and hard-blocks.',
    href: '/admin/documents'
  },
  {
    title: 'End Reasons',
    description: 'Configure standardized end reason codes.',
    href: '/admin/end-reasons'
  },
  {
    title: 'Templates',
    description: 'Edit letter and message templates.',
    href: '/admin/templates'
  }
];

export default function AdminLandingPage() {
  const auth = useRequireAuth();

  if (auth.currentRole !== 'senior-coordinator') {
    return <p className='text-sm text-slate-600'>Admin pages are available to Senior Coordinator role only.</p>;
  }

  return (
    <div className='space-y-4'>
      <div>
        <h1 className='text-2xl font-semibold text-slate-900'>Admin / Configuration</h1>
        <p className='text-sm text-slate-600'>Demo configuration pages with editable tables and save-to-toast behavior.</p>
      </div>

      <div className='grid gap-3 md:grid-cols-2 xl:grid-cols-3'>
        {cards.map((card) => (
          <div key={card.href} className='rounded-xl border border-slate-200 bg-white p-4'>
            <h2 className='text-lg font-semibold text-slate-900'>{card.title}</h2>
            <p className='mt-1 text-sm text-slate-600'>{card.description}</p>
            <Link href={card.href}>
              <Button variant='secondary' className='mt-4'>
                Manage →
              </Button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

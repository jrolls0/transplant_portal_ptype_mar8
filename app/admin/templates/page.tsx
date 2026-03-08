'use client';

import { useState } from 'react';
import { useRequireAuth } from '@/lib/context/AuthContext';
import { useNotification } from '@/lib/context/NotificationContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export default function AdminTemplatesPage() {
  const auth = useRequireAuth();
  const { notify } = useNotification();
  const [letterTemplate, setLetterTemplate] = useState(
    'Dear [Patient Last Name],\n\nWe regret to inform you that your referral has been ended.\n\nReason: [Reason].\n\nSincerely,\nChristianaCare Transplant Team'
  );
  const [messageTemplate, setMessageTemplate] = useState('Hi [First Name],\n\nThis is a reminder regarding your transplant referral tasks.');

  if (auth.currentRole !== 'senior-coordinator') {
    return <p className='text-sm text-slate-600'>Admin pages are available to Senior Coordinator role only.</p>;
  }

  return (
    <div className='space-y-4'>
      <h1 className='text-2xl font-semibold text-slate-900'>Templates</h1>

      <div className='rounded-xl border border-slate-200 bg-white p-4'>
        <h2 className='mb-2 text-sm font-semibold text-slate-700'>End Referral Letter Template</h2>
        <Textarea value={letterTemplate} onChange={(event) => setLetterTemplate(event.target.value)} className='min-h-[180px] font-mono text-xs' />
      </div>

      <div className='rounded-xl border border-slate-200 bg-white p-4'>
        <h2 className='mb-2 text-sm font-semibold text-slate-700'>Message Template</h2>
        <Textarea value={messageTemplate} onChange={(event) => setMessageTemplate(event.target.value)} className='min-h-[140px]' />
      </div>

      <Button onClick={() => notify('Templates saved')}>Save</Button>
    </div>
  );
}

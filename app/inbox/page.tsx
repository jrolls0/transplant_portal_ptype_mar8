'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useRequireAuth } from '@/lib/context/AuthContext';
import { useCases } from '@/lib/context/CaseContext';
import { QueueTabs } from '@/components/dashboard/QueueTabs';
import { MessageThread } from '@/components/shared/MessageThread';

export default function InboxPage() {
  useRequireAuth();

  const { messages, cases } = useCases();
  const [filter, setFilter] = useState<'all' | 'unread' | 'contact-attempts'>('all');

  const filtered = useMemo(() => {
    if (filter === 'all') return messages;
    if (filter === 'unread') return messages.filter((message) => !message.readAt);
    return messages.filter((message) => message.isContactAttempt);
  }, [messages, filter]);

  return (
    <div className='space-y-4'>
      <div>
        <h1 className='text-2xl font-semibold text-slate-900'>Inbox</h1>
        <p className='text-sm text-slate-600'>Cross-case messaging inbox for patient, clinic, and internal threads.</p>
      </div>

      <QueueTabs
        tabs={[
          { id: 'all', label: `All (${messages.length})` },
          { id: 'unread', label: `Unread (${messages.filter((message) => !message.readAt).length})` },
          { id: 'contact-attempts', label: `Contact Attempts (${messages.filter((message) => message.isContactAttempt).length})` }
        ]}
        activeTab={filter}
        onChange={(value) => setFilter(value as typeof filter)}
      />

      <MessageThread messages={filtered} />

      <section className='rounded-xl border border-slate-200 bg-white p-4'>
        <h2 className='mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500'>Jump to Case</h2>
        <div className='flex flex-wrap gap-2'>
          {cases.slice(0, 8).map((currentCase) => (
            <Link key={currentCase.id} href={`/cases/${currentCase.id}`} className='rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50'>
              {currentCase.caseNumber} - {currentCase.patient.lastName}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

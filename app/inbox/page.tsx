'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Mail, MailOpen } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useRequireAuth } from '@/lib/context/AuthContext';
import { useCases } from '@/lib/context/CaseContext';
import { Button } from '@/components/ui/button';
import { DashboardSkeleton } from '@/components/shared/LoadingSkeleton';

export default function InboxPage() {
  const auth = useRequireAuth();
  const currentUser = auth.currentUser;
  const currentRole = auth.currentRole;

  const { hydrated, messages, cases, tasks } = useCases();
  const [filter, setFilter] = useState<'all' | 'unread' | 'contact-attempts'>('all');

  const scopedMessages = useMemo(() => {
    const specialistRoles = new Set(['dietitian', 'social-work', 'nephrology']);

    return messages.filter((message) => {
      if (!currentUser || !currentRole) return false;
      if (message.fromUser.id === currentUser.id) return true;
      if (currentRole === 'senior-coordinator') return true;

      const currentCase = cases.find((caseItem) => caseItem.id === message.caseId);
      if (!currentCase) return false;

      if (currentRole === 'ptc') {
        return currentCase.assignedPTC?.id === currentUser.id;
      }
      if (currentRole === 'financial') {
        return currentCase.stage === 'financial-screening' || currentCase.flags.includes('Needs Clarification');
      }
      if (currentRole === 'front-desk') {
        return ['new-referral', 'patient-onboarding', 'initial-todos', 'follow-through', 'intermediary-step', 'initial-screening', 'scheduling', 'ended'].includes(
          currentCase.stage
        );
      }
      if (specialistRoles.has(currentRole)) {
        return tasks.some(
          (task) => task.caseId === currentCase.id && task.assignedToRole === currentRole && task.type === 'specialist-review'
        );
      }

      return false;
    });
  }, [messages, currentRole, currentUser, cases, tasks]);

  const filtered = useMemo(() => {
    const sorted = [...scopedMessages].sort((left, right) => new Date(right.sentAt).getTime() - new Date(left.sentAt).getTime());
    if (filter === 'unread') return sorted.filter((message) => !message.readAt);
    if (filter === 'contact-attempts') return sorted.filter((message) => message.isContactAttempt);
    return sorted;
  }, [scopedMessages, filter]);

  if (!hydrated) {
    return <DashboardSkeleton />;
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-semibold text-slate-900'>Message Inbox</h1>
          <p className='text-sm text-slate-600'>Messages relevant to your role and assigned cases.</p>
        </div>

        <div className='flex items-center gap-2'>
          <Button variant={filter === 'all' ? 'default' : 'outline'} size='sm' onClick={() => setFilter('all')}>
            All ({scopedMessages.length})
          </Button>
          <Button variant={filter === 'unread' ? 'default' : 'outline'} size='sm' onClick={() => setFilter('unread')}>
            Unread ({scopedMessages.filter((message) => !message.readAt).length})
          </Button>
          <Button
            variant={filter === 'contact-attempts' ? 'default' : 'outline'}
            size='sm'
            onClick={() => setFilter('contact-attempts')}
          >
            Contact Attempts ({scopedMessages.filter((message) => message.isContactAttempt).length})
          </Button>
        </div>
      </div>

      <section className='divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white'>
        {filtered.map((message) => {
          const currentCase = cases.find((caseItem) => caseItem.id === message.caseId);
          const unread = !message.readAt;

          return (
            <Link
              key={message.id}
              href={`/cases/${message.caseId}?tab=messages`}
              className={`block p-4 transition-colors hover:bg-slate-50 ${unread ? 'bg-blue-50/50' : ''}`}
            >
              <div className='flex items-start gap-4'>
                <div className={`rounded-full p-2 ${unread ? 'bg-blue-100' : 'bg-slate-100'}`}>
                  {unread ? <Mail className='h-5 w-5 text-blue-600' /> : <MailOpen className='h-5 w-5 text-slate-400' />}
                </div>

                <div className='min-w-0 flex-1'>
                  <div className='flex items-center justify-between gap-2'>
                    <p className={`truncate font-medium ${unread ? 'text-slate-900' : 'text-slate-600'}`}>
                      {currentCase
                        ? `${currentCase.patient.lastName}, ${currentCase.patient.firstName} • ${currentCase.caseNumber}`
                        : 'Unknown case'}
                    </p>
                    <span className='whitespace-nowrap text-xs text-slate-500'>
                      {formatDistanceToNow(new Date(message.sentAt), { addSuffix: true })}
                    </span>
                  </div>

                  <p className='mt-0.5 text-sm text-slate-500'>
                    From: {message.fromUser.name} → {message.toRecipients.map((recipient) => recipient.name).join(', ')}
                  </p>
                  <p className={`mt-1 line-clamp-2 text-sm ${unread ? 'text-slate-700' : 'text-slate-500'}`}>{message.body}</p>

                  {message.isContactAttempt ? (
                    <span className='mt-2 inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700'>
                      Contact Attempt #{message.attemptNumber}
                    </span>
                  ) : null}
                </div>
              </div>
            </Link>
          );
        })}

        {filtered.length === 0 ? (
          <div className='p-8 text-center text-slate-500'>
            <Mail className='mx-auto mb-3 h-12 w-12 text-slate-300' />
            <p>No messages to display for this filter.</p>
          </div>
        ) : null}
      </section>
    </div>
  );
}

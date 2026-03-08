'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRequireAuth } from '@/lib/context/AuthContext';
import { useCases } from '@/lib/context/CaseContext';
import { useNotification } from '@/lib/context/NotificationContext';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SendMessageModal } from '@/components/modals/SendMessageModal';
import { EndReferralModal } from '@/components/modals/EndReferralModal';
import { Case } from '@/types';
import { DashboardSkeleton } from '@/components/shared/LoadingSkeleton';

export default function FinancialDashboardPage() {
  useRequireAuth();

  const { hydrated, cases, tasks, completeTask, setCaseStage, sendMessage, endReferral, addCaseFlag, removeCaseFlag } = useCases();
  const { notify } = useNotification();

  const [messageCase, setMessageCase] = useState<Case | null>(null);
  const [endCase, setEndCase] = useState<Case | null>(null);

  const pendingCases = useMemo(() => cases.filter((currentCase) => currentCase.stage === 'financial-screening'), [cases]);
  const clarificationCases = pendingCases.filter((currentCase) => currentCase.flags.includes('Needs Clarification'));

  const financialTasksByCase = useMemo(
    () =>
      tasks
        .filter((task) => task.assignedToRole === 'financial' && task.status !== 'completed')
        .reduce<Record<string, (typeof tasks)[number]>>((acc, task) => {
          if (!acc[task.caseId]) acc[task.caseId] = task;
          return acc;
        }, {}),
    [tasks]
  );

  if (!hydrated) {
    return <DashboardSkeleton />;
  }

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-semibold text-slate-900'>Financial Coordinator Dashboard</h1>
        <p className='text-sm text-slate-600'>Financial screening queue and clarification follow-up.</p>
      </div>

      <div className='grid gap-3 sm:grid-cols-3'>
        <div className='rounded-xl border border-slate-200 bg-white p-4'>
          <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Pending Screening</p>
          <p className='mt-2 text-2xl font-semibold text-slate-900'>{pendingCases.length}</p>
        </div>
        <div className='rounded-xl border border-slate-200 bg-white p-4'>
          <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Needs Clarify</p>
          <p className='mt-2 text-2xl font-semibold text-slate-900'>{clarificationCases.length}</p>
        </div>
        <div className='rounded-xl border border-slate-200 bg-white p-4'>
          <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Re-Verify</p>
          <p className='mt-2 text-2xl font-semibold text-slate-900'>1</p>
        </div>
      </div>

      <section className='rounded-xl border border-slate-200 bg-white p-4'>
        <h2 className='mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500'>Financial Screening Queue</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Insurance</TableHead>
              <TableHead>Days</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pendingCases.map((currentCase) => (
              <TableRow key={currentCase.id}>
                <TableCell>
                  {currentCase.patient.lastName}, {currentCase.patient.firstName}
                </TableCell>
                <TableCell>{currentCase.flags.includes('Needs Clarification') ? 'Coverage unclear' : 'Coverage ready for decision'}</TableCell>
                <TableCell>{currentCase.daysInStage}</TableCell>
                <TableCell>
                  <div className='flex flex-wrap gap-2'>
                    <Link href={`/cases/${currentCase.id}`}>
                      <Button size='sm' variant='secondary'>
                        Review Insurance Card
                      </Button>
                    </Link>
                    <Button
                      size='sm'
                      onClick={() => {
                        setCaseStage(currentCase.id, 'records-collection');
                        removeCaseFlag(currentCase.id, 'Needs Clarification');
                        const task = financialTasksByCase[currentCase.id];
                        if (task) completeTask(task.id, 'Financially cleared.');
                        notify('Financial screening cleared');
                      }}
                    >
                      Clear ✓
                    </Button>
                    <Button size='sm' variant='secondary' onClick={() => setMessageCase(currentCase)}>
                      Needs Info
                    </Button>
                    <Button size='sm' variant='destructive' onClick={() => setEndCase(currentCase)}>
                      Not Cleared - End
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      <section className='rounded-xl border border-slate-200 bg-white p-4'>
        <h2 className='mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500'>Needs Clarification</h2>
        <div className='space-y-2'>
          {clarificationCases.map((currentCase) => (
            <div key={currentCase.id} className='flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 p-3'>
              <div>
                <p className='text-sm font-semibold text-slate-900'>
                  {currentCase.patient.lastName}, {currentCase.patient.firstName}
                </p>
                <p className='text-xs text-slate-500'>Awaiting patient reply</p>
              </div>
              <div className='flex gap-2'>
                <Link href={`/cases/${currentCase.id}`}>
                  <Button size='sm' variant='secondary'>
                    View Messages
                  </Button>
                </Link>
                <Button size='sm' variant='secondary' onClick={() => setMessageCase(currentCase)}>
                  Send Reminder
                </Button>
                <Button size='sm' variant='destructive' onClick={() => setEndCase(currentCase)}>
                  Mark Not Cleared
                </Button>
              </div>
            </div>
          ))}
          {clarificationCases.length === 0 ? <p className='text-sm text-slate-500'>No clarification cases currently.</p> : null}
        </div>
      </section>

      {messageCase ? (
        <SendMessageModal
          open={Boolean(messageCase)}
          onOpenChange={(open) => {
            if (!open) setMessageCase(null);
          }}
          currentCase={messageCase}
          onSend={({ recipients, body, markAsContactAttempt }) => {
            sendMessage({
              caseId: messageCase.id,
              toRecipients: recipients,
              body,
              markAsContactAttempt,
              channel: 'in-app'
            });
            addCaseFlag(messageCase.id, 'Needs Clarification');
            notify('Clarification request sent');
          }}
        />
      ) : null}

      {endCase ? (
        <EndReferralModal
          open={Boolean(endCase)}
          onOpenChange={(open) => {
            if (!open) setEndCase(null);
          }}
          currentCase={endCase}
          preselectedReason='FIN-INS-NA'
          onApprove={({ reasonCode, rationale, letterDraft }) => {
            endReferral(endCase.id, reasonCode, rationale, letterDraft);
            const task = financialTasksByCase[endCase.id];
            if (task) completeTask(task.id, 'Not financially cleared.');
            notify('Referral ended and letter workflow created');
          }}
        />
      ) : null}
    </div>
  );
}

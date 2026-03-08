'use client';

import { useMemo } from 'react';
import { Case, Task, AuditEvent } from '@/types';
import { Button } from '@/components/ui/button';
import { SLAIndicator } from '@/components/shared/SLAIndicator';
import { formatDate } from '@/lib/utils/formatters';

interface SummaryTabProps {
  currentCase: Case;
  tasks: Task[];
  audit: AuditEvent[];
  onMessagePatient: () => void;
  onCreateTask: () => void;
  onLogExternalStep: () => void;
  onEscalate: () => void;
  onEndReferral: () => void;
}

export function SummaryTab({
  currentCase,
  tasks,
  audit,
  onMessagePatient,
  onCreateTask,
  onLogExternalStep,
  onEscalate,
  onEndReferral
}: SummaryTabProps) {
  const pending = useMemo(() => tasks.filter((task) => task.status !== 'completed').slice(0, 3), [tasks]);
  const completed = useMemo(() => tasks.filter((task) => task.status === 'completed').slice(0, 4), [tasks]);
  const timeline = useMemo(() => audit.slice(0, 6), [audit]);

  return (
    <div className='space-y-4'>
      <div className='grid gap-4 xl:grid-cols-2'>
        <section className='rounded-xl border border-slate-200 bg-white p-4'>
          <h3 className='mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500'>What Needs to Happen</h3>
          <div className='space-y-3'>
            {pending.length === 0 ? (
              <p className='rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800'>
                Nothing pending. Case is ready for next stage.
              </p>
            ) : (
              pending.map((task, index) => (
                <div key={task.id} className='rounded-lg border border-slate-200 p-3'>
                  <p className='text-sm font-semibold text-slate-900'>
                    {index + 1}. {task.title}
                  </p>
                  <p className='text-xs text-slate-500'>Due {formatDate(task.dueDate)}</p>
                  <div className='mt-2'>
                    <SLAIndicator status={task.slaStatus} />
                  </div>
                </div>
              ))
            )}
          </div>

          <div className='mt-4'>
            <p className='mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500'>Completed this stage</p>
            <ul className='list-disc space-y-1 pl-5 text-sm text-slate-700'>
              {completed.length > 0 ? completed.map((task) => <li key={task.id}>{task.title}</li>) : <li>No completed tasks yet.</li>}
            </ul>
          </div>

          <div className='mt-4'>
            <p className='mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500'>Flags</p>
            {currentCase.flags.length === 0 ? (
              <p className='text-sm text-slate-600'>None</p>
            ) : (
              <ul className='list-disc space-y-1 pl-5 text-sm text-slate-700'>
                {currentCase.flags.map((flag) => (
                  <li key={flag}>{flag}</li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className='rounded-xl border border-slate-200 bg-white p-4'>
          <h3 className='mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500'>Timeline</h3>
          <div className='space-y-3'>
            {timeline.map((event) => (
              <div key={event.id} className='rounded-lg border border-slate-200 p-3'>
                <p className='text-xs text-slate-500'>{new Date(event.performedAt).toLocaleString()}</p>
                <p className='text-sm font-semibold text-slate-900'>{event.eventType.replace(/_/g, ' ')}</p>
                <p className='text-sm text-slate-700'>{event.description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className='rounded-xl border border-slate-200 bg-white p-4'>
        <h3 className='mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500'>Quick Actions</h3>
        <div className='flex flex-wrap gap-2'>
          <Button onClick={onMessagePatient}>Message Patient</Button>
          <Button variant='secondary' onClick={onCreateTask}>
            Create Task
          </Button>
          <Button variant='secondary' onClick={onLogExternalStep}>
            Log Phone Call (EXTERNAL)
          </Button>
          <Button variant='secondary' onClick={onEscalate}>
            Escalate to Senior
          </Button>
          <Button variant='destructive' onClick={onEndReferral}>
            End Referral
          </Button>
        </div>
      </section>
    </div>
  );
}

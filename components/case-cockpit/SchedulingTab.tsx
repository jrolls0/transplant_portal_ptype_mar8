'use client';

import { useState } from 'react';
import { Case } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SchedulingHuddleModal } from '@/components/modals/SchedulingHuddleModal';
import { LogExternalStepModal } from '@/components/modals/LogExternalStepModal';

interface SchedulingTabProps {
  currentCase: Case;
  onRecordHuddle: (payload: {
    type: 'direct-evaluation' | 'testing-first';
    carePartnerRequired: boolean;
    appointmentTypes: string[];
    notes: string;
  }) => void;
  onMarkSurginet: (notes: string) => void;
  onUpdateWindows: (windows: string[]) => void;
}

export function SchedulingTab({ currentCase, onRecordHuddle, onMarkSurginet, onUpdateWindows }: SchedulingTabProps) {
  const [huddleOpen, setHuddleOpen] = useState(false);
  const [externalOpen, setExternalOpen] = useState(false);
  const [windowsDraft, setWindowsDraft] = useState(currentCase.schedulingWindows?.join('\n') ?? '');
  const [previewState, setPreviewState] = useState<'auto' | 'pre-scheduling' | 'awaiting-huddle' | 'in-progress' | 'pending-surginet' | 'scheduled'>('auto');

  const state =
    currentCase.stage === 'scheduled'
      ? 'scheduled'
      : currentCase.schedulingState ??
        (currentCase.stage === 'education' ? 'pre-scheduling' : currentCase.stage === 'scheduling' ? 'awaiting-huddle' : 'pre-scheduling');
  const effectiveState = previewState === 'auto' ? state : previewState;

  return (
    <div className='space-y-4'>
      <div className='rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3'>
        <p className='mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500'>Demo State Preview</p>
        <div className='flex flex-wrap gap-2'>
          {[
            ['auto', 'Auto'],
            ['pre-scheduling', 'State 1'],
            ['awaiting-huddle', 'State 2'],
            ['in-progress', 'State 3'],
            ['pending-surginet', 'State 4'],
            ['scheduled', 'State 5']
          ].map(([value, label]) => (
            <Button
              key={value}
              size='sm'
              variant={previewState === value ? 'default' : 'secondary'}
              onClick={() =>
                setPreviewState(
                  value as 'auto' | 'pre-scheduling' | 'awaiting-huddle' | 'in-progress' | 'pending-surginet' | 'scheduled'
                )
              }
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      {effectiveState === 'pre-scheduling' ? (
        <section className='rounded-xl border border-slate-200 bg-white p-4'>
          <h3 className='mb-2 text-sm font-semibold text-slate-900'>Scheduling</h3>
          <p className='text-sm text-slate-700'>Education must be completed before scheduling can begin.</p>
          <ul className='mt-3 list-disc space-y-1 pl-5 text-sm text-slate-600'>
            <li>Video watched: Not started</li>
            <li>Confirmation form: Not started</li>
            <li>Healthcare guidance: Not started</li>
          </ul>
        </section>
      ) : null}

      {effectiveState === 'awaiting-huddle' ? (
        <section className='rounded-xl border border-slate-200 bg-white p-4'>
          <h3 className='mb-2 text-sm font-semibold text-slate-900'>Scheduling</h3>
          <p className='mb-3 text-sm text-slate-700'>Education complete. Awaiting scheduling huddle decision.</p>
          <Button onClick={() => setHuddleOpen(true)}>Record Scheduling Huddle Decision</Button>
        </section>
      ) : null}

      {effectiveState === 'in-progress' ? (
        <section className='space-y-3 rounded-xl border border-slate-200 bg-white p-4'>
          <h3 className='text-sm font-semibold text-slate-900'>Scheduling In Progress</h3>
          <p className='text-sm text-slate-700'>
            Scheduling huddle recorded by {currentCase.schedulingDecision?.decidedBy}. Type:{' '}
            {currentCase.schedulingDecision?.type === 'direct-evaluation' ? 'Direct Evaluation' : 'Testing First'}.
          </p>

          <div>
            <p className='mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500'>Time Windows</p>
            <Textarea
              value={windowsDraft}
              onChange={(event) => setWindowsDraft(event.target.value)}
              className='min-h-[120px] whitespace-pre-wrap'
            />
            <div className='mt-2 flex gap-2'>
              <Button
                variant='secondary'
                onClick={() => onUpdateWindows(windowsDraft.split('\n').map((line) => line.trim()).filter(Boolean))}
              >
                Edit Windows
              </Button>
              <Button variant='secondary'>Send Reminder</Button>
            </div>
          </div>

          <p className='text-sm text-slate-600'>Patient Selection: Awaiting response</p>
        </section>
      ) : null}

      {effectiveState === 'pending-surginet' ? (
        <section className='rounded-xl border border-slate-200 bg-white p-4'>
          <h3 className='mb-2 text-sm font-semibold text-slate-900'>Pending Surginet Confirmation</h3>
          <p className='mb-3 text-sm text-slate-700'>Patient selected appointment. Confirm in Surginet as EXTERNAL STEP.</p>
          <Button onClick={() => setExternalOpen(true)}>Mark as Confirmed in Surginet</Button>
        </section>
      ) : null}

      {effectiveState === 'scheduled' ? (
        <section className='rounded-xl border border-emerald-200 bg-emerald-50 p-4'>
          <h3 className='mb-2 text-sm font-semibold text-emerald-800'>Appointment Confirmed</h3>
          <p className='text-sm text-emerald-800'>
            Date: {currentCase.appointmentDate ? new Date(currentCase.appointmentDate).toLocaleString() : 'TBD'}
          </p>
          <p className='text-sm text-emerald-800'>Type: {currentCase.schedulingDecision?.type ?? 'Direct Evaluation'}</p>
          <div className='mt-3 flex gap-2'>
            <Button variant='secondary'>Mark No-Show</Button>
            <Button variant='secondary'>Reschedule</Button>
          </div>
        </section>
      ) : null}

      <SchedulingHuddleModal
        open={huddleOpen}
        onOpenChange={setHuddleOpen}
        currentCase={currentCase}
        onRecord={(payload) => {
          onRecordHuddle(payload);
        }}
      />

      <LogExternalStepModal
        open={externalOpen}
        onOpenChange={setExternalOpen}
        onSubmit={({ notes }) => {
          onMarkSurginet(notes);
        }}
      />
    </div>
  );
}

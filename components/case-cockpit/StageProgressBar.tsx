import { AlertCircle, CheckCircle } from 'lucide-react';
import { getVisibleProgressIndex } from '@/lib/utils/stageTransitions';
import { Case } from '@/types';

const stages = [
  { key: 'new-referral', label: 'Referral', short: '1' },
  { key: 'patient-onboarding', label: 'Onboarding', short: '2' },
  { key: 'initial-todos', label: 'Patient TODOs', short: '3' },
  { key: 'follow-through', label: 'Follow-through', short: '4' },
  { key: 'intermediary-step', label: 'Missing Info', short: '5' },
  { key: 'initial-screening', label: 'Screening', short: '6' },
  { key: 'financial-screening', label: 'Financial', short: '7' },
  { key: 'records-collection', label: 'Records', short: '8' },
  { key: 'medical-records-review', label: 'Med Review', short: '9' },
  { key: 'specialist-review', label: 'Specialists', short: '10' },
  { key: 'final-decision', label: 'Decision', short: '11' },
  { key: 'education', label: 'Education', short: '12' },
  { key: 'scheduling', label: 'Scheduling', short: '13' }
] as const;

export function StageProgressBar({ currentCase }: { currentCase: Case }) {
  const currentIndex = getVisibleProgressIndex(currentCase.stage);
  const isEnded = currentCase.stage === 'ended';
  const isScheduled = currentCase.stage === 'scheduled';

  if (isEnded) {
    return (
      <div className='rounded-xl border border-red-200 bg-red-50 p-4'>
        <div className='flex items-center gap-3'>
          <AlertCircle className='h-6 w-6 text-red-600' />
          <div>
            <p className='font-semibold text-red-800'>Referral Ended</p>
            <p className='text-sm text-red-600'>
              Reason: {currentCase.endReason} • Ended{' '}
              {currentCase.endedAt ? new Date(currentCase.endedAt).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isScheduled) {
    return (
      <div className='rounded-xl border border-emerald-200 bg-emerald-50 p-4'>
        <div className='flex items-center gap-3'>
          <CheckCircle className='h-6 w-6 text-emerald-600' />
          <div>
            <p className='font-semibold text-emerald-800'>Appointment Scheduled</p>
            <p className='text-sm text-emerald-600'>
              {currentCase.appointmentDate
                ? new Date(currentCase.appointmentDate).toLocaleString()
                : 'Date pending confirmation'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='rounded-xl border border-slate-200 bg-white p-4'>
      <div className='mb-2 flex items-center justify-between'>
        <p className='text-sm font-semibold text-slate-700'>Workflow Progress</p>
        <p className='text-sm text-slate-500'>
          Stage {currentIndex + 1} of {stages.length}
        </p>
      </div>

      <div className='relative'>
        <div className='h-2 rounded-full bg-slate-100' />
        <div
          className='absolute left-0 top-0 h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500'
          style={{ width: `${((currentIndex + 1) / stages.length) * 100}%` }}
        />
      </div>

      <div className='mt-3 flex justify-between overflow-x-auto pb-2'>
        {stages.map((stage, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isFuture = index > currentIndex;

          return (
            <div key={stage.key} className={`flex min-w-[60px] flex-col items-center ${isFuture ? 'opacity-40' : ''}`}>
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                  isCompleted ? 'bg-blue-600 text-white' : ''
                } ${isCurrent ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-600 ring-offset-2' : ''} ${
                  isFuture ? 'bg-slate-100 text-slate-400' : ''
                }`}
              >
                {isCompleted ? <CheckCircle className='h-4 w-4' /> : stage.short}
              </div>
              <span className={`mt-1 whitespace-nowrap text-center text-xs ${isCurrent ? 'font-semibold text-blue-700' : 'text-slate-500'}`}>
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

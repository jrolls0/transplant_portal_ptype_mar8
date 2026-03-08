import Link from 'next/link';
import { Case, Task } from '@/types';
import { SLAIndicator } from '@/components/shared/SLAIndicator';
import { Button } from '@/components/ui/button';

interface CaseQueueItemProps {
  currentCase: Case;
  task?: Task;
  actions?: React.ReactNode;
}

export function CaseQueueItem({ currentCase, task, actions }: CaseQueueItemProps) {
  return (
    <div className='rounded-xl border border-slate-200 bg-white p-4 shadow-sm'>
      <div className='mb-2 flex flex-wrap items-start justify-between gap-2'>
        <div>
          <p className='font-semibold text-slate-900'>
            {currentCase.patient.lastName}, {currentCase.patient.firstName}
          </p>
          <p className='text-xs text-slate-600'>Stage: {currentCase.stage}</p>
        </div>
        <SLAIndicator status={task?.slaStatus ?? currentCase.slaStatus} />
      </div>

      {task ? <p className='mb-3 text-sm text-slate-700'>Task: {task.title}</p> : null}

      <div className='flex flex-wrap gap-2'>
        <Link href={`/cases/${currentCase.id}`}>
          <Button variant='secondary' size='sm'>
            Open Case
          </Button>
        </Link>
        {actions}
      </div>
    </div>
  );
}

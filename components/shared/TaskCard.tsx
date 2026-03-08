import { Task } from '@/types';
import { SLAIndicator } from '@/components/shared/SLAIndicator';
import { formatDate } from '@/lib/utils/formatters';
import { Button } from '@/components/ui/button';

interface TaskCardProps {
  task: Task;
  onOpenCase?: () => void;
  onComplete?: () => void;
  onAction?: () => void;
  actionLabel?: string;
}

export function TaskCard({ task, onOpenCase, onComplete, onAction, actionLabel }: TaskCardProps) {
  return (
    <div className='rounded-xl border border-slate-200 bg-white p-4 shadow-sm'>
      <div className='mb-2 flex items-start justify-between gap-3'>
        <div>
          <p className='text-sm font-semibold text-slate-900'>{task.title}</p>
          <p className='text-xs text-slate-500'>Due {formatDate(task.dueDate)}</p>
        </div>
        <SLAIndicator status={task.slaStatus} />
      </div>
      <div className='flex flex-wrap gap-2'>
        {onOpenCase ? (
          <Button variant='secondary' size='sm' onClick={onOpenCase}>
            Open Case
          </Button>
        ) : null}
        {onAction ? (
          <Button variant='secondary' size='sm' onClick={onAction}>
            {actionLabel ?? 'Action'}
          </Button>
        ) : null}
        {onComplete ? (
          <Button size='sm' onClick={onComplete}>
            Complete
          </Button>
        ) : null}
      </div>
    </div>
  );
}

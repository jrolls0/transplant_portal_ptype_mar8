import { Case, Task } from '@/types';
import { CaseQueueItem } from '@/components/dashboard/CaseQueueItem';

interface CaseQueueProps {
  cases: Case[];
  taskByCaseId?: Record<string, Task | undefined>;
  actionsByCaseId?: Record<string, React.ReactNode>;
}

export function CaseQueue({ cases, taskByCaseId = {}, actionsByCaseId = {} }: CaseQueueProps) {
  if (cases.length === 0) {
    return <div className='rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-500'>No cases in this queue.</div>;
  }

  return (
    <div className='space-y-3'>
      {cases.map((currentCase) => (
        <CaseQueueItem
          key={currentCase.id}
          currentCase={currentCase}
          task={taskByCaseId[currentCase.id]}
          actions={actionsByCaseId[currentCase.id]}
        />
      ))}
    </div>
  );
}

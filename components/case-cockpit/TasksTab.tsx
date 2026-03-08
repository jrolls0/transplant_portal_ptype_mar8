'use client';

import { useMemo, useState } from 'react';
import { Case, Task } from '@/types';
import { Button } from '@/components/ui/button';
import { QueueTabs } from '@/components/dashboard/QueueTabs';
import { SLAIndicator } from '@/components/shared/SLAIndicator';
import { CreateTaskModal } from '@/components/modals/CreateTaskModal';

interface TasksTabProps {
  currentCase: Case;
  tasks: Task[];
  myRole?: string;
  onCompleteTask: (taskId: string) => void;
  onCreateTask: (payload: {
    title: string;
    type: Task['type'];
    assignedToRole: Task['assignedToRole'];
    dueDate: string;
    description: string;
    isExternalStep: boolean;
    externalSystem?: string;
  }) => void;
}

export function TasksTab({ currentCase, tasks, myRole, onCompleteTask, onCreateTask }: TasksTabProps) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'my'>('all');
  const [createOpen, setCreateOpen] = useState(false);

  const filtered = useMemo(() => {
    if (filter === 'pending') return tasks.filter((task) => task.status !== 'completed');
    if (filter === 'completed') return tasks.filter((task) => task.status === 'completed');
    if (filter === 'my') return tasks.filter((task) => task.assignedToRole === myRole);
    return tasks;
  }, [filter, tasks, myRole]);

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between gap-3'>
        <QueueTabs
          tabs={[
            { id: 'all', label: 'All' },
            { id: 'pending', label: 'Pending' },
            { id: 'completed', label: 'Completed' },
            { id: 'my', label: 'My Tasks' }
          ]}
          activeTab={filter}
          onChange={(value) => setFilter(value as typeof filter)}
        />

        <Button onClick={() => setCreateOpen(true)}>+ Create Task</Button>
      </div>

      <div className='space-y-3'>
        {filtered.map((task) => (
          <div key={task.id} className='rounded-xl border border-slate-200 bg-white p-4'>
            <div className='mb-2 flex flex-wrap items-center justify-between gap-2'>
              <p className='font-semibold text-slate-900'>{task.title}</p>
              <div className='flex items-center gap-2'>
                <SLAIndicator status={task.slaStatus} />
                <span className='rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 uppercase'>{task.status}</span>
              </div>
            </div>
            <p className='text-sm text-slate-600'>Assigned to: {task.assignedToUser?.name ?? task.assignedToRole}</p>
            <p className='text-sm text-slate-600'>Due: {new Date(task.dueDate).toLocaleString()}</p>
            {task.completionNotes ? <p className='mt-1 text-sm text-slate-600'>Outcome: {task.completionNotes}</p> : null}

            <div className='mt-3 flex flex-wrap gap-2'>
              <Button variant='secondary' size='sm'>
                Open
              </Button>
              <Button variant='secondary' size='sm'>
                Send Reminder
              </Button>
              {task.status !== 'completed' ? (
                <Button size='sm' onClick={() => onCompleteTask(task.id)}>
                  Complete
                </Button>
              ) : null}
            </div>
          </div>
        ))}

        {filtered.length === 0 ? <p className='text-sm text-slate-500'>No tasks match this filter.</p> : null}
      </div>

      <CreateTaskModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreate={(payload) => onCreateTask(payload)}
      />
    </div>
  );
}

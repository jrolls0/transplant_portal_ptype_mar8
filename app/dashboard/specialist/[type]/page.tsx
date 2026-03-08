'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Task, UserRole } from '@/types';
import { useRequireAuth } from '@/lib/context/AuthContext';
import { useCases } from '@/lib/context/CaseContext';
import { useNotification } from '@/lib/context/NotificationContext';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SLAIndicator } from '@/components/shared/SLAIndicator';
import { SpecialistReviewModal } from '@/components/modals/SpecialistReviewModal';
import { DashboardSkeleton } from '@/components/shared/LoadingSkeleton';

const typeMap: Record<string, { role: UserRole; title: string }> = {
  dietitian: { role: 'dietitian', title: 'Dietitian Dashboard' },
  'social-work': { role: 'social-work', title: 'Social Work Dashboard' },
  nephrology: { role: 'nephrology', title: 'Nephrology Dashboard' }
};

export default function SpecialistDashboardPage() {
  useRequireAuth();

  const params = useParams<{ type: string }>();
  const specialist = typeMap[params.type] ?? typeMap.dietitian;

  const { hydrated, tasks, cases, setTaskStatus, completeTask, createTask, createDecision, addCaseFlag, sendMessage } = useCases();
  const { notify } = useNotification();

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const reviewTasks = useMemo(
    () => tasks.filter((task) => task.assignedToRole === specialist.role && task.type === 'specialist-review' && task.status !== 'completed'),
    [tasks, specialist.role]
  );

  const pendingClarification = reviewTasks.filter((task) => task.status === 'in-progress');

  if (!hydrated) {
    return <DashboardSkeleton />;
  }

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-semibold text-slate-900'>{specialist.title}</h1>
        <p className='text-sm text-slate-600'>Review queue with structured outcomes and escalation support.</p>
      </div>

      <section className='rounded-xl border border-slate-200 bg-white p-4'>
        <h2 className='mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500'>My Review Tasks</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Assigned</TableHead>
              <TableHead>Due</TableHead>
              <TableHead>SLA</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviewTasks.map((task) => {
              const currentCase = cases.find((item) => item.id === task.caseId);
              if (!currentCase) return null;

              return (
                <TableRow key={task.id}>
                  <TableCell>
                    {currentCase.patient.lastName}, {currentCase.patient.firstName}
                  </TableCell>
                  <TableCell>{new Date(task.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(task.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <SLAIndicator status={task.slaStatus} />
                  </TableCell>
                  <TableCell>
                    <div className='flex gap-2'>
                      <Button size='sm' onClick={() => setSelectedTask(task)}>
                        {task.status === 'in-progress' ? 'Continue Review' : 'Start Review'}
                      </Button>
                      <Link href={`/cases/${currentCase.id}`}>
                        <Button size='sm' variant='secondary'>
                          View Case
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {reviewTasks.length === 0 ? <p className='text-sm text-slate-500'>No specialist tasks assigned currently.</p> : null}
      </section>

      <section className='rounded-xl border border-slate-200 bg-white p-4'>
        <h2 className='mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500'>Pending Clarification</h2>
        <div className='space-y-2'>
          {pendingClarification.map((task) => {
            const currentCase = cases.find((item) => item.id === task.caseId);
            if (!currentCase) return null;

            return (
              <div key={task.id} className='flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 p-3'>
                <div>
                  <p className='text-sm font-semibold text-slate-900'>
                    {currentCase.patient.lastName}, {currentCase.patient.firstName}
                  </p>
                  <p className='text-xs text-slate-500'>Waiting on patient response</p>
                </div>
                <div className='flex gap-2'>
                  <Link href={`/cases/${currentCase.id}`}>
                    <Button size='sm' variant='secondary'>
                      View Case
                    </Button>
                  </Link>
                  <Button
                    size='sm'
                    variant='secondary'
                    onClick={() => {
                      sendMessage({
                        caseId: currentCase.id,
                        toRecipients: [{ type: 'patient', name: `${currentCase.patient.firstName} ${currentCase.patient.lastName}` }],
                        body: 'Following up on specialist clarification request.',
                        markAsContactAttempt: true,
                        channel: 'in-app'
                      });
                      notify('Follow-up message sent');
                    }}
                  >
                    Send Follow-up
                  </Button>
                </div>
              </div>
            );
          })}

          {pendingClarification.length === 0 ? <p className='text-sm text-slate-500'>No clarification queues right now.</p> : null}
        </div>
      </section>

      {selectedTask ? (
        <SpecialistReviewModal
          open={Boolean(selectedTask)}
          onOpenChange={(open) => {
            if (!open) setSelectedTask(null);
          }}
          reviewType={specialist.title.replace(' Dashboard', ' Review')}
          currentCase={cases.find((item) => item.id === selectedTask.caseId)!}
          onSubmit={({ outcome, notes }) => {
            const currentCase = cases.find((item) => item.id === selectedTask.caseId);
            if (!currentCase) return;

            if (outcome === 'needs-clarification') {
              setTaskStatus(selectedTask.id, 'in-progress', `Clarification requested - ${notes || 'Awaiting additional information.'}`);
              createTask({
                caseId: currentCase.id,
                title: `${specialist.title.replace(' Dashboard', '')} Clarification Follow-up`,
                type: 'send-message',
                assignedToRole: 'ptc',
                dueDate: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
                description: notes,
                isExternalStep: false
              });
              sendMessage({
                caseId: currentCase.id,
                toRecipients: [{ type: 'patient', name: `${currentCase.patient.firstName} ${currentCase.patient.lastName}` }],
                body: notes || 'Please provide clarification requested during specialist review.',
                markAsContactAttempt: true,
                channel: 'in-app'
              });
              notify('Clarification request sent');
            } else if (outcome === 'clear') {
              completeTask(selectedTask.id, `Cleared - ${notes || 'No concerns identified.'}`);
              notify('Review completed - Cleared');
            } else if (outcome === 'escalate') {
              completeTask(selectedTask.id, `ESCALATED to Senior Coordinator - ${notes}`);

              createTask({
                caseId: currentCase.id,
                title: `${specialist.title.replace(' Dashboard', '')} Escalation Review`,
                type: 'screening-override',
                assignedToRole: 'senior-coordinator',
                dueDate: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
                description: `${specialist.title.replace(' Dashboard', '')} raised concern: ${notes}`,
                isExternalStep: false,
                priority: 'urgent'
              });

              addCaseFlag(currentCase.id, 'Specialist Concern');
              createDecision({
                caseId: currentCase.id,
                type: 'specialist-conflict',
                title: `${specialist.title.replace(' Dashboard', '')} Concern - Review Required`,
                options: ['Proceed despite concern', 'Request additional information', 'End referral']
              });
              notify('Escalation sent to Senior Coordinator');
            }

            setSelectedTask(null);
          }}
        />
      ) : null}
    </div>
  );
}

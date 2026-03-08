'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRequireAuth } from '@/lib/context/AuthContext';
import { useCases } from '@/lib/context/CaseContext';
import { useNotification } from '@/lib/context/NotificationContext';
import { KPIStrip } from '@/components/dashboard/KPIStrip';
import { QueueTabs } from '@/components/dashboard/QueueTabs';
import { CaseQueue } from '@/components/dashboard/CaseQueue';
import { Button } from '@/components/ui/button';
import { LogExternalStepModal } from '@/components/modals/LogExternalStepModal';
import { ScreeningRoutingModal } from '@/components/modals/ScreeningRoutingModal';
import { Case } from '@/types';
import { DashboardSkeleton } from '@/components/shared/LoadingSkeleton';

const queueTabs = [
  { id: 'all', label: 'All' },
  { id: 'intake', label: 'Intake/TODOs' },
  { id: 'ie-review', label: 'I/E Review' },
  { id: 'initial-screening', label: 'Route Screening' },
  { id: 'doc-review', label: 'Doc Review' },
  { id: 'missing-info', label: 'Missing Info' },
  { id: 'scheduling', label: 'Scheduling' },
  { id: 'end-letters', label: 'End Letters' }
] as const;

type QueueTabId = (typeof queueTabs)[number]['id'];

export default function FrontDeskDashboardPage() {
  useRequireAuth();

  const router = useRouter();
  const { hydrated, cases, tasks, documents, completeTask, validateDocument, logExternalStep, routeInitialScreening } = useCases();
  const { notify } = useNotification();

  const [activeTab, setActiveTab] = useState<QueueTabId>('all');
  const [externalOpen, setExternalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [routingModalOpen, setRoutingModalOpen] = useState(false);
  const [routingCase, setRoutingCase] = useState<Case | null>(null);

  const frontDeskPending = useMemo(
    () => tasks.filter((task) => task.assignedToRole === 'front-desk' && task.status !== 'completed'),
    [tasks]
  );

  const overdue = frontDeskPending.filter((task) => task.slaStatus === 'overdue');
  const dueToday = frontDeskPending.filter((task) => task.slaStatus === 'at-risk');
  const upcoming = frontDeskPending.filter((task) => task.slaStatus === 'on-track');
  const completed = tasks.filter((task) => task.assignedToRole === 'front-desk' && task.status === 'completed');

  const taskByCase = useMemo(
    () =>
      frontDeskPending.reduce<Record<string, (typeof frontDeskPending)[number]>>((acc, task) => {
        if (!acc[task.caseId]) acc[task.caseId] = task;
        return acc;
      }, {}),
    [frontDeskPending]
  );

  const filteredCases = useMemo(() => {
    const relevantIds = new Set(frontDeskPending.map((task) => task.caseId));
    const candidates = cases.filter((currentCase) => relevantIds.has(currentCase.id));

    if (activeTab === 'all') return candidates;
    if (activeTab === 'intake') {
      return candidates.filter((currentCase) => ['initial-todos', 'follow-through'].includes(currentCase.stage));
    }
    if (activeTab === 'doc-review') {
      const caseIds = new Set(
        documents
          .filter((document) => document.status === 'needs-review' || document.status === 'received')
          .map((document) => document.caseId)
      );
      return candidates.filter((currentCase) => caseIds.has(currentCase.id));
    }
    if (activeTab === 'missing-info') {
      return candidates.filter((currentCase) => currentCase.stage === 'intermediary-step');
    }
    if (activeTab === 'scheduling') {
      return candidates.filter((currentCase) =>
        ['scheduling', 'scheduled'].includes(currentCase.stage) ||
        ['confirm-surginet', 'schedule-appointment', 'scheduling-huddle'].includes(taskByCase[currentCase.id]?.type ?? '')
      );
    }
    if (activeTab === 'ie-review') {
      return candidates.filter((currentCase) =>
        ['review-ie-responses', 'confirm-ie-review'].includes(taskByCase[currentCase.id]?.type ?? '')
      );
    }
    if (activeTab === 'initial-screening') {
      return cases.filter(
        (currentCase) => currentCase.stage === 'initial-screening' && currentCase.ieConfirmReviewComplete
      );
    }
    return candidates.filter((currentCase) => taskByCase[currentCase.id]?.type === 'send-end-letter');
  }, [activeTab, cases, frontDeskPending, taskByCase, documents]);

  const actionsByCaseId = useMemo(() => {
    const actionMap: Record<string, React.ReactNode> = {};

    filteredCases.forEach((currentCase) => {
      const task = taskByCase[currentCase.id];

      if (currentCase.stage === 'initial-screening' && currentCase.ieConfirmReviewComplete) {
        actionMap[currentCase.id] = (
          <Button
            size='sm'
            onClick={() => {
              setRoutingCase(currentCase);
              setRoutingModalOpen(true);
            }}
          >
            Route Case →
          </Button>
        );
        return;
      }

      if (!task) return;

      if (task.type === 'review-document') {
        const doc = documents.find((item) => item.caseId === currentCase.id && item.status !== 'validated');
        actionMap[currentCase.id] = (
          <>
            <Button
              variant='secondary'
              size='sm'
              onClick={() => {
                if (!doc) return;
                validateDocument(doc.id, 'validated');
                completeTask(task.id, 'Document approved.');
                notify('Document validated');
              }}
            >
              Approve
            </Button>
            <Button
              variant='secondary'
              size='sm'
              onClick={() => {
                if (!doc) return;
                validateDocument(doc.id, 'rejected');
                notify('Document rejected');
              }}
            >
              Reject
            </Button>
          </>
        );
        return;
      }

      if (task.type === 'confirm-ie-review') {
        actionMap[currentCase.id] = (
          <Button
            size='sm'
            onClick={() => {
              completeTask(task.id, 'I/E review confirmed by front desk.');
              notify('I/E review confirmed');
            }}
          >
            Confirm ✓
          </Button>
        );
        return;
      }

      if (task.type === 'confirm-surginet') {
        actionMap[currentCase.id] = (
          <Button
            size='sm'
            onClick={() => {
              setSelectedTaskId(task.id);
              setExternalOpen(true);
            }}
          >
            Log Completed
          </Button>
        );
        return;
      }

      if (task.type === 'send-end-letter') {
        actionMap[currentCase.id] = (
          <>
            <Link href={`/cases/${currentCase.id}`}>
              <Button variant='secondary' size='sm'>
                View Letter
              </Button>
            </Link>
            <Button
              size='sm'
              onClick={() => {
                setSelectedTaskId(task.id);
                setExternalOpen(true);
              }}
            >
              Mark Sent
            </Button>
          </>
        );
        return;
      }

      actionMap[currentCase.id] = (
        <Button size='sm' onClick={() => router.push(`/cases/${currentCase.id}`)}>
          Open Case →
        </Button>
      );
    });

    return actionMap;
  }, [filteredCases, taskByCase, documents, validateDocument, completeTask, notify, router]);

  const selectedExternalTask = selectedTaskId ? tasks.find((task) => task.id === selectedTaskId) : undefined;
  const selectedExternalCase = selectedExternalTask ? cases.find((currentCase) => currentCase.id === selectedExternalTask.caseId) : undefined;

  if (!hydrated) {
    return <DashboardSkeleton />;
  }

  return (
    <div className='space-y-6'>
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <div>
          <h1 className='text-2xl font-semibold text-slate-900'>Front Desk Dashboard</h1>
          <p className='text-sm text-slate-600'>Primary intake, document validation, and outbound workflow queues.</p>
        </div>
      </div>

      <KPIStrip
        items={[
          { label: 'Overdue', value: overdue.length, tone: 'danger' },
          { label: 'Due Today', value: dueToday.length, tone: 'warning' },
          { label: 'Upcoming', value: upcoming.length, tone: 'success' },
          { label: 'Completed', value: completed.length, tone: 'neutral' }
        ]}
      />

      <section className='space-y-3 rounded-xl border border-slate-200 bg-white p-4'>
        <QueueTabs
          tabs={queueTabs.map((tab) => ({ ...tab }))}
          activeTab={activeTab}
          onChange={(tab) => setActiveTab(tab as QueueTabId)}
        />

        <div className='space-y-4'>
          <div>
            <h2 className='mb-2 text-sm font-semibold uppercase tracking-wide text-red-600'>Overdue</h2>
            <CaseQueue
              cases={filteredCases.filter((currentCase) =>
                activeTab === 'initial-screening'
                  ? currentCase.slaStatus === 'overdue'
                  : taskByCase[currentCase.id]?.slaStatus === 'overdue'
              )}
              taskByCaseId={taskByCase}
              actionsByCaseId={actionsByCaseId}
            />
          </div>

          <div>
            <h2 className='mb-2 text-sm font-semibold uppercase tracking-wide text-amber-600'>Due Today / At Risk</h2>
            <CaseQueue
              cases={filteredCases.filter((currentCase) =>
                activeTab === 'initial-screening'
                  ? currentCase.slaStatus === 'at-risk'
                  : taskByCase[currentCase.id]?.slaStatus === 'at-risk'
              )}
              taskByCaseId={taskByCase}
              actionsByCaseId={actionsByCaseId}
            />
          </div>

          <div>
            <h2 className='mb-2 text-sm font-semibold uppercase tracking-wide text-emerald-600'>On Track</h2>
            <CaseQueue
              cases={filteredCases.filter((currentCase) =>
                activeTab === 'initial-screening'
                  ? currentCase.slaStatus === 'on-track'
                  : taskByCase[currentCase.id]?.slaStatus === 'on-track'
              )}
              taskByCaseId={taskByCase}
              actionsByCaseId={actionsByCaseId}
            />
          </div>
        </div>
      </section>

      <LogExternalStepModal
        open={externalOpen}
        onOpenChange={setExternalOpen}
        currentCase={selectedExternalCase}
        onSubmit={({ title, externalSystem, notes, markAsContactAttempt }) => {
          const selectedTask = selectedExternalTask;
          if (!selectedTask) return;
          logExternalStep({
            caseId: selectedTask.caseId,
            title,
            externalSystem,
            notes,
            markAsContactAttempt
          });
          completeTask(selectedTask.id, notes);
          notify('EXTERNAL STEP logged');
        }}
      />

      {routingCase ? (
        <ScreeningRoutingModal
          open={routingModalOpen}
          onOpenChange={(open) => {
            setRoutingModalOpen(open);
            if (!open) setRoutingCase(null);
          }}
          currentCase={routingCase}
          onRoute={(destination, notes) => {
            routeInitialScreening(routingCase.id, destination, notes);
            notify(destination === 'financial' ? 'Case routed to Financial Screening' : 'Case routed to Senior Coordinator');
            setRoutingCase(null);
            setRoutingModalOpen(false);
          }}
        />
      ) : null}
    </div>
  );
}

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
  { id: 'initial-screen', label: 'Route Screening' },
  { id: 'doc-review', label: 'Doc Review' },
  { id: 'missing-info', label: 'Missing Info' },
  { id: 'scheduling', label: 'Scheduling' },
  { id: 'end-letters', label: 'End Letters' }
] as const;

type QueueTabId = (typeof queueTabs)[number]['id'];

export default function FrontDeskDashboardPage() {
  useRequireAuth();

  const router = useRouter();
  const { hydrated, cases, tasks, documents, completeTask, logExternalStep, routeInitialScreening } = useCases();
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

  const routeScreeningCases = useMemo(
    () =>
      [...cases]
        .filter(
          (currentCase) =>
            currentCase.stage === 'initial-screen' &&
            currentCase.ieConfirmReviewComplete &&
            !currentCase.flags.includes('Pending Senior Review')
        )
        .sort((left, right) => {
          const rightDate = new Date(right.updatedAt ?? right.stageEnteredAt).getTime();
          const leftDate = new Date(left.updatedAt ?? left.stageEnteredAt).getTime();
          return rightDate - leftDate;
        }),
    [cases]
  );

  const frontDeskQueueCases = useMemo(() => {
    const pendingTaskCaseIds = new Set(frontDeskPending.map((task) => task.caseId));
    return [
      ...routeScreeningCases,
      ...cases.filter((currentCase) => pendingTaskCaseIds.has(currentCase.id) && !routeScreeningCases.some((routeCase) => routeCase.id === currentCase.id))
    ];
  }, [cases, frontDeskPending, routeScreeningCases]);

  const taskByCase = useMemo(
    () =>
      frontDeskPending.reduce<Record<string, (typeof frontDeskPending)[number]>>((acc, task) => {
        if (!acc[task.caseId]) acc[task.caseId] = task;
        return acc;
      }, {}),
    [frontDeskPending]
  );

  const queueStatusByCaseId = useMemo(
    () =>
      frontDeskQueueCases.reduce<Record<string, string>>((acc, currentCase) => {
        acc[currentCase.id] = taskByCase[currentCase.id]?.slaStatus ?? currentCase.slaStatus;
        return acc;
      }, {}),
    [frontDeskQueueCases, taskByCase]
  );

  const overdue = frontDeskQueueCases.filter((currentCase) => queueStatusByCaseId[currentCase.id] === 'overdue');
  const dueToday = frontDeskQueueCases.filter((currentCase) => queueStatusByCaseId[currentCase.id] === 'at-risk');
  const upcoming = frontDeskQueueCases.filter((currentCase) => queueStatusByCaseId[currentCase.id] === 'on-track');

  const filteredCases = useMemo(() => {
    const candidates = frontDeskQueueCases;

    if (activeTab === 'all') return candidates;
    if (activeTab === 'intake') {
      return candidates.filter((currentCase) => ['patient-forms', 'staff-review'].includes(currentCase.stage));
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
      return candidates.filter((currentCase) => currentCase.stage === 'staff-review' && currentCase.hasMissingInfo);
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
    if (activeTab === 'initial-screen') {
      return routeScreeningCases;
    }
    return candidates.filter((currentCase) => taskByCase[currentCase.id]?.type === 'send-end-letter');
  }, [activeTab, frontDeskQueueCases, routeScreeningCases, taskByCase, documents]);

  const actionsByCaseId = useMemo(() => {
    const actionMap: Record<string, React.ReactNode> = {};

    filteredCases.forEach((currentCase) => {
      const task = taskByCase[currentCase.id];

      if (
        currentCase.stage === 'initial-screen' &&
        currentCase.ieConfirmReviewComplete &&
        !currentCase.flags.includes('Pending Senior Review')
      ) {
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
        return;
      }

      if (task.type === 'confirm-ie-review') return;

      if (task.type === 'collect-missing-info') return;

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
  }, [filteredCases, taskByCase, router]);

  const openCaseHrefByCaseId = useMemo(() => {
    const hrefMap: Record<string, string> = {};

    filteredCases.forEach((currentCase) => {
      const task = taskByCase[currentCase.id];
      if (task?.type === 'review-document') {
        const docNeedingReview = documents.find(
          (item) =>
            item.caseId === currentCase.id &&
            item.ownership === 'patient' &&
            (item.status === 'needs-review' || item.status === 'received')
        );

        const focusKey = docNeedingReview?.type.startsWith('insurance') ? 'insurance' : docNeedingReview?.type ?? 'documents';
        hrefMap[currentCase.id] = `/cases/${currentCase.id}?tab=documents&focus=${focusKey}`;
      }

      if (task?.type === 'confirm-ie-review') {
        hrefMap[currentCase.id] = `/cases/${currentCase.id}?tab=ie-responses`;
      }

      if (task?.type === 'collect-missing-info') {
        hrefMap[currentCase.id] = `/cases/${currentCase.id}?tab=ie-responses`;
      }
    });

    return hrefMap;
  }, [filteredCases, taskByCase, documents]);

  const openCaseLabelByCaseId = useMemo(() => {
    const labelMap: Record<string, string> = {};

    filteredCases.forEach((currentCase) => {
      if (taskByCase[currentCase.id]?.type === 'review-document') {
        labelMap[currentCase.id] = 'Review Document';
      }

      if (taskByCase[currentCase.id]?.type === 'confirm-ie-review') {
        labelMap[currentCase.id] = 'Review Responses';
      }

      if (taskByCase[currentCase.id]?.type === 'collect-missing-info') {
        labelMap[currentCase.id] = 'Review Responses';
      }
    });

    return labelMap;
  }, [filteredCases, taskByCase]);

  const taskTitleByCaseId = useMemo(() => {
    const titleMap: Record<string, string> = {};

    filteredCases.forEach((currentCase) => {
      if (
        currentCase.stage === 'initial-screen' &&
        currentCase.ieConfirmReviewComplete &&
        !currentCase.flags.includes('Pending Senior Review')
      ) {
        titleMap[currentCase.id] = 'Route Case';
      }
    });

    return titleMap;
  }, [filteredCases]);

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
          { label: 'Upcoming', value: upcoming.length, tone: 'success' }
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
                queueStatusByCaseId[currentCase.id] === 'overdue'
              )}
              taskByCaseId={taskByCase}
              taskTitleByCaseId={taskTitleByCaseId}
              actionsByCaseId={actionsByCaseId}
              openCaseHrefByCaseId={openCaseHrefByCaseId}
              openCaseLabelByCaseId={openCaseLabelByCaseId}
            />
          </div>

          <div>
            <h2 className='mb-2 text-sm font-semibold uppercase tracking-wide text-amber-600'>Due Today / At Risk</h2>
            <CaseQueue
              cases={filteredCases.filter((currentCase) =>
                queueStatusByCaseId[currentCase.id] === 'at-risk'
              )}
              taskByCaseId={taskByCase}
              taskTitleByCaseId={taskTitleByCaseId}
              actionsByCaseId={actionsByCaseId}
              openCaseHrefByCaseId={openCaseHrefByCaseId}
              openCaseLabelByCaseId={openCaseLabelByCaseId}
            />
          </div>

          <div>
            <h2 className='mb-2 text-sm font-semibold uppercase tracking-wide text-emerald-600'>On Track</h2>
            <CaseQueue
              cases={filteredCases.filter((currentCase) =>
                queueStatusByCaseId[currentCase.id] === 'on-track'
              )}
              taskByCaseId={taskByCase}
              taskTitleByCaseId={taskTitleByCaseId}
              actionsByCaseId={actionsByCaseId}
              openCaseHrefByCaseId={openCaseHrefByCaseId}
              openCaseLabelByCaseId={openCaseLabelByCaseId}
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

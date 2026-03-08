'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useRequireAuth } from '@/lib/context/AuthContext';
import { useCases } from '@/lib/context/CaseContext';
import { useNotification } from '@/lib/context/NotificationContext';
import { QueueTabs } from '@/components/dashboard/QueueTabs';
import { DecisionPanel } from '@/components/dashboard/DecisionPanel';
import { AssignPTCModal } from '@/components/modals/AssignPTCModal';
import { Button } from '@/components/ui/button';
import { SLAIndicator } from '@/components/shared/SLAIndicator';
import { DashboardSkeleton } from '@/components/shared/LoadingSkeleton';

const decisionTabMap = [
  { id: 'all', label: 'All', matcher: () => true },
  { id: 'assign-ptc', label: 'Assign PTC', matcher: (type: string, title: string) => type === 'screening-routing' || title.includes('Assign PTC') },
  { id: 'screening-override', label: 'Screening Override', matcher: (type: string) => type === 'screening-override' },
  { id: 'partial-packet', label: 'Partial Packet', matcher: (type: string) => type === 'partial-packet' || type === 'hard-block-override' },
  { id: 'specialist-conflict', label: 'Specialist Conflict', matcher: (type: string) => type === 'specialist-conflict' },
  { id: 'final-decision', label: 'Final Decision', matcher: (type: string) => type === 'final-decision' },
  { id: 'no-response-3x', label: 'No Response 3x', matcher: (type: string) => type === 'no-response-3x' },
  { id: 're-referral', label: 'Re-Referral', matcher: (type: string) => type === 're-referral-eligibility' }
] as const;

type DecisionTabId = (typeof decisionTabMap)[number]['id'];

export default function SeniorDashboardPage() {
  useRequireAuth();

  const { hydrated, decisions, cases, documents, recordDecision, assignPTC } = useCases();
  const { notify } = useNotification();

  const [activeTab, setActiveTab] = useState<DecisionTabId>('all');
  const [selectedDecisionId, setSelectedDecisionId] = useState<string | null>(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);

  const pendingDecisions = useMemo(() => decisions.filter((decision) => decision.status === 'pending'), [decisions]);

  const tabCounts = useMemo(
    () =>
      decisionTabMap.reduce<Record<string, number>>((acc, tab) => {
        acc[tab.id] = pendingDecisions.filter((decision) => tab.matcher(decision.type, decision.title)).length;
        return acc;
      }, {}),
    [pendingDecisions]
  );

  const queue = useMemo(() => {
    if (activeTab === 'all') return pendingDecisions;
    const tabConfig = decisionTabMap.find((tab) => tab.id === activeTab);
    if (!tabConfig) return pendingDecisions;
    return pendingDecisions.filter((decision) => tabConfig.matcher(decision.type, decision.title));
  }, [activeTab, pendingDecisions]);

  const selectedDecision = queue.find((decision) => decision.id === selectedDecisionId) ?? queue[0];
  const selectedCase = selectedDecision ? cases.find((currentCase) => currentCase.id === selectedDecision.caseId) : undefined;

  if (!hydrated) {
    return <DashboardSkeleton />;
  }

  return (
    <div className='space-y-6'>
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <div>
          <h1 className='text-2xl font-semibold text-slate-900'>Senior Coordinator Dashboard</h1>
          <p className='text-sm text-slate-600'>Decision queues with required rationale and audit capture.</p>
        </div>
        <Link href='/pipeline'>
          <Button variant='secondary'>View Full Pipeline →</Button>
        </Link>
      </div>

      <div className='rounded-xl border border-slate-200 bg-white p-4'>
        <p className='mb-3 text-sm font-semibold text-slate-900'>Pending Decisions: {pendingDecisions.length}</p>
        <QueueTabs
          tabs={decisionTabMap.map((tab) => ({ id: tab.id, label: `${tab.label} (${tabCounts[tab.id] ?? 0})` }))}
          activeTab={activeTab}
          onChange={(tab) => setActiveTab(tab as DecisionTabId)}
        />
      </div>

      <div className='grid gap-4 xl:grid-cols-[1.2fr,1fr]'>
        <section className='rounded-xl border border-slate-200 bg-white p-4'>
          <h2 className='mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500'>Decision Queue</h2>
          <div className='space-y-2'>
            {queue.map((decision) => {
              const currentCase = cases.find((item) => item.id === decision.caseId);
              if (!currentCase) return null;

              const isSelected = decision.id === selectedDecision?.id;

              return (
                <button
                  key={decision.id}
                  type='button'
                  className={`w-full rounded-lg border p-3 text-left ${
                    isSelected ? 'border-blue-200 bg-blue-50' : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                  onClick={() => setSelectedDecisionId(decision.id)}
                >
                  <div className='flex items-center justify-between gap-2'>
                    <p className='font-semibold text-slate-900'>
                      {currentCase.patient.lastName}, {currentCase.patient.firstName}
                    </p>
                    <SLAIndicator status={currentCase.slaStatus} />
                  </div>
                  <p className='text-sm text-slate-700'>{decision.title}</p>
                  <p className='text-xs text-slate-500'>{currentCase.flags.join(', ') || 'No flags'}</p>
                </button>
              );
            })}

            {queue.length === 0 ? <p className='text-sm text-slate-500'>No pending decisions in this category.</p> : null}
          </div>
        </section>

        <section>
          <DecisionPanel
            decision={selectedDecision}
            currentCase={selectedCase}
            documents={documents}
            onSubmit={(option, rationale) => {
              if (!selectedDecision) return;
              recordDecision(selectedDecision.id, option, rationale);
              notify('Decision recorded');
            }}
          />

          {selectedDecision?.title.includes('Assign PTC') && selectedCase ? (
            <Button
              className='mt-3 w-full'
              variant='secondary'
              onClick={() => {
                setAssignModalOpen(true);
              }}
            >
              Open Assign PTC Modal
            </Button>
          ) : null}
        </section>
      </div>

      {selectedCase ? (
        <AssignPTCModal
          open={assignModalOpen}
          onOpenChange={setAssignModalOpen}
          currentCase={selectedCase}
          onAssign={(ptcUserId) => {
            assignPTC(selectedCase.id, ptcUserId);
            notify('PTC assigned');
          }}
        />
      ) : null}
    </div>
  );
}

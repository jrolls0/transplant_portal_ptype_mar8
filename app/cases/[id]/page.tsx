'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useRequireAuth } from '@/lib/context/AuthContext';
import { useCases } from '@/lib/context/CaseContext';
import { useNotification } from '@/lib/context/NotificationContext';
import { dashboardRouteForRole } from '@/lib/utils/roleRoutes';
import { caseAudit, caseDecisions, caseDocuments, caseMessages, caseTasks } from '@/lib/utils/caseSelectors';
import { Button } from '@/components/ui/button';
import { CaseHeader } from '@/components/case-cockpit/CaseHeader';
import { StageProgressBar } from '@/components/case-cockpit/StageProgressBar';
import { CockpitTabId, TabNavigation } from '@/components/case-cockpit/TabNavigation';
import { SummaryTab } from '@/components/case-cockpit/SummaryTab';
import { TasksTab } from '@/components/case-cockpit/TasksTab';
import { DocumentsTab } from '@/components/case-cockpit/DocumentsTab';
import { MessagesTab } from '@/components/case-cockpit/MessagesTab';
import { DecisionsTab } from '@/components/case-cockpit/DecisionsTab';
import { SchedulingTab } from '@/components/case-cockpit/SchedulingTab';
import { EndReferralTab } from '@/components/case-cockpit/EndReferralTab';
import { AuditTab } from '@/components/case-cockpit/AuditTab';
import { SendMessageModal } from '@/components/modals/SendMessageModal';
import { CreateTaskModal } from '@/components/modals/CreateTaskModal';
import { LogExternalStepModal } from '@/components/modals/LogExternalStepModal';
import { EndReferralModal } from '@/components/modals/EndReferralModal';
import { CaseCockpitSkeleton } from '@/components/shared/LoadingSkeleton';

export default function CaseCockpitPage() {
  const auth = useRequireAuth();

  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get('tab');
  const {
    hydrated,
    cases,
    tasks,
    documents,
    messages,
    decisions,
    audit,
    completeTask,
    createTask,
    sendMessage,
    logExternalStep,
    validateDocument,
    recordDecision,
    endReferral,
    startReReferral,
    recordSchedulingHuddle,
    markSurginetConfirmed,
    updateSchedulingWindows,
    updateEducationProgress
  } = useCases();
  const { notify } = useNotification();

  const [tab, setTab] = useState<CockpitTabId>('summary');
  const [messageOpen, setMessageOpen] = useState(false);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [externalOpen, setExternalOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);

  const currentCase = cases.find((item) => item.id === params.id);

  const caseTaskList = useMemo(() => (currentCase ? caseTasks(tasks, currentCase.id) : []), [tasks, currentCase]);
  const caseDocumentList = useMemo(() => (currentCase ? caseDocuments(documents, currentCase.id) : []), [documents, currentCase]);
  const caseMessageList = useMemo(() => (currentCase ? caseMessages(messages, currentCase.id) : []), [messages, currentCase]);
  const caseDecisionList = useMemo(() => (currentCase ? caseDecisions(decisions, currentCase.id) : []), [decisions, currentCase]);
  const caseAuditList = useMemo(() => (currentCase ? caseAudit(currentCase.id, audit) : []), [audit, currentCase]);

  useEffect(() => {
    const validTabs: CockpitTabId[] = ['summary', 'tasks', 'documents', 'messages', 'decisions', 'scheduling', 'end-referral', 'audit'];
    if (requestedTab && validTabs.includes(requestedTab as CockpitTabId)) {
      setTab(requestedTab as CockpitTabId);
    }
  }, [requestedTab]);

  if (!hydrated) {
    return <CaseCockpitSkeleton />;
  }

  if (!currentCase) {
    return (
      <div className='rounded-xl border border-slate-200 bg-white p-6'>
        <p className='text-sm text-slate-600'>Case not found.</p>
        <Link href='/pipeline'>
          <Button className='mt-3'>Back to Pipeline</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <Link href={dashboardRouteForRole(auth.currentRole)}>
        <Button variant='ghost' size='sm'>
          <ArrowLeft className='mr-1 h-4 w-4' />
          Back to Dashboard
        </Button>
      </Link>

      <CaseHeader currentCase={currentCase} />
      <StageProgressBar currentCase={currentCase} />

      <TabNavigation activeTab={tab} onChange={setTab} />

      {tab === 'summary' ? (
        <SummaryTab
          currentCase={currentCase}
          tasks={caseTaskList}
          audit={caseAuditList}
          onMessagePatient={() => setMessageOpen(true)}
          onCreateTask={() => setCreateTaskOpen(true)}
          onLogExternalStep={() => setExternalOpen(true)}
          onEscalate={() => {
            createTask({
              caseId: currentCase.id,
              title: 'Escalation Review Requested',
              type: 'screening-override',
              assignedToRole: 'senior-coordinator',
              dueDate: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
              description: 'Escalated from case summary quick action.',
              isExternalStep: false
            });
            notify('Escalation task created');
          }}
          onEndReferral={() => setEndOpen(true)}
        />
      ) : null}

      {tab === 'tasks' ? (
        <TasksTab
          currentCase={currentCase}
          tasks={caseTaskList}
          myRole={auth.currentRole ?? undefined}
          onCompleteTask={(taskId) => {
            completeTask(taskId);
            notify('Task completed successfully');
          }}
          onCreateTask={(payload) => {
            createTask({ caseId: currentCase.id, ...payload });
            notify('Task created successfully');
          }}
        />
      ) : null}

      {tab === 'documents' ? (
        <DocumentsTab
          currentCase={currentCase}
          documents={caseDocumentList}
          onValidateDocument={(documentId, status) => {
            validateDocument(documentId, status);
            notify(status === 'validated' ? 'Document validated' : 'Document rejected');
          }}
          onCreateTask={(payload) => {
            createTask({ caseId: currentCase.id, ...payload });
            notify('Records retrieval task created');
          }}
        />
      ) : null}

      {tab === 'messages' ? (
        <MessagesTab
          currentCase={currentCase}
          messages={caseMessageList}
          onSend={({ recipients, body, markAsContactAttempt }) => {
            sendMessage({
              caseId: currentCase.id,
              toRecipients: recipients,
              body,
              markAsContactAttempt,
              channel: 'in-app'
            });
            notify('Message sent to patient');
          }}
        />
      ) : null}

      {tab === 'decisions' ? (
        <DecisionsTab
          decisions={caseDecisionList}
          onSubmitDecision={(decisionId, option, rationale) => {
            recordDecision(decisionId, option, rationale);
            notify('Decision recorded');
          }}
        />
      ) : null}

      {tab === 'scheduling' ? (
        <SchedulingTab
          currentCase={currentCase}
          onRecordHuddle={(payload) => {
            recordSchedulingHuddle({ caseId: currentCase.id, ...payload });
            notify('Scheduling huddle decision recorded');
          }}
          onMarkSurginet={(notes) => {
            markSurginetConfirmed(currentCase.id, notes);
            notify('Surginet confirmation logged');
          }}
          onUpdateWindows={(windows) => {
            updateSchedulingWindows(currentCase.id, windows);
            notify('Scheduling windows updated');
          }}
          onSimulateEducationComplete={() => {
            updateEducationProgress(currentCase.id, {
              videoWatched: true,
              videoWatchedAt: new Date().toISOString(),
              confirmationFormComplete: true,
              confirmationFormAt: new Date().toISOString(),
              healthcareGuidanceReviewed: true,
              healthcareGuidanceAt: new Date().toISOString()
            });
            notify('Education checklist marked complete');
          }}
        />
      ) : null}

      {tab === 'end-referral' ? (
        <EndReferralTab
          currentCase={currentCase}
          decisions={caseDecisionList}
          onEndReferral={({ reasonCode, rationale, letterDraft }) => {
            endReferral(currentCase.id, reasonCode, rationale, letterDraft);
            notify('Referral ended and letter task created');
          }}
          onStartReReferral={() => {
            startReReferral(currentCase.id);
            notify('Re-referral case created');
          }}
        />
      ) : null}

      {tab === 'audit' ? <AuditTab events={caseAuditList} /> : null}

      <SendMessageModal
        open={messageOpen}
        onOpenChange={setMessageOpen}
        currentCase={currentCase}
        onSend={({ recipients, body, markAsContactAttempt }) => {
          sendMessage({
            caseId: currentCase.id,
            toRecipients: recipients,
            body,
            markAsContactAttempt,
            channel: 'in-app'
          });
          notify('Message sent to patient');
        }}
      />

      <CreateTaskModal
        open={createTaskOpen}
        onOpenChange={setCreateTaskOpen}
        onCreate={(payload) => {
          createTask({ caseId: currentCase.id, ...payload });
          notify('Task created successfully');
        }}
      />

      <LogExternalStepModal
        open={externalOpen}
        onOpenChange={setExternalOpen}
        currentCase={currentCase}
        onSubmit={({ title, externalSystem, notes, markAsContactAttempt }) => {
          logExternalStep({
            caseId: currentCase.id,
            title,
            externalSystem,
            notes,
            markAsContactAttempt
          });
          notify('EXTERNAL STEP logged');
        }}
      />

      <EndReferralModal
        open={endOpen}
        onOpenChange={setEndOpen}
        currentCase={currentCase}
        onApprove={({ reasonCode, rationale, letterDraft }) => {
          endReferral(currentCase.id, reasonCode, rationale, letterDraft);
          notify('Referral ended and letter task created');
        }}
      />
    </div>
  );
}

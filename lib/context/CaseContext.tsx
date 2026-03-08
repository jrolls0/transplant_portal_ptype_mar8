'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { createSeedData } from '@/lib/data/seed';
import { endReasons } from '@/lib/data/endReasons';
import { mockUsers } from '@/lib/data/mockUsers';
import { getNextStage } from '@/lib/utils/stageTransitions';
import { Case, Decision, Message, SeedData, Task, UserRole } from '@/types';
import { useAuth } from '@/lib/context/AuthContext';

const STORAGE_KEY = 'transplant-demo-state';

interface CreateTaskInput {
  caseId: string;
  title: string;
  type: Task['type'];
  assignedToRole: Task['assignedToRole'];
  dueDate: string;
  priority?: Task['priority'];
  description?: string;
  isExternalStep?: boolean;
  externalSystem?: string;
}

interface SendMessageInput {
  caseId: string;
  toRecipients: Message['toRecipients'];
  body: string;
  channel?: Message['channel'];
  markAsContactAttempt?: boolean;
}

interface LogExternalStepInput {
  caseId: string;
  title: string;
  externalSystem: string;
  notes: string;
  markAsContactAttempt?: boolean;
}

interface RecordSchedulingHuddleInput {
  caseId: string;
  type: 'direct-evaluation' | 'testing-first';
  carePartnerRequired: boolean;
  appointmentTypes: string[];
  notes?: string;
}

interface CaseContextValue extends SeedData {
  hydrated: boolean;
  resetDemoData: () => void;
  setCaseStage: (caseId: string, stage: Case['stage']) => void;
  completeTask: (taskId: string, notes?: string) => void;
  createTask: (input: CreateTaskInput) => void;
  sendMessage: (input: SendMessageInput) => void;
  logExternalStep: (input: LogExternalStepInput) => void;
  takePatient: (caseId: string) => void;
  assignPTC: (caseId: string, ptcUserId: string) => void;
  validateDocument: (documentId: string, status?: 'validated' | 'rejected') => void;
  recordDecision: (decisionId: string, selectedOption: string, rationale: string) => void;
  endReferral: (caseId: string, reasonCode: string, rationale: string, letterDraft: string) => void;
  startReReferral: (originalCaseId: string) => void;
  recordSchedulingHuddle: (input: RecordSchedulingHuddleInput) => void;
  markSurginetConfirmed: (caseId: string, notes: string) => void;
  updateSchedulingWindows: (caseId: string, windows: string[]) => void;
}

const CaseContext = createContext<CaseContextValue | undefined>(undefined);

const nowIso = () => new Date().toISOString();

const buildId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const nextCaseNumber = (cases: Case[]) => {
  const max = cases
    .map((item) => Number(item.caseNumber.split('-').at(-1)))
    .filter((value) => Number.isFinite(value))
    .reduce((acc, current) => Math.max(acc, current), 220);

  return `TC-2026-${String(max + 1).padStart(4, '0')}`;
};

export function CaseProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const [data, setData] = useState<SeedData>(createSeedData);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setData(JSON.parse(raw) as SeedData);
      }
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data, hydrated]);

  const actor = auth.currentUser;

  const withAudit = (
    draft: SeedData,
    caseId: string,
    eventType: string,
    description: string,
    metadata?: Record<string, unknown>
  ) => {
    if (!actor) return;
    draft.audit = [
      {
        id: buildId('audit'),
        caseId,
        eventType,
        description,
        performedBy: actor,
        performedAt: nowIso(),
        metadata
      },
      ...draft.audit
    ];
  };

  const setCaseStage = (caseId: string, stage: Case['stage']) => {
    setData((current) => {
      const next = structuredClone(current);
      const target = next.cases.find((item) => item.id === caseId);
      if (!target) return current;

      const previous = target.stage;
      target.stage = stage;
      target.stageEnteredAt = nowIso();
      target.updatedAt = nowIso();

      withAudit(next, caseId, 'STAGE_CHANGE', `Stage changed: ${previous} → ${stage}`);
      return next;
    });
  };

  const completeTask = (taskId: string, notes?: string) => {
    setData((current) => {
      const next = structuredClone(current);
      const targetTask = next.tasks.find((item) => item.id === taskId);
      if (!targetTask || targetTask.status === 'completed') return current;

      targetTask.status = 'completed';
      targetTask.completedAt = nowIso();
      targetTask.completedBy = actor ?? targetTask.completedBy;
      targetTask.completionNotes = notes ?? targetTask.completionNotes;

      const currentCase = next.cases.find((item) => item.id === targetTask.caseId);
      if (!currentCase) return next;

      withAudit(next, currentCase.id, 'TASK_COMPLETED', `${targetTask.title} completed.`, {
        taskId: targetTask.id
      });

      if (targetTask.type === 'confirm-surginet') {
        currentCase.stage = 'scheduled';
        currentCase.schedulingState = 'scheduled';
        currentCase.appointmentConfirmed = true;
        currentCase.updatedAt = nowIso();
        withAudit(next, currentCase.id, 'EXTERNAL_STEP_COMPLETED', 'Surginet confirmation recorded.', {
          notes
        });
      }

      if (targetTask.type === 'scheduling-huddle') {
        currentCase.schedulingState = 'in-progress';
      }

      const casePendingTasks = next.tasks.filter((task) => task.caseId === currentCase.id && task.status !== 'completed');
      if (casePendingTasks.length === 0) {
        const nextStage = getNextStage(currentCase.stage);
        if (nextStage && !['ended', 'scheduled'].includes(currentCase.stage)) {
          const previous = currentCase.stage;
          currentCase.stage = nextStage;
          currentCase.stageEnteredAt = nowIso();
          currentCase.updatedAt = nowIso();
          withAudit(next, currentCase.id, 'STAGE_CHANGE', `Stage changed: ${previous} → ${nextStage}`);
        }
      }

      return next;
    });
  };

  const createTask = (input: CreateTaskInput) => {
    setData((current) => {
      const next = structuredClone(current);
      next.tasks = [
        {
          id: buildId('task'),
          caseId: input.caseId,
          type: input.type,
          title: input.title,
          description: input.description,
          assignedToRole: input.assignedToRole,
          status: 'pending',
          priority: input.priority ?? 'medium',
          dueDate: input.dueDate,
          slaStatus: 'on-track',
          isExternalStep: input.isExternalStep ?? false,
          externalSystem: input.externalSystem,
          createdAt: nowIso()
        },
        ...next.tasks
      ];
      withAudit(next, input.caseId, 'TASK_CREATED', `Task created: ${input.title}`);
      return next;
    });
  };

  const sendMessage = (input: SendMessageInput) => {
    if (!actor) return;

    setData((current) => {
      const next = structuredClone(current);
      const currentCase = next.cases.find((item) => item.id === input.caseId);
      if (!currentCase) return current;

      const attemptNumber = input.markAsContactAttempt ? currentCase.contactAttempts + 1 : undefined;

      next.messages = [
        {
          id: buildId('msg'),
          caseId: input.caseId,
          threadId: `thread-${input.caseId}`,
          fromUser: actor,
          toRecipients: input.toRecipients,
          body: input.body,
          channel: input.channel ?? 'in-app',
          sentAt: nowIso(),
          isContactAttempt: input.markAsContactAttempt,
          attemptNumber
        },
        ...next.messages
      ];

      if (input.markAsContactAttempt) {
        currentCase.contactAttempts += 1;
        currentCase.lastContactAttempt = nowIso();
        if (currentCase.contactAttempts >= 3 && !currentCase.flags.includes('No Response x3')) {
          currentCase.flags.push('No Response x3');
        }
      }

      withAudit(next, input.caseId, 'MESSAGE_SENT', 'Message sent from case cockpit.', {
        recipients: input.toRecipients.map((recipient) => recipient.name).join(', ')
      });

      return next;
    });
  };

  const logExternalStep = (input: LogExternalStepInput) => {
    if (!actor) return;

    setData((current) => {
      const next = structuredClone(current);
      next.tasks = [
        {
          id: buildId('task'),
          caseId: input.caseId,
          type: 'log-external-step',
          title: input.title,
          description: input.notes,
          assignedToRole: actor.role,
          assignedToUser: actor,
          status: 'completed',
          priority: 'medium',
          dueDate: nowIso(),
          slaStatus: 'on-track',
          isExternalStep: true,
          externalSystem: input.externalSystem,
          createdAt: nowIso(),
          completedAt: nowIso(),
          completedBy: actor,
          completionNotes: input.notes
        },
        ...next.tasks
      ];

      const currentCase = next.cases.find((item) => item.id === input.caseId);
      if (!currentCase) return next;

      if (input.markAsContactAttempt) {
        currentCase.contactAttempts += 1;
        currentCase.lastContactAttempt = nowIso();
      }

      withAudit(next, input.caseId, 'EXTERNAL_STEP_COMPLETED', input.title, {
        system: input.externalSystem,
        notes: input.notes
      });

      return next;
    });
  };

  const takePatient = (caseId: string) => {
    if (!actor || actor.role !== 'ptc') return;

    setData((current) => {
      const next = structuredClone(current);
      const currentCase = next.cases.find((item) => item.id === caseId);
      if (!currentCase) return current;
      currentCase.assignedPTC = actor;
      currentCase.ptcAssignedAt = nowIso();
      currentCase.flags = currentCase.flags.filter((flag) => flag !== 'Assign PTC');
      withAudit(next, caseId, 'CASE_ASSIGNED', `Case assigned to ${actor.name}.`);
      return next;
    });
  };

  const assignPTC = (caseId: string, ptcUserId: string) => {
    const selected = mockUsers.find((currentUser) => currentUser.id === ptcUserId && currentUser.role === 'ptc');
    if (!selected) return;

    setData((current) => {
      const next = structuredClone(current);
      const currentCase = next.cases.find((item) => item.id === caseId);
      if (!currentCase) return current;

      currentCase.assignedPTC = selected;
      currentCase.ptcAssignedAt = nowIso();
      currentCase.flags = currentCase.flags.filter((flag) => flag !== 'Assign PTC');
      withAudit(next, caseId, 'DECISION_RECORDED', `PTC assigned: ${selected.name}`);
      return next;
    });
  };

  const validateDocument = (documentId: string, status: 'validated' | 'rejected' = 'validated') => {
    setData((current) => {
      const next = structuredClone(current);
      const target = next.documents.find((item) => item.id === documentId);
      if (!target) return current;
      target.status = status;
      target.reviewedAt = nowIso();
      target.reviewedBy = actor ?? target.reviewedBy;
      withAudit(next, target.caseId, 'DOCUMENT_REVIEWED', `${target.name} marked ${status}.`);
      return next;
    });
  };

  const applyDecisionTransitions = (draft: SeedData, targetDecision: Decision, selectedOption: string, rationale: string) => {
    const currentCase = draft.cases.find((item) => item.id === targetDecision.caseId);
    if (!currentCase) return;

    const lower = selectedOption.toLowerCase();

    if (targetDecision.type === 'screening-override') {
      if (lower.includes('proceed')) currentCase.stage = 'financial-screening';
      if (lower.includes('end')) {
        currentCase.stage = 'ended';
        currentCase.endReason = 'OTHER';
        currentCase.endRationale = rationale;
      }
    }

    if (targetDecision.type === 'hard-block-override' || targetDecision.type === 'partial-packet') {
      if (lower.includes('proceed')) currentCase.stage = 'medical-records-review';
      if (lower.includes('end')) {
        currentCase.stage = 'ended';
        currentCase.endReason = 'ADM-INCOMPLETE';
        currentCase.endRationale = rationale;
      }
    }

    if (targetDecision.type === 'specialist-conflict' && lower.includes('proceed')) {
      currentCase.stage = 'final-decision';
    }

    if (targetDecision.type === 'final-decision') {
      if (lower.includes('approve')) currentCase.stage = 'education';
      if (lower.includes('not')) {
        currentCase.stage = 'ended';
        currentCase.endReason = 'CLN-INCLUSION';
        currentCase.endRationale = rationale;
      }
    }

    if (targetDecision.type === 'no-response-3x' && lower.includes('end')) {
      currentCase.stage = 'ended';
      currentCase.endReason = 'PAT-NORESP';
      currentCase.endRationale = rationale;
    }

    if (targetDecision.type === 're-referral-eligibility' && lower.includes('eligible')) {
      currentCase.stage = 'patient-onboarding';
      currentCase.flags = currentCase.flags.filter((flag) => flag !== 'Re-Referral Pending');
    }

    if (currentCase.stage === 'ended') {
      currentCase.endedAt = nowIso();
      currentCase.endedBy = actor?.name;

      draft.tasks = [
        {
          id: buildId('task'),
          caseId: currentCase.id,
          type: 'send-end-letter',
          title: 'Send End Referral Letter (Patient + Clinic)',
          assignedToRole: 'front-desk',
          status: 'pending',
          priority: 'high',
          dueDate: nowIso(),
          slaStatus: 'at-risk',
          isExternalStep: false,
          createdAt: nowIso()
        },
        ...draft.tasks
      ];
    }

    currentCase.stageEnteredAt = nowIso();
    currentCase.updatedAt = nowIso();
  };

  const recordDecision = (decisionId: string, selectedOption: string, rationale: string) => {
    if (!actor) return;

    setData((current) => {
      const next = structuredClone(current);
      const target = next.decisions.find((item) => item.id === decisionId);
      if (!target) return current;

      target.selectedOption = selectedOption;
      target.rationale = rationale;
      target.status = 'completed';
      target.decidedBy = actor;
      target.decidedAt = nowIso();

      applyDecisionTransitions(next, target, selectedOption, rationale);

      withAudit(next, target.caseId, 'DECISION_RECORDED', `${target.title}: ${selectedOption}`, {
        rationale
      });

      return next;
    });
  };

  const endReferral = (caseId: string, reasonCode: string, rationale: string, letterDraft: string) => {
    if (!actor) return;

    setData((current) => {
      const next = structuredClone(current);
      const currentCase = next.cases.find((item) => item.id === caseId);
      if (!currentCase) return current;

      currentCase.stage = 'ended';
      currentCase.stageEnteredAt = nowIso();
      currentCase.endReason = reasonCode;
      currentCase.endRationale = rationale;
      currentCase.endedAt = nowIso();
      currentCase.endedBy = actor.name;
      currentCase.updatedAt = nowIso();

      next.decisions = [
        {
          id: buildId('decision'),
          caseId,
          type: 'end-referral',
          title: 'End Referral Approval',
          options: ['Approve & End Referral'],
          selectedOption: 'Approve & End Referral',
          rationale,
          decidedBy: actor,
          decidedAt: nowIso(),
          status: 'completed',
          letterDraft,
          letterApproved: true,
          letterApprovedAt: nowIso(),
          createdAt: nowIso()
        },
        ...next.decisions
      ];

      next.tasks = [
        {
          id: buildId('task'),
          caseId,
          type: 'send-end-letter',
          title: 'Send End Referral Letter (Patient + Clinic)',
          assignedToRole: 'front-desk',
          status: 'pending',
          priority: 'high',
          dueDate: nowIso(),
          slaStatus: 'at-risk',
          isExternalStep: false,
          createdAt: nowIso()
        },
        ...next.tasks
      ];

      withAudit(next, caseId, 'REFERRAL_ENDED', `Referral ended with reason code ${reasonCode}`, {
        rationale,
        letterDraft
      });

      return next;
    });
  };

  const startReReferral = (originalCaseId: string) => {
    if (!actor) return;

    setData((current) => {
      const next = structuredClone(current);
      const original = next.cases.find((item) => item.id === originalCaseId);
      if (!original) return current;

      const linkedCaseId = buildId('case');
      const linkedCase: Case = {
        ...original,
        id: linkedCaseId,
        caseNumber: nextCaseNumber(next.cases),
        stage: 're-referral-review',
        stageEnteredAt: nowIso(),
        linkedFromCaseId: original.id,
        linkedToCaseId: undefined,
        endReason: undefined,
        endRationale: undefined,
        endedAt: undefined,
        endedBy: undefined,
        createdAt: nowIso(),
        updatedAt: nowIso(),
        daysInStage: 0,
        flags: ['Re-Referral Pending'],
        initialTodosComplete: {
          inclusionExclusion: false,
          governmentId: false,
          insuranceCard: false
        },
        ieConfirmReviewComplete: false,
        schedulingDecision: undefined,
        schedulingWindows: undefined,
        schedulingState: undefined,
        appointmentConfirmed: false,
        appointmentDate: undefined
      };

      next.cases = [linkedCase, ...next.cases];
      original.linkedToCaseId = linkedCaseId;

      next.tasks = [
        {
          id: buildId('task'),
          caseId: linkedCaseId,
          type: 're-referral-review',
          title: 'Re-Referral Review',
          assignedToRole: 'senior-coordinator',
          status: 'pending',
          priority: 'high',
          dueDate: nowIso(),
          slaStatus: 'on-track',
          isExternalStep: false,
          createdAt: nowIso()
        },
        ...next.tasks
      ];

      next.decisions = [
        {
          id: buildId('decision'),
          caseId: linkedCaseId,
          type: 're-referral-eligibility',
          title: 'Re-Referral Review',
          options: ['Eligible - restart workflow', 'Not eligible yet'],
          status: 'pending',
          createdAt: nowIso()
        },
        ...next.decisions
      ];

      withAudit(next, original.id, 'RE_REFERRAL_STARTED', `Re-referral started: ${linkedCase.caseNumber}`, {
        linkedCaseId
      });

      return next;
    });
  };

  const recordSchedulingHuddle = (input: RecordSchedulingHuddleInput) => {
    if (!actor) return;

    setData((current) => {
      const next = structuredClone(current);
      const currentCase = next.cases.find((item) => item.id === input.caseId);
      if (!currentCase) return current;

      currentCase.schedulingDecision = {
        type: input.type,
        carePartnerRequired: input.carePartnerRequired,
        appointmentTypes: input.appointmentTypes,
        notes: input.notes,
        decidedBy: actor.name,
        decidedAt: nowIso()
      };
      currentCase.schedulingState = 'in-progress';
      currentCase.stage = 'scheduling';
      currentCase.stageEnteredAt = nowIso();
      currentCase.updatedAt = nowIso();

      withAudit(next, input.caseId, 'SCHEDULING_HUDDLE', 'Scheduling huddle decision recorded.', {
        type: input.type,
        carePartnerRequired: input.carePartnerRequired
      });

      return next;
    });
  };

  const markSurginetConfirmed = (caseId: string, notes: string) => {
    setData((current) => {
      const next = structuredClone(current);
      const currentCase = next.cases.find((item) => item.id === caseId);
      if (!currentCase) return current;

      currentCase.stage = 'scheduled';
      currentCase.schedulingState = 'scheduled';
      currentCase.appointmentConfirmed = true;
      currentCase.updatedAt = nowIso();

      withAudit(next, caseId, 'EXTERNAL_STEP_COMPLETED', 'Confirmed appointment in Surginet.', {
        notes
      });

      return next;
    });
  };

  const updateSchedulingWindows = (caseId: string, windows: string[]) => {
    setData((current) => {
      const next = structuredClone(current);
      const currentCase = next.cases.find((item) => item.id === caseId);
      if (!currentCase) return current;
      currentCase.schedulingWindows = windows;
      currentCase.schedulingState = 'in-progress';
      currentCase.updatedAt = nowIso();
      withAudit(next, caseId, 'SCHEDULING_WINDOWS_UPDATED', 'Scheduling windows updated.');
      return next;
    });
  };

  const resetDemoData = () => {
    const next = createSeedData();
    setData(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const value = useMemo<CaseContextValue>(
    () => ({
      ...data,
      hydrated,
      resetDemoData,
      setCaseStage,
      completeTask,
      createTask,
      sendMessage,
      logExternalStep,
      takePatient,
      assignPTC,
      validateDocument,
      recordDecision,
      endReferral,
      startReReferral,
      recordSchedulingHuddle,
      markSurginetConfirmed,
      updateSchedulingWindows
    }),
    [data, hydrated]
  );

  return <CaseContext.Provider value={value}>{children}</CaseContext.Provider>;
}

export function useCases() {
  const context = useContext(CaseContext);
  if (!context) {
    throw new Error('useCases must be used within CaseProvider');
  }
  return context;
}

export function buildEndLetter(reasonCode: string, patientLastName: string) {
  const reason = endReasons.find((item) => item.code === reasonCode);
  return `Dear Mr./Ms. ${patientLastName},\n\nWe regret to inform you that your referral to the ChristianaCare Kidney Transplant Program has been ended.\n\nReason: ${reason?.label ?? reasonCode}.\n\nTo be re-referred in the future, you will need to:\n${(reason?.reReferralRequirements ?? ['Please contact our office for detailed requirements.']).map((line) => `• ${line}`).join('\n')}\n\nIf you have questions, please contact us at (302) 555-0100.\n\nSincerely,\nChristianaCare Transplant Team`;
}

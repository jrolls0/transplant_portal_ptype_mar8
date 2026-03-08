'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createSeedData } from '@/lib/data/seed';
import { endReasons } from '@/lib/data/endReasons';
import { documentCatalog } from '@/lib/data/documentCatalog';
import { mockUsers } from '@/lib/data/mockUsers';
import { maybeAdvanceCaseStage } from '@/lib/utils/stageTransitions';
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
  setTaskStatus: (taskId: string, status: Task['status'], notes?: string) => void;
  completeTask: (taskId: string, notes?: string) => void;
  createTask: (input: CreateTaskInput) => void;
  sendMessage: (input: SendMessageInput) => void;
  logExternalStep: (input: LogExternalStepInput) => void;
  takePatient: (caseId: string) => void;
  assignPTC: (caseId: string, ptcUserId: string) => void;
  routeInitialScreening: (caseId: string, destination: 'financial' | 'senior', notes: string) => void;
  validateDocument: (documentId: string, status?: 'validated' | 'rejected') => void;
  recordDecision: (decisionId: string, selectedOption: string, rationale: string) => void;
  createDecision: (input: { caseId: string; type: Decision['type']; title: string; options: string[] }) => void;
  addCaseFlag: (caseId: string, flag: string) => void;
  removeCaseFlag: (caseId: string, flag: string) => void;
  endReferral: (caseId: string, reasonCode: string, rationale: string, letterDraft: string) => void;
  startReReferral: (originalCaseId: string) => void;
  recordSchedulingHuddle: (input: RecordSchedulingHuddleInput) => void;
  markSurginetConfirmed: (caseId: string, notes: string) => void;
  updateSchedulingWindows: (caseId: string, windows: string[]) => void;
  updateEducationProgress: (
    caseId: string,
    progress: Partial<NonNullable<Case['educationProgress']>>
  ) => void;
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

  const syncContactAttemptEscalation = (next: SeedData, currentCase: Case) => {
    const attemptFlags = ['No Response x1', 'No Response x2', 'No Response x3'];
    currentCase.flags = currentCase.flags.filter((flag) => !attemptFlags.includes(flag));

    if (currentCase.contactAttempts === 1) {
      currentCase.flags.push('No Response x1');
      return;
    }

    if (currentCase.contactAttempts === 2) {
      currentCase.flags.push('No Response x2');
      return;
    }

    if (currentCase.contactAttempts < 3) {
      return;
    }

    currentCase.flags.push('No Response x3');

    const existingDecision = next.decisions.find(
      (decision) => decision.caseId === currentCase.id && decision.type === 'no-response-3x' && decision.status === 'pending'
    );

    if (existingDecision) return;

    next.decisions.unshift({
      id: buildId('decision'),
      caseId: currentCase.id,
      type: 'no-response-3x',
      title: 'No Response After 3 Attempts',
      options: ['Continue outreach (reset counter)', 'End referral (No Response)'],
      status: 'pending',
      createdAt: nowIso()
    });

    next.tasks.unshift({
      id: buildId('task'),
      caseId: currentCase.id,
      type: 'final-decision',
      title: 'Decision Required: No Response After 3 Attempts',
      description:
        'Patient has not responded after 3 documented contact attempts. Senior Coordinator must decide whether to continue outreach or end the referral.',
      assignedToRole: 'senior-coordinator',
      status: 'pending',
      priority: 'urgent',
      dueDate: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      slaStatus: 'at-risk',
      isExternalStep: false,
      createdAt: nowIso()
    });

    withAudit(
      next,
      currentCase.id,
      'NO_RESPONSE_3X_ESCALATION',
      'Patient unresponsive after 3 contact attempts. Decision escalated to Senior Coordinator.',
      { attempts: currentCase.contactAttempts }
    );
  };

  const setTaskStatus = (taskId: string, status: Task['status'], notes?: string) => {
    setData((current) => {
      const next = structuredClone(current);
      const targetTask = next.tasks.find((item) => item.id === taskId);
      if (!targetTask) return current;
      const currentCase = next.cases.find((item) => item.id === targetTask.caseId);

      targetTask.status = status;
      if (notes) {
        targetTask.completionNotes = notes;
      }

      if (status === 'completed') {
        targetTask.completedAt = nowIso();
        targetTask.completedBy = actor ?? targetTask.completedBy;
      }
      if (currentCase) {
        currentCase.updatedAt = nowIso();
      }

      withAudit(next, targetTask.caseId, 'TASK_STATUS_UPDATED', `${targetTask.title} marked ${status}.`, {
        taskId,
        notes
      });

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

      if (targetTask.type === 'confirm-ie-review') {
        currentCase.ieConfirmReviewComplete = true;
        currentCase.updatedAt = nowIso();
        currentCase.flags = currentCase.flags.filter((flag) => flag !== 'I/E Review Pending');
        withAudit(
          next,
          currentCase.id,
          'IE_REVIEW_CONFIRMED',
          'Front Desk confirmed Inclusion/Exclusion responses are acceptable.'
        );
      }

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

      if (targetTask.type === 'specialist-review') {
        const specialistTasks = next.tasks.filter((task) => task.caseId === currentCase.id && task.type === 'specialist-review');
        const completedSpecialistTasks = specialistTasks.filter((task) => task.status === 'completed');
        const allCompleted = specialistTasks.length >= 3 && completedSpecialistTasks.length === specialistTasks.length;

        if (allCompleted) {
          const hasEscalation = completedSpecialistTasks.some((task) =>
            task.completionNotes?.toLowerCase().includes('escalat')
          );

          if (hasEscalation) {
            const existingConflict = next.decisions.find(
              (decision) =>
                decision.caseId === currentCase.id &&
                decision.type === 'specialist-conflict' &&
                decision.status === 'pending'
            );

            if (!existingConflict) {
              if (!currentCase.flags.includes('Specialist Conflict')) {
                currentCase.flags.push('Specialist Conflict');
              }

              next.decisions.unshift({
                id: buildId('decision'),
                caseId: currentCase.id,
                type: 'specialist-conflict',
                title: 'Resolve Specialist Review Conflict',
                options: ['Proceed to Final Decision', 'Request additional review', 'Schedule committee review'],
                status: 'pending',
                createdAt: nowIso()
              });

              next.tasks.unshift({
                id: buildId('task'),
                caseId: currentCase.id,
                type: 'screening-override',
                title: 'Resolve Specialist Conflict',
                description: 'One or more specialists raised concerns during review.',
                assignedToRole: 'senior-coordinator',
                status: 'pending',
                priority: 'high',
                dueDate: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
                slaStatus: 'at-risk',
                isExternalStep: false,
                createdAt: nowIso()
              });

              withAudit(
                next,
                currentCase.id,
                'SPECIALIST_CONFLICT_DETECTED',
                'Conflicting specialist outcomes require Senior Coordinator review.'
              );
            }
          }
        }
      }

      const caseTasks = next.tasks.filter((task) => task.caseId === currentCase.id);
      const nextStage = maybeAdvanceCaseStage(currentCase, caseTasks, next.documents);
      if (nextStage && !['ended', 'scheduled'].includes(currentCase.stage)) {
        const previous = currentCase.stage;
        currentCase.stage = nextStage;
        currentCase.stageEnteredAt = nowIso();
        currentCase.updatedAt = nowIso();
        withAudit(next, currentCase.id, 'STAGE_CHANGE', `Stage changed: ${previous} → ${nextStage}`);
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

      if (input.markAsContactAttempt) {
        currentCase.contactAttempts += 1;
        currentCase.lastContactAttempt = nowIso();
        syncContactAttemptEscalation(next, currentCase);
      }

      const attemptNumber = input.markAsContactAttempt ? currentCase.contactAttempts : undefined;

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
      const currentCase = next.cases.find((item) => item.id === input.caseId);
      if (!currentCase) return current;

      if (input.markAsContactAttempt) {
        currentCase.contactAttempts += 1;
        currentCase.lastContactAttempt = nowIso();
        syncContactAttemptEscalation(next, currentCase);
      }

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

      withAudit(next, input.caseId, 'EXTERNAL_STEP_COMPLETED', input.title, {
        system: input.externalSystem,
        notes: input.notes,
        contactAttempt: Boolean(input.markAsContactAttempt),
        attemptNumber: input.markAsContactAttempt ? currentCase.contactAttempts : undefined
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

  const routeInitialScreening = (caseId: string, destination: 'financial' | 'senior', notes: string) => {
    if (!actor) return;

    setData((current) => {
      const next = structuredClone(current);
      const currentCase = next.cases.find((item) => item.id === caseId);
      if (!currentCase) return current;

      if (destination === 'financial') {
        currentCase.stage = 'financial-screening';
        currentCase.stageEnteredAt = nowIso();
        currentCase.updatedAt = nowIso();
        currentCase.flags = currentCase.flags.filter((flag) => flag !== 'Pending Senior Review');

        next.tasks.unshift({
          id: buildId('task'),
          caseId,
          type: 'financial-screening',
          title: 'Financial Screening Review',
          description: notes || 'Review insurance and verify coverage.',
          assignedToRole: 'financial',
          status: 'pending',
          priority: 'high',
          dueDate: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString(),
          slaStatus: 'on-track',
          isExternalStep: false,
          createdAt: nowIso()
        });

        if (!currentCase.assignedPTC && !currentCase.flags.includes('Assign PTC')) {
          currentCase.flags.push('Assign PTC');
        }

        next.decisions.unshift({
          id: buildId('decision'),
          caseId,
          type: 'screening-routing',
          title: 'Initial Screening Routing',
          options: ['Route to Financial', 'Route to Senior Coordinator'],
          selectedOption: 'Route to Financial',
          rationale: notes || 'Patient responses acceptable for financial screening.',
          decidedBy: actor,
          decidedAt: nowIso(),
          status: 'completed',
          createdAt: nowIso()
        });

        withAudit(next, caseId, 'SCREENING_ROUTED', 'Routed to Financial Screening.', { destination: 'financial', notes });
      } else {
        currentCase.updatedAt = nowIso();
        const existingDecision = next.decisions.find(
          (decision) => decision.caseId === caseId && decision.type === 'screening-override' && decision.status === 'pending'
        );
        if (!existingDecision) {
          next.decisions.unshift({
            id: buildId('decision'),
            caseId,
            type: 'screening-override',
            title: 'Screening Override Review',
            options: ['Override - Proceed to Financial', 'Request clarification from patient', 'End referral'],
            status: 'pending',
            createdAt: nowIso()
          });
        }

        next.tasks.unshift({
          id: buildId('task'),
          caseId,
          type: 'screening-override',
          title: 'Review Flagged Initial Screening',
          description: notes ? `Front Desk notes: ${notes}` : 'Front Desk flagged case for Senior Coordinator review.',
          assignedToRole: 'senior-coordinator',
          status: 'pending',
          priority: 'urgent',
          dueDate: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
          slaStatus: 'at-risk',
          isExternalStep: false,
          createdAt: nowIso()
        });

        if (!currentCase.flags.includes('Pending Senior Review')) {
          currentCase.flags.push('Pending Senior Review');
        }

        withAudit(next, caseId, 'SCREENING_FLAGGED', `Routed to Senior Coordinator for review: ${notes}`, {
          destination: 'senior',
          notes
        });
      }

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

  const createDecision = (input: { caseId: string; type: Decision['type']; title: string; options: string[] }) => {
    setData((current) => {
      const next = structuredClone(current);
      next.decisions.unshift({
        id: buildId('decision'),
        caseId: input.caseId,
        type: input.type,
        title: input.title,
        options: input.options,
        status: 'pending',
        createdAt: nowIso()
      });

      withAudit(next, input.caseId, 'DECISION_CREATED', `Decision created: ${input.title}`);
      return next;
    });
  };

  const addCaseFlag = (caseId: string, flag: string) => {
    setData((current) => {
      const next = structuredClone(current);
      const currentCase = next.cases.find((item) => item.id === caseId);
      if (!currentCase) return current;
      if (!currentCase.flags.includes(flag)) {
        currentCase.flags.push(flag);
        currentCase.updatedAt = nowIso();
        withAudit(next, caseId, 'FLAG_ADDED', `Flag added: ${flag}`);
      }
      return next;
    });
  };

  const removeCaseFlag = (caseId: string, flag: string) => {
    setData((current) => {
      const next = structuredClone(current);
      const currentCase = next.cases.find((item) => item.id === caseId);
      if (!currentCase) return current;
      if (currentCase.flags.includes(flag)) {
        currentCase.flags = currentCase.flags.filter((currentFlag) => currentFlag !== flag);
        currentCase.updatedAt = nowIso();
        withAudit(next, caseId, 'FLAG_REMOVED', `Flag removed: ${flag}`);
      }
      return next;
    });
  };

  const applyDecisionTransitions = (draft: SeedData, targetDecision: Decision, selectedOption: string, rationale: string) => {
    const currentCase = draft.cases.find((item) => item.id === targetDecision.caseId);
    if (!currentCase) return;

    const lower = selectedOption.toLowerCase();

    if (targetDecision.type === 'screening-override') {
      if (lower.includes('proceed') || lower.includes('override')) currentCase.stage = 'financial-screening';
      if (lower.includes('end')) {
        currentCase.stage = 'ended';
        currentCase.endReason = 'OTHER';
        currentCase.endRationale = rationale;
      }
      currentCase.flags = currentCase.flags.filter((flag) => flag !== 'Pending Senior Review');
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
      currentCase.flags = currentCase.flags.filter((flag) => flag !== 'Specialist Conflict');
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

    if (targetDecision.type === 'no-response-3x' && lower.includes('continue')) {
      currentCase.contactAttempts = 0;
      currentCase.lastContactAttempt = undefined;
      currentCase.flags = currentCase.flags.filter((flag) => !/^No Response x\d/.test(flag));
      withAudit(
        draft,
        currentCase.id,
        'OUTREACH_COUNTER_RESET',
        'Senior Coordinator chose to continue outreach and reset no-response counter.'
      );
    }

    if (targetDecision.type === 're-referral-eligibility' && (lower.includes('eligible') || lower.includes('proceed'))) {
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

      const originalDocs = next.documents.filter((document) => document.caseId === originalCaseId);
      const expiredDocs: string[] = [];
      const reusableDocs: string[] = [];

      originalDocs.forEach((document) => {
        if (document.status !== 'validated') return;

        const catalogItem = documentCatalog.find((catalog) => catalog.type === document.type);
        if (!catalogItem?.maxAgeDays || !document.uploadedAt) {
          reusableDocs.push(document.name);
          return;
        }

        const ageInDays = (Date.now() - new Date(document.uploadedAt).getTime()) / (1000 * 60 * 60 * 24);
        if (ageInDays > catalogItem.maxAgeDays) {
          expiredDocs.push(document.name);
        } else {
          reusableDocs.push(document.name);
        }
      });

      const endReason = endReasons.find((reason) => reason.code === original.endReason);
      const returnRequirements = endReason?.reReferralRequirements ?? ['Contact transplant center'];

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
        contactAttempts: 0,
        lastContactAttempt: undefined,
        schedulingDecision: undefined,
        schedulingWindows: undefined,
        schedulingState: undefined,
        appointmentConfirmed: false,
        appointmentDate: undefined,
        assignedPTC: undefined,
        ptcAssignedAt: undefined
      };

      next.cases = [linkedCase, ...next.cases];
      original.linkedToCaseId = linkedCaseId;

      next.tasks = [
        {
          id: buildId('task'),
          caseId: linkedCaseId,
          type: 're-referral-review',
          title: 'Re-Referral Eligibility Review',
          description: `Prior end reason: ${endReason?.label ?? original.endReason}.\n\nReturn requirements:\n${returnRequirements.map((line) => `• ${line}`).join('\n')}\n\nExpired documents (need re-collection): ${
            expiredDocs.join(', ') || 'None'
          }\nReusable documents: ${reusableDocs.join(', ') || 'None'}`,
          assignedToRole: 'senior-coordinator',
          status: 'pending',
          priority: 'high',
          dueDate: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString(),
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
          title: 'Re-Referral Eligibility Review',
          options: [
            'Return requirements met - Proceed to workflow',
            'Missing items - Request additional documentation',
            'Return requirements not met - End referral'
          ],
          status: 'pending',
          createdAt: nowIso()
        },
        ...next.decisions
      ];

      withAudit(next, original.id, 'RE_REFERRAL_STARTED', `Re-referral case created: ${linkedCase.caseNumber}`, {
        linkedCaseId,
        expiredDocs,
        reusableDocs,
        returnRequirements
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

  const updateEducationProgress = (
    caseId: string,
    progress: Partial<NonNullable<Case['educationProgress']>>
  ) => {
    setData((current) => {
      const next = structuredClone(current);
      const currentCase = next.cases.find((item) => item.id === caseId);
      if (!currentCase) return current;

      currentCase.educationProgress = {
        videoWatched: currentCase.educationProgress?.videoWatched ?? false,
        confirmationFormComplete: currentCase.educationProgress?.confirmationFormComplete ?? false,
        healthcareGuidanceReviewed: currentCase.educationProgress?.healthcareGuidanceReviewed ?? false,
        ...currentCase.educationProgress,
        ...progress
      };
      currentCase.updatedAt = nowIso();

      withAudit(next, caseId, 'EDUCATION_PROGRESS_UPDATED', 'Education progress updated.', progress as Record<string, unknown>);
      return next;
    });
  };

  const resetDemoData = () => {
    const next = createSeedData();
    setData(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const value: CaseContextValue = {
    ...data,
    hydrated,
    resetDemoData,
    setCaseStage,
    setTaskStatus,
    completeTask,
    createTask,
    sendMessage,
    logExternalStep,
    takePatient,
    assignPTC,
    routeInitialScreening,
    validateDocument,
    recordDecision,
    createDecision,
    addCaseFlag,
    removeCaseFlag,
    endReferral,
    startReReferral,
    recordSchedulingHuddle,
    markSurginetConfirmed,
    updateSchedulingWindows,
    updateEducationProgress
  };

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

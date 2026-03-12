import { orderedProgressStages, stageDefinitions } from '@/lib/data/stages';
import { Case, CaseStage, Document, Task } from '@/types';

const nextMap: Partial<Record<CaseStage, CaseStage>> = {
  'new-referral': 'onboarding',
  onboarding: 'patient-forms',
  'patient-forms': 'staff-review',
  'staff-review': 'initial-screen',
  'initial-screen': 'financial',
  financial: 'records-req',
  'records-req': 'records-review',
  'records-review': 'specialists',
  specialists: 'final-decision',
  'final-decision': 'education',
  education: 'scheduling',
  scheduling: 'scheduled'
};

export function getNextStage(stage: CaseStage): CaseStage | undefined {
  return nextMap[stage];
}

export function getStageOrder(stage: CaseStage) {
  return stageDefinitions.find((item) => item.id === stage)?.order ?? 0;
}

export function getVisibleProgressIndex(stage: CaseStage) {
  const index = orderedProgressStages.indexOf(stage);
  if (index >= 0) return index;
  if (stage === 'scheduled' || stage === 'ended') return orderedProgressStages.length - 1;
  return 0;
}

export function checkHardBlocksCleared(caseId: string, documents: Document[]): { cleared: boolean; missing: Document[] } {
  const caseDocuments = documents.filter((document) => document.caseId === caseId);
  const missingHardBlocks = caseDocuments.filter((document) => document.isHardBlock && document.status !== 'validated');

  return {
    cleared: missingHardBlocks.length === 0,
    missing: missingHardBlocks
  };
}

export function canAdvanceFromRecordsCollection(
  currentCase: Case,
  documents: Document[],
  hasPartialPacketDecision: boolean
): { canAdvance: boolean; reason?: string; missingDocs?: Document[] } {
  const { cleared, missing } = checkHardBlocksCleared(currentCase.id, documents);

  if (cleared) {
    return { canAdvance: true };
  }

  if (hasPartialPacketDecision) {
    return { canAdvance: true, reason: 'Advancing with Senior Coordinator override' };
  }

  return {
    canAdvance: false,
    reason: `Hard-block documents missing: ${missing.map((document) => document.name).join(', ')}`,
    missingDocs: missing
  };
}

export function maybeAdvanceCaseStage(
  currentCase: Case,
  caseTasks: Task[],
  caseDocuments?: Document[]
): CaseStage | undefined {
  if (currentCase.stage === 'initial-screen') return undefined;

  const pendingBlocking = caseTasks.some((task) => task.status !== 'completed' && task.priority !== 'low');
  if (pendingBlocking) return undefined;

  if (currentCase.stage === 'staff-review' && currentCase.hasMissingInfo) {
    return undefined;
  }

  if (currentCase.stage === 'records-req' && caseDocuments) {
    const { cleared } = checkHardBlocksCleared(currentCase.id, caseDocuments);
    if (!cleared) return undefined;
  }

  return getNextStage(currentCase.stage);
}

export function stageDisplay(stage: CaseStage) {
  if (stage === 'scheduled') return 'Scheduled';
  if (stage === 'ended') return 'Ended';
  if (stage === 're-referral-review') return 'Re-Referral Review';
  return stageDefinitions.find((item) => item.id === stage)?.name ?? stage;
}

export function caseStageDisplay(currentCase: Case) {
  if (currentCase.stage === 'staff-review' && currentCase.hasMissingInfo) {
    return 'Staff Review (Missing Info)';
  }

  return stageDisplay(currentCase.stage);
}

import { orderedProgressStages, stageDefinitions } from '@/lib/data/stages';
import { Case, CaseStage, Task } from '@/types';

const nextMap: Partial<Record<CaseStage, CaseStage>> = {
  'new-referral': 'patient-onboarding',
  'patient-onboarding': 'initial-todos',
  'initial-todos': 'follow-through',
  'follow-through': 'intermediary-step',
  'intermediary-step': 'initial-screening',
  'initial-screening': 'financial-screening',
  'financial-screening': 'records-collection',
  'records-collection': 'medical-records-review',
  'medical-records-review': 'specialist-review',
  'specialist-review': 'final-decision',
  'final-decision': 'education',
  education: 'scheduling',
  scheduling: 'scheduled'
};

export function getNextStage(stage: CaseStage): CaseStage | undefined {
  return nextMap[stage];
}

export function getStageOrder(stage: CaseStage) {
  return stageDefinitions.find((s) => s.id === stage)?.order ?? 0;
}

export function getVisibleProgressIndex(stage: CaseStage) {
  const index = orderedProgressStages.indexOf(stage as (typeof orderedProgressStages)[number]);
  if (index >= 0) return index;
  if (stage === 'scheduled') return orderedProgressStages.length - 1;
  if (stage === 'ended') return orderedProgressStages.length - 1;
  return 0;
}

export function maybeAdvanceCaseStage(currentCase: Case, caseTasks: Task[]): CaseStage | undefined {
  const pendingBlocking = caseTasks.some((task) => task.status !== 'completed' && task.priority !== 'low');
  if (pendingBlocking) return undefined;
  return getNextStage(currentCase.stage);
}

export function stageDisplay(stage: CaseStage) {
  return (
    stageDefinitions.find((s) => s.id === stage)?.name ?? stage
  );
}

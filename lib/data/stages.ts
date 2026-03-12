import { CaseStage, StageDefinition } from '@/types';

export const stages: StageDefinition[] = [
  {
    id: 'new-referral',
    name: 'New Referral',
    shortName: 'New Referral',
    order: 1,
    slaDays: 1,
    description: 'Dialysis clinic submits referral, system creates case'
  },
  {
    id: 'onboarding',
    name: 'Onboarding',
    shortName: 'Onboarding',
    order: 2,
    slaDays: 3,
    description: 'Patient registers and signs ROI forms'
  },
  {
    id: 'patient-forms',
    name: 'Patient Forms',
    shortName: 'Patient Forms',
    order: 3,
    slaDays: 7,
    description: 'Patient completes I/E form, uploads ID and insurance'
  },
  {
    id: 'staff-review',
    name: 'Staff Review',
    shortName: 'Staff Review',
    order: 4,
    slaDays: 3,
    description: 'Front Desk validates documents and reviews I/E responses'
  },
  {
    id: 'initial-screen',
    name: 'Initial Screen',
    shortName: 'Initial Screen',
    order: 5,
    slaDays: 2,
    description: 'Front Desk routes case to Financial or Senior Coordinator'
  },
  {
    id: 'financial',
    name: 'Financial',
    shortName: 'Financial',
    order: 6,
    slaDays: 3,
    description: 'Financial Coordinator reviews insurance'
  },
  {
    id: 'records-req',
    name: 'Records Req',
    shortName: 'Records Req',
    order: 7,
    slaDays: 14,
    description: 'Dialysis clinic uploads required packet documents'
  },
  {
    id: 'records-review',
    name: 'Records Review',
    shortName: 'Records Review',
    order: 8,
    slaDays: 5,
    description: 'Senior Coordinator reviews all medical records'
  },
  {
    id: 'specialists',
    name: 'Specialists',
    shortName: 'Specialists',
    order: 9,
    slaDays: 10,
    description: 'Dietitian, Social Work, and Nephrology reviews'
  },
  {
    id: 'final-decision',
    name: 'Final Decision',
    shortName: 'Final Decision',
    order: 10,
    slaDays: 3,
    description: 'Senior Coordinator makes final approval decision'
  },
  {
    id: 'education',
    name: 'Education',
    shortName: 'Education',
    order: 11,
    slaDays: 14,
    description: 'Patient completes education video and forms'
  },
  {
    id: 'scheduling',
    name: 'Scheduling',
    shortName: 'Scheduling',
    order: 12,
    slaDays: 7,
    description: 'Schedule evaluation appointment'
  }
];

export const stageDefinitions = stages;

export const orderedProgressStages = stages.map((stage) => stage.id) as readonly CaseStage[];

export const getStageById = (id: string) => stages.find((stage) => stage.id === id);

export const getStageOrder = (id: string) => getStageById(id)?.order ?? 0;

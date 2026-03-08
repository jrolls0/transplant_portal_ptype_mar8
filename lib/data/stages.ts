import { StageDefinition } from '@/types';

export const stageDefinitions: StageDefinition[] = [
  {
    id: 'new-referral',
    name: 'New Referral',
    shortName: 'Ref',
    order: 1,
    slaDays: 1,
    description: 'Referral received and awaiting intake review.'
  },
  {
    id: 'patient-onboarding',
    name: 'Patient Onboarding',
    shortName: 'ROI',
    order: 2,
    slaDays: 3,
    description: 'Consent and communication preferences are collected.'
  },
  {
    id: 'initial-todos',
    name: 'Initial TODOs',
    shortName: 'TODO',
    order: 3,
    slaDays: 4,
    description: 'Patient completes I/E, ID, and insurance items.'
  },
  {
    id: 'follow-through',
    name: 'Follow Through',
    shortName: 'Follow',
    order: 4,
    slaDays: 3,
    description: 'Front desk confirms I/E review and closes gaps.'
  },
  {
    id: 'intermediary-step',
    name: 'Intermediary Step',
    shortName: 'Interm',
    order: 5,
    slaDays: 3,
    description: 'Missing inclusion/exclusion values are collected.'
  },
  {
    id: 'initial-screening',
    name: 'Initial Screening',
    shortName: 'Screen',
    order: 6,
    slaDays: 3,
    description: 'Routing decision to financial or senior queue.'
  },
  {
    id: 'financial-screening',
    name: 'Financial Screening',
    shortName: 'Fin',
    order: 7,
    slaDays: 3,
    description: 'Coverage is verified and cleared or ended.'
  },
  {
    id: 'records-collection',
    name: 'Records Collection',
    shortName: 'Rec',
    order: 8,
    slaDays: 7,
    description: 'Clinic packet and hard-block records are collected.'
  },
  {
    id: 'medical-records-review',
    name: 'Medical Records Review',
    shortName: 'Med',
    order: 9,
    slaDays: 4,
    description: 'Senior reviews packet completeness and clinical readiness.'
  },
  {
    id: 'specialist-review',
    name: 'Specialist Review',
    shortName: 'Spec',
    order: 10,
    slaDays: 5,
    description: 'Dietitian, social work, nephrology complete parallel reviews.'
  },
  {
    id: 'final-decision',
    name: 'Final Decision',
    shortName: 'Dec',
    order: 11,
    slaDays: 2,
    description: 'Senior coordinator issues transplant pathway decision.'
  },
  {
    id: 'education',
    name: 'Education',
    shortName: 'Edu',
    order: 12,
    slaDays: 5,
    description: 'Patient education deliverables are completed.'
  },
  {
    id: 'scheduling',
    name: 'Scheduling',
    shortName: 'Sched',
    order: 13,
    slaDays: 5,
    description: 'Huddle, windows, and Surginet confirmation are completed.'
  },
  {
    id: 'scheduled',
    name: 'Scheduled',
    shortName: 'Done',
    order: 14,
    slaDays: 999,
    description: 'Appointment is confirmed and active.'
  },
  {
    id: 'ended',
    name: 'Ended',
    shortName: 'End',
    order: 15,
    slaDays: 1,
    description: 'Referral is closed with approved rationale and letter.'
  },
  {
    id: 're-referral-review',
    name: 'Re-Referral Review',
    shortName: 'ReRef',
    order: 16,
    slaDays: 3,
    description: 'Senior reviews eligibility for re-entry from ended case.'
  }
];

export const orderedProgressStages = [
  'new-referral',
  'patient-onboarding',
  'initial-todos',
  'follow-through',
  'intermediary-step',
  'initial-screening',
  'financial-screening',
  'records-collection',
  'medical-records-review',
  'specialist-review',
  'final-decision',
  'education',
  'scheduling'
] as const;

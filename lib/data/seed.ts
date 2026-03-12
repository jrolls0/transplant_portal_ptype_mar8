import { addDays, formatISO } from 'date-fns';
import { clinics, mockUsers, patientNames } from '@/lib/data/mockUsers';
import { calculateSLAStatus } from '@/lib/utils/slaCalculations';
import { AuditEvent, Case, Decision, Document, IEFormResponses, Message, SeedData, Task, User, UserRole } from '@/types';

const baseDate = new Date('2026-02-17T09:00:00.000Z');

const iso = (daysOffset: number, hourOffset = 0) => {
  const date = addDays(baseDate, daysOffset);
  date.setHours(date.getHours() + hourOffset);
  return formatISO(date);
};

type IEProfile = 'clean' | 'minor-flags' | 'major-flags';

const hasSubmittedIEForm = (stage: Case['stage']) => !['new-referral', 'onboarding', 'patient-forms'].includes(stage);

const generateIEResponses = (patientIndex: number, profile: IEProfile): IEFormResponses => {
  const completedAt = iso(-6 - patientIndex);

  if (profile === 'clean') {
    return {
      onDialysis: 'yes',
      eGFR: 10 + (patientIndex % 7),
      heightFeet: 5,
      heightInches: 4 + (patientIndex % 8),
      weightLbs: 148 + patientIndex * 3,
      usCitizenOrResident: 'yes',
      needsOtherOrganTransplant: 'no',
      usesSupplementalOxygen: 'no',
      heartSurgeryLast6Months: 'no',
      receivingCancerTreatment: 'no',
      recreationalDrugUse: 'no',
      hasNonHealingWounds: 'no',
      completedAt
    };
  }

  if (profile === 'minor-flags') {
    return {
      onDialysis: 'yes',
      eGFR: 'unknown',
      heightFeet: 5,
      heightInches: 3 + (patientIndex % 9),
      weightLbs: 142 + patientIndex * 2,
      usCitizenOrResident: 'not-sure',
      needsOtherOrganTransplant: 'no',
      usesSupplementalOxygen: 'no',
      heartSurgeryLast6Months: 'yes',
      receivingCancerTreatment: 'no',
      recreationalDrugUse: 'prefer-not-to-answer',
      hasNonHealingWounds: 'no',
      additionalHealthInfo: 'Patient reports controlled hypertension and wants coordinator review before submitting outside records.',
      completedAt
    };
  }

  return {
    onDialysis: 'yes',
    eGFR: 8,
    heightFeet: 5,
    heightInches: 10,
    weightLbs: 186,
    usCitizenOrResident: 'yes',
    needsOtherOrganTransplant: 'yes',
    usesSupplementalOxygen: 'yes',
    heartSurgeryLast6Months: 'no',
    receivingCancerTreatment: 'no',
    recreationalDrugUse: 'yes',
    hasNonHealingWounds: 'yes',
    additionalHealthInfo:
      'Patient shared active recovery efforts and a diabetic foot wound under treatment. Social work and medical review coordination recommended.',
    completedAt
  };
};

const user = (role: UserRole) => mockUsers.find((u) => u.role === role) as User;
const userById = (id: string) => mockUsers.find((u) => u.id === id) as User;

const buildPatient = (index: number) => {
  const safeIndex = index % patientNames.length;
  const [firstName, lastName, dateOfBirth] = patientNames[safeIndex];
  return {
    id: `patient-${String(index + 1).padStart(3, '0')}`,
    firstName,
    lastName,
    dateOfBirth,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@mail.com`,
    phone: `(302) 555-${String(1000 + index * 7).padStart(4, '0')}`,
    preferredLanguage: index % 4 === 0 ? 'Spanish' : 'English',
    mrn: `MRN-${7000 + index}`
  };
};

const clinicContacts = (clinicIndex: number) => {
  const nameSeed = clinicIndex + 1;
  return [
    {
      name: `DUSW Contact ${nameSeed}`,
      email: `dusw${nameSeed}@clinic.org`,
      role: 'dusw' as const
    },
    {
      name: `Dr. Neph ${nameSeed}`,
      email: `neph${nameSeed}@clinic.org`,
      role: 'nephrologist' as const
    }
  ];
};

const baseCase = (
  id: string,
  caseNumber: string,
  patientIndex: number,
  stage: Case['stage'],
  opts: Partial<Case> = {}
): Case => {
  const dueDate = opts.slaDueDate ?? iso(2);

  return {
    id,
    caseNumber,
    patient: opts.patient ?? buildPatient(patientIndex),
    clinicContacts: clinicContacts(patientIndex % clinics.length),
    referringClinic: clinics[patientIndex % clinics.length],
    stage,
    stageEnteredAt: opts.stageEnteredAt ?? iso(-2),
    assignedPTC: opts.assignedPTC,
    ptcAssignedAt: opts.ptcAssignedAt,
    carePartner: opts.carePartner,
    consent: opts.consent ?? {
      roiSigned: true,
      roiSignedAt: iso(-28),
      smsConsent: true,
      emailConsent: patientIndex % 3 !== 0,
      carePartnerConsent: Boolean(opts.carePartner)
    },
    slaStatus: opts.slaStatus ?? calculateSLAStatus(dueDate),
    slaDueDate: dueDate,
    daysInStage: opts.daysInStage ?? 2,
    flags: opts.flags ?? [],
    initialTodosComplete: opts.initialTodosComplete ?? {
      inclusionExclusion: true,
      governmentId: true,
      insuranceCard: true
    },
    ieFormResponses: opts.ieFormResponses,
    ieConfirmReviewComplete: opts.ieConfirmReviewComplete ?? true,
    hasMissingInfo: opts.hasMissingInfo ?? false,
    contactAttempts: opts.contactAttempts ?? 0,
    lastContactAttempt: opts.lastContactAttempt,
    educationProgress: opts.educationProgress,
    schedulingDecision: opts.schedulingDecision,
    schedulingWindows: opts.schedulingWindows,
    schedulingState: opts.schedulingState,
    appointmentConfirmed: opts.appointmentConfirmed,
    appointmentDate: opts.appointmentDate,
    endReason: opts.endReason,
    endRationale: opts.endRationale,
    endedAt: opts.endedAt,
    endedBy: opts.endedBy,
    linkedFromCaseId: opts.linkedFromCaseId,
    linkedToCaseId: opts.linkedToCaseId,
    createdAt: opts.createdAt ?? iso(-40),
    updatedAt: opts.updatedAt ?? iso(-1)
  };
};

const seededCases: Case[] = [
  baseCase('case-035', 'TC-2026-0016', 34, 'initial-screen', {
    patient: {
      id: 'patient-035',
      firstName: 'John',
      lastName: 'Stamos',
      dateOfBirth: '1964-08-19',
      email: 'john.stamos@mail.com',
      phone: '(302) 555-1274',
      preferredLanguage: 'English',
      mrn: 'MRN-8035'
    },
    stageEnteredAt: iso(0),
    slaDueDate: iso(-1),
    daysInStage: 1,
    createdAt: iso(-6),
    updatedAt: iso(0, 1),
    initialTodosComplete: {
      inclusionExclusion: true,
      governmentId: true,
      insuranceCard: true
    },
    ieConfirmReviewComplete: true,
    flags: ['BMI > 42', 'Recreational Drug Use', 'Uses Supplemental Oxygen']
  }),
  baseCase('case-001', 'TC-2024-0142', 0, 'specialists', {
    assignedPTC: userById('ptc-1'),
    ptcAssignedAt: iso(-22),
    carePartner: {
      name: 'Mary Smith',
      email: 'mary.smith@mail.com',
      phone: '(302) 555-0188',
      consentedToNotifications: true,
      consentedToViewStatus: true
    },
    consent: {
      roiSigned: true,
      roiSignedAt: iso(-30),
      smsConsent: true,
      emailConsent: false,
      carePartnerConsent: true
    },
    stageEnteredAt: iso(-8),
    slaDueDate: iso(2),
    daysInStage: 8,
    flags: [],
    schedulingState: 'pre-scheduling'
  }),
  baseCase('case-002', 'TC-2025-0201', 1, 'staff-review', {
    assignedPTC: userById('ptc-1'),
    ptcAssignedAt: iso(-9),
    stageEnteredAt: iso(-5),
    slaDueDate: iso(-1),
    daysInStage: 5,
    flags: ['Doc Review'],
    initialTodosComplete: {
      inclusionExclusion: true,
      governmentId: true,
      insuranceCard: true
    },
    ieConfirmReviewComplete: false
  }),
  baseCase('case-003', 'TC-2025-0202', 2, 'financial', {
    assignedPTC: userById('ptc-2'),
    ptcAssignedAt: iso(-6),
    stageEnteredAt: iso(-2),
    slaDueDate: iso(2),
    daysInStage: 2,
    flags: []
  }),
  baseCase('case-004', 'TC-2025-0203', 3, 'financial', {
    stageEnteredAt: iso(-4),
    slaDueDate: iso(-1),
    daysInStage: 4,
    flags: ['Needs Clarification']
  }),
  baseCase('case-005', 'TC-2025-0204', 4, 'education', {
    assignedPTC: userById('ptc-2'),
    ptcAssignedAt: iso(-35),
    stageEnteredAt: iso(-9),
    slaDueDate: iso(-2),
    daysInStage: 9,
    flags: ['No Response x2'],
    contactAttempts: 2,
    lastContactAttempt: iso(-1),
    educationProgress: {
      videoWatched: true,
      videoWatchedAt: iso(-13),
      confirmationFormComplete: false,
      healthcareGuidanceReviewed: false
    }
  }),
  baseCase('case-006', 'TC-2025-0205', 5, 'scheduling', {
    assignedPTC: userById('ptc-1'),
    ptcAssignedAt: iso(-34),
    stageEnteredAt: iso(-3),
    slaDueDate: iso(1),
    daysInStage: 3,
    schedulingState: 'pending-surginet',
    schedulingDecision: {
      type: 'direct-evaluation',
      carePartnerRequired: true,
      appointmentTypes: ['Direct Evaluation'],
      notes: 'Ready for final Surginet confirmation.',
      decidedBy: 'Jane Thompson',
      decidedAt: iso(-12)
    },
    schedulingWindows: [
      'Tuesday, Feb 24 — 9:00 AM - 11:00 AM',
      'Wednesday, Feb 25 — 1:00 PM - 3:00 PM',
      'Thursday, Feb 26 — 10:00 AM - 12:00 PM'
    ],
    educationProgress: {
      videoWatched: true,
      videoWatchedAt: iso(-16),
      confirmationFormComplete: true,
      confirmationFormAt: iso(-15),
      healthcareGuidanceReviewed: true,
      healthcareGuidanceAt: iso(-15)
    },
    appointmentDate: iso(8),
    appointmentConfirmed: false,
    carePartner: {
      name: 'Paul Davis',
      email: 'paul.davis@mail.com',
      phone: '(302) 555-0167',
      consentedToNotifications: true,
      consentedToViewStatus: true
    }
  }),
  baseCase('case-007', 'TC-2025-0206', 6, 'records-req', {
    assignedPTC: userById('ptc-2'),
    ptcAssignedAt: iso(-18),
    stageEnteredAt: iso(-12),
    slaDueDate: iso(-5),
    daysInStage: 12,
    flags: ['2728 Missing', 'Packet Stalled']
  }),
  baseCase('case-008', 'TC-2025-0207', 7, 'records-req', {
    assignedPTC: userById('ptc-1'),
    ptcAssignedAt: iso(-16),
    stageEnteredAt: iso(-7),
    slaDueDate: iso(-2),
    daysInStage: 7,
    flags: ['Packet Stalled']
  }),
  baseCase('case-009', 'TC-2025-0208', 8, 'initial-screen', {
    stageEnteredAt: iso(-3),
    slaDueDate: iso(-2),
    daysInStage: 3,
    flags: ['BMI > 42', 'Active substance use'],
    ieConfirmReviewComplete: true
  }),
  baseCase('case-010', 'TC-2025-0209', 9, 'initial-screen', {
    stageEnteredAt: iso(-1),
    slaDueDate: iso(1),
    daysInStage: 1,
    flags: ['Assign PTC'],
    ieConfirmReviewComplete: false
  }),
  baseCase('case-012', 'TC-2025-0211', 11, 'onboarding', {
    stageEnteredAt: iso(-2),
    slaDueDate: iso(2),
    daysInStage: 2,
    consent: {
      roiSigned: false,
      smsConsent: true,
      emailConsent: true,
      carePartnerConsent: false
    },
    initialTodosComplete: {
      inclusionExclusion: false,
      governmentId: false,
      insuranceCard: false
    },
    ieConfirmReviewComplete: false
  }),
  baseCase('case-013', 'TC-2025-0212', 12, 'patient-forms', {
    stageEnteredAt: iso(-2),
    slaDueDate: iso(2),
    daysInStage: 2,
    initialTodosComplete: {
      inclusionExclusion: true,
      governmentId: false,
      insuranceCard: true
    },
    ieConfirmReviewComplete: false
  }),
  baseCase('case-014', 'TC-2025-0213', 13, 'staff-review', {
    stageEnteredAt: iso(-4),
    slaDueDate: iso(-1),
    daysInStage: 4,
    hasMissingInfo: true,
    flags: ['Missing I/E Values'],
    initialTodosComplete: {
      inclusionExclusion: false,
      governmentId: true,
      insuranceCard: true
    },
    ieConfirmReviewComplete: false
  }),
  baseCase('case-015', 'TC-2025-0214', 14, 'records-review', {
    assignedPTC: userById('ptc-2'),
    ptcAssignedAt: iso(-14),
    stageEnteredAt: iso(-3),
    slaDueDate: iso(1),
    daysInStage: 3,
    flags: ['Partial Packet Decision']
  }),
  baseCase('case-016', 'TC-2025-0215', 15, 'specialists', {
    assignedPTC: userById('ptc-1'),
    ptcAssignedAt: iso(-11),
    stageEnteredAt: iso(-6),
    slaDueDate: iso(-3),
    daysInStage: 6,
    flags: ['Specialist Conflict']
  }),
  baseCase('case-017', 'TC-2025-0216', 16, 'final-decision', {
    assignedPTC: userById('ptc-1'),
    ptcAssignedAt: iso(-9),
    stageEnteredAt: iso(-2),
    slaDueDate: iso(1),
    daysInStage: 2,
    flags: []
  }),
  baseCase('case-018', 'TC-2026-0001', 17, 're-referral-review', {
    stageEnteredAt: iso(-1),
    slaDueDate: iso(1),
    daysInStage: 1,
    linkedFromCaseId: 'case-020',
    flags: ['Re-Referral Pending']
  }),
  baseCase('case-019', 'TC-2025-0217', 18, 'ended', {
    assignedPTC: userById('ptc-2'),
    stageEnteredAt: iso(-1),
    slaDueDate: iso(-1),
    daysInStage: 1,
    endReason: 'FIN-INS-NA',
    endRationale: 'Insurance plan not accepted by transplant program.',
    endedAt: iso(-1),
    endedBy: 'Rachel Green',
    flags: ['Letter Pending']
  }),
  baseCase('case-020', 'TC-2025-0218', 19, 'ended', {
    assignedPTC: userById('ptc-2'),
    stageEnteredAt: iso(-94),
    slaDueDate: iso(-1),
    daysInStage: 94,
    endReason: 'PAT-NORESP',
    endRationale: 'No response after three outreach attempts.',
    endedAt: iso(-90),
    endedBy: 'Dr. Emily Adams',
    linkedToCaseId: 'case-018',
    flags: ['No Response x3']
  }),
  baseCase('case-021', 'TC-2026-0002', 20, 'patient-forms', {
    stageEnteredAt: iso(-1),
    slaDueDate: iso(3),
    daysInStage: 1,
    initialTodosComplete: {
      inclusionExclusion: true,
      governmentId: false,
      insuranceCard: false
    },
    ieConfirmReviewComplete: false,
    consent: {
      roiSigned: true,
      roiSignedAt: iso(-1),
      smsConsent: true,
      emailConsent: true,
      carePartnerConsent: false
    }
  }),
  baseCase('case-022', 'TC-2026-0003', 21, 'staff-review', {
    stageEnteredAt: iso(-2),
    slaDueDate: iso(1),
    daysInStage: 2,
    initialTodosComplete: {
      inclusionExclusion: true,
      governmentId: true,
      insuranceCard: true
    },
    ieConfirmReviewComplete: false,
    flags: ['I/E Review Pending']
  }),
  baseCase('case-023', 'TC-2026-0004', 22, 'education', {
    assignedPTC: userById('ptc-1'),
    stageEnteredAt: iso(-1),
    slaDueDate: iso(2),
    daysInStage: 1,
    educationProgress: {
      videoWatched: true,
      videoWatchedAt: iso(-1),
      confirmationFormComplete: true,
      confirmationFormAt: iso(-1),
      healthcareGuidanceReviewed: true,
      healthcareGuidanceAt: iso(-1)
    },
    schedulingState: 'awaiting-huddle'
  }),
  baseCase('case-024', 'TC-2026-0005', 23, 'initial-screen', {
    stageEnteredAt: iso(-2),
    slaDueDate: iso(1),
    daysInStage: 2,
    initialTodosComplete: {
      inclusionExclusion: true,
      governmentId: true,
      insuranceCard: true
    },
    ieConfirmReviewComplete: true,
    flags: []
  }),
  baseCase('case-025', 'TC-2026-0006', 24, 'scheduling', {
    assignedPTC: userById('ptc-1'),
    stageEnteredAt: iso(-1),
    slaDueDate: iso(2),
    daysInStage: 1,
    schedulingState: 'awaiting-huddle',
    educationProgress: {
      videoWatched: true,
      videoWatchedAt: iso(-2),
      confirmationFormComplete: true,
      confirmationFormAt: iso(-2),
      healthcareGuidanceReviewed: true,
      healthcareGuidanceAt: iso(-2)
    }
  }),
  baseCase('case-026', 'TC-2026-0007', 25, 'education', {
    assignedPTC: userById('ptc-2'),
    stageEnteredAt: iso(-10),
    slaDueDate: iso(-3),
    daysInStage: 10,
    contactAttempts: 2,
    lastContactAttempt: iso(-2),
    flags: ['No Response x2'],
    educationProgress: {
      videoWatched: true,
      videoWatchedAt: iso(-12),
      confirmationFormComplete: false,
      healthcareGuidanceReviewed: false
    }
  }),
  baseCase('case-027', 'TC-2026-0008', 26, 'new-referral', {
    stageEnteredAt: iso(-1),
    slaDueDate: iso(2),
    daysInStage: 1,
    consent: {
      roiSigned: false,
      smsConsent: true,
      emailConsent: false,
      carePartnerConsent: false
    },
    initialTodosComplete: {
      inclusionExclusion: false,
      governmentId: false,
      insuranceCard: false
    },
    ieConfirmReviewComplete: false
  }),
  baseCase('case-028', 'TC-2026-0009', 27, 'onboarding', {
    stageEnteredAt: iso(-2),
    slaDueDate: iso(1),
    daysInStage: 2,
    consent: {
      roiSigned: false,
      smsConsent: true,
      emailConsent: true,
      carePartnerConsent: false
    },
    initialTodosComplete: {
      inclusionExclusion: false,
      governmentId: false,
      insuranceCard: true
    },
    ieConfirmReviewComplete: false
  }),
  baseCase('case-029', 'TC-2026-0010', 28, 'staff-review', {
    stageEnteredAt: iso(-3),
    slaDueDate: iso(1),
    daysInStage: 3,
    hasMissingInfo: true,
    flags: ['Missing I/E Values'],
    ieConfirmReviewComplete: false
  }),
  baseCase('case-030', 'TC-2026-0011', 29, 'records-review', {
    assignedPTC: userById('ptc-1'),
    ptcAssignedAt: iso(-7),
    stageEnteredAt: iso(-2),
    slaDueDate: iso(2),
    daysInStage: 2,
    flags: ['Partial Packet Decision']
  }),
  baseCase('case-031', 'TC-2026-0012', 30, 'final-decision', {
    assignedPTC: userById('ptc-2'),
    ptcAssignedAt: iso(-8),
    stageEnteredAt: iso(-1),
    slaDueDate: iso(2),
    daysInStage: 1
  }),
  baseCase('case-032', 'TC-2026-0013', 31, 're-referral-review', {
    stageEnteredAt: iso(-1),
    slaDueDate: iso(2),
    daysInStage: 1,
    linkedFromCaseId: 'case-019',
    flags: ['Re-Referral Pending']
  }),
  baseCase('case-033', 'TC-2026-0014', 32, 'scheduled', {
    assignedPTC: userById('ptc-1'),
    ptcAssignedAt: iso(-12),
    stageEnteredAt: iso(-1),
    slaDueDate: iso(5),
    daysInStage: 1,
    schedulingState: 'scheduled',
    appointmentConfirmed: true,
    appointmentDate: iso(4),
    schedulingDecision: {
      type: 'direct-evaluation',
      carePartnerRequired: false,
      appointmentTypes: ['Direct Evaluation'],
      notes: 'Confirmed in Surginet.',
      decidedBy: 'Jane Thompson',
      decidedAt: iso(-2)
    },
    educationProgress: {
      videoWatched: true,
      videoWatchedAt: iso(-6),
      confirmationFormComplete: true,
      confirmationFormAt: iso(-5),
      healthcareGuidanceReviewed: true,
      healthcareGuidanceAt: iso(-5)
    }
  }),
  baseCase('case-034', 'TC-2026-0015', 33, 'scheduled', {
    assignedPTC: userById('ptc-2'),
    ptcAssignedAt: iso(-14),
    stageEnteredAt: iso(-2),
    slaDueDate: iso(6),
    daysInStage: 2,
    schedulingState: 'scheduled',
    appointmentConfirmed: true,
    appointmentDate: iso(5),
    schedulingDecision: {
      type: 'testing-first',
      carePartnerRequired: true,
      appointmentTypes: ['Cardiac stress test', 'Direct Evaluation'],
      notes: 'Testing-first path completed and appointment confirmed.',
      decidedBy: 'Mark Rivera',
      decidedAt: iso(-3)
    },
    educationProgress: {
      videoWatched: true,
      videoWatchedAt: iso(-8),
      confirmationFormComplete: true,
      confirmationFormAt: iso(-7),
      healthcareGuidanceReviewed: true,
      healthcareGuidanceAt: iso(-7)
    }
  })
];

const ieProfilesByCaseId: Partial<Record<string, IEProfile>> = {
  'case-002': 'minor-flags',
  'case-005': 'minor-flags',
  'case-007': 'major-flags',
  'case-010': 'minor-flags',
  'case-014': 'minor-flags',
  'case-016': 'major-flags',
  'case-018': 'minor-flags',
  'case-019': 'major-flags',
  'case-022': 'minor-flags',
  'case-024': 'major-flags',
  'case-029': 'minor-flags',
  'case-030': 'minor-flags',
  'case-032': 'minor-flags'
};

const ieResponseOverridesByCaseId: Partial<Record<string, IEFormResponses>> = {
  'case-035': {
    onDialysis: 'yes',
    eGFR: 11,
    heightFeet: 5,
    heightInches: 6,
    weightLbs: 270,
    usCitizenOrResident: 'yes',
    needsOtherOrganTransplant: 'no',
    usesSupplementalOxygen: 'yes',
    heartSurgeryLast6Months: 'no',
    receivingCancerTreatment: 'no',
    recreationalDrugUse: 'yes',
    hasNonHealingWounds: 'no',
    additionalHealthInfo: 'Patient reported active oxygen use and drug-use history during I/E submission.',
    completedAt: iso(-2)
  },
  'case-009': {
    onDialysis: 'yes',
    eGFR: 12,
    heightFeet: 5,
    heightInches: 4,
    weightLbs: 265,
    usCitizenOrResident: 'yes',
    needsOtherOrganTransplant: 'no',
    usesSupplementalOxygen: 'no',
    heartSurgeryLast6Months: 'no',
    receivingCancerTreatment: 'no',
    recreationalDrugUse: 'yes',
    hasNonHealingWounds: 'no',
    additionalHealthInfo: 'Patient disclosed active substance use concerns and needs BMI review before screening can proceed.',
    completedAt: iso(-14)
  }
};

const mockCases: Case[] = seededCases.map((currentCase, index) =>
  hasSubmittedIEForm(currentCase.stage)
    ? {
        ...currentCase,
        ieFormResponses:
          currentCase.ieFormResponses ??
          ieResponseOverridesByCaseId[currentCase.id] ??
          generateIEResponses(index, ieProfilesByCaseId[currentCase.id] ?? 'clean')
      }
    : currentCase
);

const task = (
  id: string,
  caseId: string,
  title: string,
  type: Task['type'],
  assignedToRole: Task['assignedToRole'],
  status: Task['status'],
  dueDaysOffset: number,
  priority: Task['priority'],
  opts: Partial<Task> = {}
): Task => ({
  id,
  caseId,
  type,
  title,
  description: opts.description,
  assignedToRole,
  assignedToUser: opts.assignedToUser,
  status,
  priority,
  dueDate: opts.dueDate ?? iso(dueDaysOffset),
  slaStatus: opts.slaStatus ?? calculateSLAStatus(opts.dueDate ?? iso(dueDaysOffset)),
  isExternalStep: opts.isExternalStep ?? false,
  externalSystem: opts.externalSystem,
  completedAt: opts.completedAt,
  completedBy: opts.completedBy,
  completionNotes: opts.completionNotes,
  createdAt: opts.createdAt ?? iso(-10)
});

const mockTasks: Task[] = [
  task('task-002', 'case-002', 'Validate Insurance Card', 'review-document', 'front-desk', 'pending', -1, 'high'),
  task('task-003', 'case-019', 'Send End Referral Letter (Patient + Clinic)', 'send-end-letter', 'front-desk', 'pending', -1, 'high'),
  task('task-004', 'case-006', 'EXTERNAL STEP - Confirm in Surginet', 'confirm-surginet', 'front-desk', 'pending', 0, 'high', {
    isExternalStep: true,
    externalSystem: 'Surginet'
  }),
  task('task-005', 'case-010', 'Review I/E Responses', 'confirm-ie-review', 'front-desk', 'pending', 0, 'high'),
  task('task-007', 'case-014', 'Collect Missing I/E Values', 'collect-missing-info', 'front-desk', 'pending', -1, 'high'),
  task('task-008', 'case-007', 'Request Medicare 2728', 'request-records', 'ptc', 'pending', -3, 'urgent'),
  task('task-009', 'case-008', 'Retrieve Missing Clinic Packet', 'request-records', 'ptc', 'in-progress', -1, 'high'),
  task('task-010', 'case-005', 'Education Follow-up Outreach', 'education-follow-up', 'ptc', 'pending', -2, 'urgent'),
  task('task-011', 'case-003', 'Financial Screening Review', 'financial', 'financial', 'pending', 1, 'high'),
  task('task-012', 'case-004', 'Financial Clarification Needed', 'financial', 'financial', 'pending', -1, 'high'),
  task('task-013', 'case-001', 'Nephrology Review', 'specialists', 'nephrology', 'pending', 1, 'high', {
    assignedToUser: userById('neph-1')
  }),
  task('task-014', 'case-001', 'Dietitian Review', 'specialists', 'dietitian', 'completed', -1, 'high', {
    assignedToUser: userById('diet-1'),
    completedAt: iso(-1, 2),
    completedBy: userById('diet-1'),
    completionNotes: 'Cleared - no nutrition concerns.'
  }),
  task('task-015', 'case-001', 'Social Work Review', 'specialists', 'social-work', 'completed', -1, 'high', {
    assignedToUser: userById('sw-1'),
    completedAt: iso(-1, 4),
    completedBy: userById('sw-1'),
    completionNotes: 'Cleared with family support confirmed.'
  }),
  task('task-016', 'case-016', 'Dietitian Review', 'specialists', 'dietitian', 'pending', -2, 'high', {
    assignedToUser: userById('diet-1')
  }),
  task('task-017', 'case-016', 'Social Work Review', 'specialists', 'social-work', 'completed', -2, 'high', {
    assignedToUser: userById('sw-1'),
    completedAt: iso(-2, 3),
    completedBy: userById('sw-1'),
    completionNotes: 'Concern raised related to transportation instability.'
  }),
  task('task-018', 'case-016', 'Nephrology Review', 'specialists', 'nephrology', 'completed', -2, 'high', {
    assignedToUser: userById('neph-1'),
    completedAt: iso(-2, 2),
    completedBy: userById('neph-1'),
    completionNotes: 'Cleared medically.'
  }),
  task('task-019', 'case-010', 'Assign PTC', 'assign-ptc', 'senior-coordinator', 'pending', 1, 'medium'),
  task('task-020', 'case-009', 'Screening Override Decision', 'screening-override', 'senior-coordinator', 'pending', -1, 'urgent'),
  task('task-021', 'case-015', 'Partial Packet Decision', 'partial-packet-decision', 'senior-coordinator', 'pending', 1, 'high'),
  task('task-022', 'case-017', 'Final Decision', 'final-decision', 'senior-coordinator', 'pending', 1, 'high'),
  task('task-023', 'case-005', 'No Response x3 Decision', 'final-decision', 'senior-coordinator', 'pending', -1, 'high'),
  task('task-024', 'case-018', 'Re-Referral Eligibility Review', 're-referral-review', 'senior-coordinator', 'pending', 1, 'medium'),
  task('task-025', 'case-006', 'Record Scheduling Huddle', 'scheduling-huddle', 'front-desk', 'completed', -6, 'medium', {
    completedAt: iso(-6),
    completedBy: userById('fd-1'),
    completionNotes: 'Direct evaluation selected, emergency contact required.'
  }),
  task('task-026', 'case-006', 'Send Scheduling Windows', 'schedule-appointment', 'front-desk', 'completed', -4, 'medium', {
    completedAt: iso(-4),
    completedBy: userById('fd-1'),
    completionNotes: 'Three windows sent to patient in-app.'
  }),
  task('task-027', 'case-001', 'EXTERNAL STEP: Retrieve outside cardiology records', 'log-external-step', 'front-desk', 'completed', -20, 'medium', {
    isExternalStep: true,
    externalSystem: 'Phone/Fax',
    completedAt: iso(-22),
    completedBy: userById('fd-1'),
    completionNotes: 'Faxed records received from St. Francis.'
  }),
  task('task-028', 'case-007', 'Escalate hard-block to Senior', 'partial-packet-decision', 'ptc', 'pending', -2, 'urgent'),
  task('task-029', 'case-020', 'Send End Referral Letter (Patient + Clinic)', 'send-end-letter', 'front-desk', 'pending', -1, 'high'),
  task('task-032', 'case-022', 'Review I/E Responses', 'confirm-ie-review', 'front-desk', 'pending', 1, 'high'),
  task('task-033', 'case-023', 'Record Scheduling Huddle', 'scheduling-huddle', 'front-desk', 'pending', 2, 'medium'),
  task('task-034', 'case-024', 'Route Case', 'review-ie-responses', 'front-desk', 'pending', 1, 'high'),
  task('task-035', 'case-025', 'Record Scheduling Huddle', 'scheduling-huddle', 'front-desk', 'pending', 2, 'medium'),
  task('task-036', 'case-026', 'Education Follow-up Outreach', 'education-follow-up', 'ptc', 'pending', -1, 'urgent'),
  task('task-037', 'case-027', 'Contact Patient for Onboarding', 'send-message', 'front-desk', 'pending', 2, 'medium'),
  task('task-038', 'case-028', 'Collect Missing Onboarding Docs', 'review-document', 'front-desk', 'pending', 1, 'high'),
  task('task-039', 'case-029', 'Collect Missing I/E Values', 'collect-missing-info', 'front-desk', 'pending', 1, 'high'),
  task('task-040', 'case-030', 'Partial Packet Decision', 'partial-packet-decision', 'senior-coordinator', 'pending', 1, 'high'),
  task('task-041', 'case-031', 'Final Decision', 'final-decision', 'senior-coordinator', 'pending', 2, 'high'),
  task('task-042', 'case-032', 'Re-Referral Eligibility Review', 're-referral-review', 'senior-coordinator', 'pending', 2, 'high'),
  task('task-043', 'case-033', 'Post-Scheduling Follow-up', 'send-message', 'ptc', 'pending', 3, 'medium'),
  task('task-044', 'case-034', 'Post-Scheduling Follow-up', 'send-message', 'ptc', 'pending', 4, 'medium')
];

const decision = (
  id: string,
  caseId: string,
  type: Decision['type'],
  title: string,
  options: string[],
  status: Decision['status'],
  opts: Partial<Decision> = {}
): Decision => ({
  id,
  caseId,
  type,
  title,
  options,
  status,
  selectedOption: opts.selectedOption,
  rationale: opts.rationale,
  decidedBy: opts.decidedBy,
  decidedAt: opts.decidedAt,
  letterDraft: opts.letterDraft,
  letterApproved: opts.letterApproved,
  letterApprovedAt: opts.letterApprovedAt,
  createdAt: opts.createdAt ?? iso(-14)
});

const mockDecisions: Decision[] = [
  decision(
    'decision-001',
    'case-001',
    'partial-packet',
    'Proceed with Partial Dialysis Records',
    ['Proceed with partial records', 'Extend wait', 'End referral'],
    'completed',
    {
      selectedOption: 'Proceed with partial records',
      rationale:
        'Missing hepatitis panel is being retrieved. Core dialysis records are sufficient to start specialist review while retrieval continues.',
      decidedBy: userById('sc-1'),
      decidedAt: iso(-26)
    }
  ),
  decision(
    'decision-002',
    'case-001',
    'screening-routing',
    'Medical Records Review Outcome',
    ['Proceed to specialist reviews', 'Return to records collection', 'End referral'],
    'completed',
    {
      selectedOption: 'Proceed to specialist reviews',
      rationale: 'All required records except one non-blocking item were sufficient for specialist routing.',
      decidedBy: userById('sc-1'),
      decidedAt: iso(-20)
    }
  ),
  decision(
    'decision-003',
    'case-003',
    'screening-routing',
    'Financial Screening Outcome',
    ['Cleared', 'Needs clarification', 'Not cleared'],
    'completed',
    {
      selectedOption: 'Cleared',
      rationale: 'Medicare and Delaware Medicaid accepted.',
      decidedBy: userById('fin-1'),
      decidedAt: iso(-1)
    }
  ),
  decision(
    'decision-004',
    'case-010',
    'screening-routing',
    'Assign PTC',
    ['Assign Sarah Chen', 'Assign Tom Wilson', 'Leave unassigned'],
    'pending'
  ),
  decision(
    'decision-005',
    'case-009',
    'screening-override',
    'Screening Override',
    ['Override and proceed to financial', 'Request clarification', 'End referral'],
    'pending'
  ),
  decision(
    'decision-006',
    'case-007',
    'hard-block-override',
    'Hard-Block Override (2728 Missing)',
    ['Override hard-block', 'Wait for 2728', 'End referral'],
    'pending'
  ),
  decision(
    'decision-007',
    'case-015',
    'partial-packet',
    'Partial Packet Decision',
    ['Proceed with partial records', 'Extend wait', 'End referral'],
    'pending'
  ),
  decision(
    'decision-008',
    'case-016',
    'specialist-conflict',
    'Resolve Specialist Conflict',
    ['Proceed', 'Require clarification', 'Escalate to full committee'],
    'pending'
  ),
  decision(
    'decision-009',
    'case-017',
    'final-decision',
    'Final Decision',
    ['Approve to education', 'Not approved'],
    'pending'
  ),
  decision(
    'decision-010',
    'case-005',
    'no-response-3x',
    'No Response After 3 Attempts',
    ['Continue outreach', 'End referral'],
    'pending'
  ),
  decision(
    'decision-011',
    'case-018',
    're-referral-eligibility',
    'Re-Referral Review',
    ['Eligible - restart workflow', 'Not eligible yet'],
    'pending'
  ),
  decision(
    'decision-012',
    'case-019',
    'end-referral',
    'End Referral Approval',
    ['Approve and end referral'],
    'completed',
    {
      selectedOption: 'Approve and end referral',
      rationale: 'Insurance not accepted after payer verification and escalation review.',
      decidedBy: userById('fin-1'),
      decidedAt: iso(-1),
      letterApproved: true,
      letterApprovedAt: iso(-1),
      letterDraft:
        'Dear Mr. Miller, we regret to inform you that your referral has been ended due to insurance coverage not accepted by the program.'
    }
  ),
  decision(
    'decision-013',
    'case-031',
    'final-decision',
    'Final Decision',
    ['Approve to education', 'Not approved'],
    'pending'
  ),
  decision(
    'decision-014',
    'case-032',
    're-referral-eligibility',
    'Re-Referral Review',
    ['Eligible - restart workflow', 'Not eligible yet'],
    'pending'
  )
];

const clinicPacketStages: Case['stage'][] = [
  'records-req',
  'records-review',
  'specialists',
  'final-decision',
  'education',
  'scheduling',
  'scheduled',
  'ended',
  're-referral-review'
];

const clinicPacketOverrides: Record<string, Partial<Record<string, Document['status']>>> = {
  'case-007': {
    'cms-2728': 'required',
    'dialysis-records': 'received',
    'current-labs': 'received',
    'sw-assessment': 'required',
    'neph-notes': 'received',
    'h-and-p': 'required',
    'med-list': 'received'
  },
  'case-008': {
    'cms-2728': 'validated',
    'dialysis-records': 'needs-review',
    'current-labs': 'validated',
    'sw-assessment': 'required',
    'neph-notes': 'validated',
    'h-and-p': 'received',
    'med-list': 'received'
  },
  'case-015': {
    'cms-2728': 'validated',
    'dialysis-records': 'validated',
    'current-labs': 'needs-review',
    'sw-assessment': 'validated',
    'neph-notes': 'validated',
    'h-and-p': 'validated',
    'med-list': 'required'
  },
  'case-030': {
    'cms-2728': 'validated',
    'dialysis-records': 'validated',
    'current-labs': 'needs-review',
    'sw-assessment': 'validated',
    'neph-notes': 'validated',
    'h-and-p': 'required',
    'med-list': 'received'
  }
};

const patientDocumentOverrides: Record<string, Partial<Record<string, Document['status']>>> = {
  'case-002': {
    'insurance-front': 'needs-review',
    'insurance-back': 'needs-review'
  }
};

const generateDocumentsForCase = (currentCase: Case, patientIndex: number): Document[] => {
  const docs: Document[] = [];
  const reviewer = userById(patientIndex % 2 === 0 ? 'fd-1' : 'fd-2');
  const uploadDate = iso(-18 - patientIndex);
  const reviewDate = iso(-17 - patientIndex);
  const isClinicPacketStage = clinicPacketStages.includes(currentCase.stage);
  const patientOverrides = patientDocumentOverrides[currentCase.id] ?? {};

  const addDocument = (
    name: string,
    type: string,
    ownership: Document['ownership'],
    status: Document['status'],
    source: Document['source'],
    isHardBlock = false,
    overrides: Partial<Document> = {}
  ) => {
    docs.push({
      id: overrides.id ?? `doc-${currentCase.id}-${type}`,
      caseId: currentCase.id,
      name,
      type,
      ownership,
      status,
      isHardBlock,
      source,
      uploadedAt: status === 'required' ? undefined : overrides.uploadedAt ?? uploadDate,
      uploadedBy: overrides.uploadedBy,
      reviewedAt: status === 'validated' ? overrides.reviewedAt ?? reviewDate : overrides.reviewedAt,
      reviewedBy: status === 'validated' ? overrides.reviewedBy ?? reviewer : overrides.reviewedBy,
      reviewNotes: overrides.reviewNotes,
      expiresAt: overrides.expiresAt
    });
  };

  if (currentCase.stage === 'new-referral') {
    return docs;
  }

  const roiStatus: Document['status'] = currentCase.consent.roiSigned
    ? currentCase.stage === 'onboarding'
      ? 'needs-review'
      : currentCase.stage === 'patient-forms'
        ? 'needs-review'
        : 'validated'
    : 'required';

  addDocument('ROI - ChristianaCare', 'roi-christiana', 'patient', roiStatus, 'patient');
  addDocument('ROI - Dialysis Records', 'roi-dialysis', 'patient', roiStatus, 'patient');

  if (currentCase.stage === 'onboarding') {
    return docs;
  }

  const govFrontStatus: Document['status'] =
    currentCase.stage === 'patient-forms'
      ? currentCase.initialTodosComplete.governmentId
        ? 'needs-review'
        : 'needs-review'
      : 'validated';
  const govBackStatus: Document['status'] =
    currentCase.stage === 'patient-forms'
      ? currentCase.initialTodosComplete.governmentId
        ? 'needs-review'
        : 'required'
      : 'validated';
  const insuranceFrontStatus: Document['status'] =
    currentCase.stage === 'patient-forms'
      ? currentCase.initialTodosComplete.insuranceCard
        ? 'needs-review'
        : 'needs-review'
      : 'validated';
  const insuranceBackStatus: Document['status'] =
    currentCase.stage === 'patient-forms'
      ? currentCase.initialTodosComplete.insuranceCard
        ? 'needs-review'
        : 'required'
      : 'validated';

  addDocument('Government ID (Front)', 'gov-id-front', 'patient', patientOverrides['gov-id-front'] ?? govFrontStatus, 'patient');
  addDocument('Government ID (Back)', 'gov-id-back', 'patient', patientOverrides['gov-id-back'] ?? govBackStatus, 'patient');
  addDocument(
    'Insurance Card (Front)',
    'insurance-front',
    'patient',
    patientOverrides['insurance-front'] ?? insuranceFrontStatus,
    'patient'
  );
  addDocument(
    'Insurance Card (Back)',
    'insurance-back',
    'patient',
    patientOverrides['insurance-back'] ?? insuranceBackStatus,
    'patient'
  );

  if (isClinicPacketStage) {
    const defaultPacketStatus: Document['status'] = currentCase.stage === 'records-req' ? 'needs-review' : 'validated';
    const overrides = clinicPacketOverrides[currentCase.id] ?? {};

    addDocument(
      'CMS-2728 (ESRD Medical Evidence Report)',
      'cms-2728',
      'dusw',
      overrides['cms-2728'] ?? defaultPacketStatus,
      'clinic',
      true
    );
    addDocument(
      'Dialysis Treatment Records (Last 3 Months)',
      'dialysis-records',
      'dusw',
      overrides['dialysis-records'] ?? defaultPacketStatus,
      'clinic'
    );
    addDocument('Current Laboratory Results', 'current-labs', 'dusw', overrides['current-labs'] ?? defaultPacketStatus, 'clinic');
    addDocument('Social Work Assessment', 'sw-assessment', 'dusw', overrides['sw-assessment'] ?? defaultPacketStatus, 'clinic');
    addDocument('Nephrology Progress Notes', 'neph-notes', 'nephrologist', overrides['neph-notes'] ?? defaultPacketStatus, 'clinic');
    addDocument('History & Physical', 'h-and-p', 'nephrologist', overrides['h-and-p'] ?? defaultPacketStatus, 'clinic');
    addDocument('Current Medication List', 'med-list', 'nephrologist', overrides['med-list'] ?? defaultPacketStatus, 'clinic');
  }

  if (['case-001', 'case-008', 'case-015', 'case-030'].includes(currentCase.id)) {
    const hepatitisStatus: Document['status'] =
      currentCase.id === 'case-030' ? 'needs-review' : currentCase.id === 'case-001' || currentCase.id === 'case-008' || currentCase.id === 'case-015' ? 'required' : 'validated';

    addDocument('Hepatitis Panel', 'hepatitis-panel', 'nephrologist', hepatitisStatus, 'clinic');
  }

  if (currentCase.id === 'case-001') {
    addDocument('Cardiology Clearance', 'cardiology-clearance', 'shared', 'needs-review', 'clinic', false, {
      uploadedAt: iso(-22),
      reviewNotes: 'Cardiology note uploaded and awaiting final specialist review.'
    });
    addDocument('Outside Cardiology Records', 'outside-cardiology-records', 'shared', 'validated', 'external-retrieval', false, {
      uploadedAt: iso(-22),
      reviewedAt: iso(-21),
      reviewedBy: userById('fd-1')
    });
    addDocument('PCP Records (last 2 years)', 'pcp-records', 'shared', 'required', 'external-retrieval');
  }

  return docs;
};

const mockDocuments: Document[] = mockCases.flatMap((currentCase, index) => generateDocumentsForCase(currentCase, index));

const message = (
  id: string,
  caseId: string,
  fromUser: User,
  recipients: Message['toRecipients'],
  body: string,
  sentOffset: number,
  opts: Partial<Message> = {}
): Message => ({
  id,
  caseId,
  threadId: opts.threadId ?? `thread-${caseId}`,
  fromUser,
  toRecipients: recipients,
  subject: opts.subject,
  body,
  channel: opts.channel ?? 'in-app',
  templateUsed: opts.templateUsed,
  sentAt: iso(sentOffset),
  readAt: opts.readAt,
  isContactAttempt: opts.isContactAttempt,
  attemptNumber: opts.attemptNumber
});

const mockMessages: Message[] = [
  message(
    'msg-001',
    'case-001',
    userById('ptc-1'),
    [{ type: 'patient', name: 'John Smith' }],
    'Hi John, great news - your specialist reviews are almost complete. We are waiting on nephrology and will update you tomorrow.',
    -1,
    { readAt: iso(-1, 1) }
  ),
  message(
    'msg-002',
    'case-001',
    userById('fd-1'),
    [{ type: 'clinic-nephrologist', name: 'Fresenius - Dr. Patel' }],
    'We are still missing the Hepatitis Panel for John Smith. Please upload at your earliest convenience.',
    -23,
    { readAt: undefined }
  ),
  message(
    'msg-003',
    'case-004',
    userById('fin-1'),
    [{ type: 'patient', name: 'Patricia Williams' }],
    'Please confirm your current Aetna plan details so we can complete screening.',
    -2,
    { isContactAttempt: true, attemptNumber: 1 }
  ),
  message(
    'msg-004',
    'case-005',
    userById('ptc-2'),
    [{ type: 'patient', name: 'Michael Brown' }],
    'Reminder: please complete the transplant education confirmation form this week.',
    -1,
    { isContactAttempt: true, attemptNumber: 2 }
  ),
  message(
    'msg-005',
    'case-006',
    userById('fd-1'),
    [{ type: 'patient', name: 'Jennifer Davis' }, { type: 'care-partner', name: 'Paul Davis' }],
    'Please choose one of the scheduling windows sent for your direct evaluation visit.',
    -4
  ),
  message(
    'msg-006',
    'case-020',
    userById('ptc-2'),
    [{ type: 'patient', name: 'Emma Wilson' }],
    'Final outreach attempt: please contact us within 7 days to continue your referral.',
    -95,
    { isContactAttempt: true, attemptNumber: 3 }
  )
];

const audit = (
  id: string,
  caseId: string,
  eventType: string,
  description: string,
  performedBy: User,
  performedOffset: number,
  metadata?: Record<string, unknown>
): AuditEvent => ({
  id,
  caseId,
  eventType,
  description,
  performedBy,
  performedAt: iso(performedOffset),
  metadata
});

const mockAudit: AuditEvent[] = [
  audit('audit-001', 'case-001', 'MESSAGE_SENT', 'Sent in-app message to patient regarding specialist review status.', userById('ptc-1'), -1),
  audit('audit-002', 'case-001', 'TASK_COMPLETED', 'Social Work Review completed - Outcome: Cleared.', userById('sw-1'), -1),
  audit('audit-003', 'case-001', 'TASK_COMPLETED', 'Dietitian Review completed - Outcome: Cleared.', userById('diet-1'), -1),
  audit(
    'audit-004',
    'case-001',
    'DECISION_RECORDED',
    'Medical records review decision recorded: Proceed to specialist reviews.',
    userById('sc-1'),
    -20
  ),
  audit('audit-005', 'case-001', 'STAGE_CHANGE', 'Stage changed: Medical Records Review → Specialist Review.', userById('sc-1'), -20),
  audit('audit-006', 'case-001', 'EXTERNAL_STEP_COMPLETED', 'Retrieved outside cardiology records via fax.', userById('fd-1'), -22, {
    system: 'Phone/Fax',
    notes: 'Faxed records received from St. Francis.'
  }),
  audit('audit-007', 'case-007', 'TASK_CREATED', 'Request Medicare 2728 task created.', userById('ptc-2'), -10),
  audit('audit-008', 'case-007', 'FLAGGED', 'Hard-block identified: 2728 missing.', userById('fd-2'), -10),
  audit('audit-009', 'case-005', 'CONTACT_ATTEMPT', 'Contact attempt #2 sent to patient.', userById('ptc-2'), -1),
  audit('audit-010', 'case-006', 'SCHEDULING_HUDDLE', 'Scheduling huddle decision recorded.', userById('fd-1'), -12),
  audit('audit-011', 'case-006', 'SCHEDULING_WINDOWS_SENT', 'Time windows sent to patient.', userById('fd-1'), -4),
  audit('audit-012', 'case-019', 'REFERRAL_ENDED', 'Referral ended - Insurance not accepted.', userById('fin-1'), -1),
  audit('audit-013', 'case-020', 'REFERRAL_ENDED', 'Referral ended - No response after 3 attempts.', userById('sc-1'), -90),
  audit('audit-014', 'case-018', 'RE_REFERRAL_CREATED', 'Case created as linked re-referral from TC-2025-0218.', userById('fd-1'), -1),
  audit('audit-015', 'case-010', 'DECISION_PENDING', 'Case awaiting senior assignment decision.', userById('fd-1'), -1),
  audit('audit-016', 'case-009', 'DECISION_PENDING', 'Case flagged for screening override.', userById('fd-1'), -2),
  audit('audit-017', 'case-016', 'SPECIALIST_CONFLICT', 'Specialist outcomes conflict requires senior review.', userById('ptc-1'), -2),
  audit('audit-018', 'case-003', 'FINANCIAL_CLEARED', 'Financial screening completed and cleared.', userById('fin-1'), -1),
  audit('audit-019', 'case-014', 'MISSING_IE', 'Missing I/E values identified for follow-up.', userById('fd-2'), -3),
  audit('audit-020', 'case-027', 'NEW_REFERRAL', 'New referral received from clinic portal.', userById('fd-1'), -1)
];

const removedCaseIds = new Set(['case-004', 'case-008', 'case-009', 'case-013', 'case-021', 'case-023', 'case-024', 'case-028', 'case-029']);

const seedData: SeedData = {
  cases: mockCases.filter((currentCase) => !removedCaseIds.has(currentCase.id)),
  tasks: mockTasks.filter((task) => !removedCaseIds.has(task.caseId)),
  documents: mockDocuments.filter((document) => !removedCaseIds.has(document.caseId)),
  messages: mockMessages.filter((message) => !removedCaseIds.has(message.caseId)),
  decisions: mockDecisions.filter((decision) => !removedCaseIds.has(decision.caseId)),
  audit: mockAudit.filter((event) => !removedCaseIds.has(event.caseId))
};

export function createSeedData(): SeedData {
  return JSON.parse(JSON.stringify(seedData)) as SeedData;
}

export { mockCases, mockTasks, mockDocuments, mockMessages, mockDecisions, mockAudit };

export type UserRole =
  | 'front-desk'
  | 'ptc'
  | 'senior-coordinator'
  | 'financial'
  | 'dietitian'
  | 'social-work'
  | 'nephrology'
  | 'pharmacist'
  | 'surgeon';

export type CaseStage =
  | 'new-referral'
  | 'patient-onboarding'
  | 'initial-todos'
  | 'follow-through'
  | 'intermediary-step'
  | 'initial-screening'
  | 'financial-screening'
  | 'records-collection'
  | 'medical-records-review'
  | 'specialist-review'
  | 'final-decision'
  | 'education'
  | 'scheduling'
  | 'scheduled'
  | 'ended'
  | 're-referral-review';

export type SLAStatus = 'on-track' | 'at-risk' | 'overdue';

export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled';

export type TaskType =
  | 'review-document'
  | 'review-ie-responses'
  | 'confirm-ie-review'
  | 'collect-missing-info'
  | 'send-message'
  | 'log-external-step'
  | 'financial-screening'
  | 'specialist-review'
  | 'request-records'
  | 'partial-packet-decision'
  | 'final-decision'
  | 'send-end-letter'
  | 'schedule-appointment'
  | 'confirm-surginet'
  | 're-referral-review'
  | 'assign-ptc'
  | 'screening-override'
  | 'scheduling-huddle'
  | 'education-follow-up';

export type DecisionType =
  | 'screening-routing'
  | 'screening-override'
  | 'partial-packet'
  | 'hard-block-override'
  | 'specialist-conflict'
  | 'final-decision'
  | 'no-response-3x'
  | 'end-referral'
  | 're-referral-eligibility';

export type DocumentStatus =
  | 'required'
  | 'received'
  | 'needs-review'
  | 'validated'
  | 'rejected'
  | 'expired';

export type DocumentOwnership = 'dusw' | 'nephrologist' | 'shared' | 'patient';

export type MessageChannel = 'in-app' | 'sms' | 'email';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  preferredLanguage: string;
  mrn?: string;
}

export interface CarePartner {
  name: string;
  email: string;
  phone: string;
  consentedToNotifications: boolean;
  consentedToViewStatus: boolean;
}

export interface ClinicContact {
  name: string;
  email: string;
  role: 'dusw' | 'nephrologist';
}

export interface Consent {
  roiSigned: boolean;
  roiSignedAt?: string;
  smsConsent: boolean;
  emailConsent: boolean;
  carePartnerConsent: boolean;
}

export interface Case {
  id: string;
  caseNumber: string;
  patient: Patient;
  carePartner?: CarePartner;
  clinicContacts: ClinicContact[];
  referringClinic: string;
  stage: CaseStage;
  stageEnteredAt: string;
  assignedPTC?: User;
  ptcAssignedAt?: string;
  consent: Consent;
  slaStatus: SLAStatus;
  slaDueDate: string;
  daysInStage: number;
  flags: string[];
  initialTodosComplete: {
    inclusionExclusion: boolean;
    governmentId: boolean;
    insuranceCard: boolean;
  };
  ieConfirmReviewComplete: boolean;
  contactAttempts: number;
  lastContactAttempt?: string;
  educationProgress?: {
    videoWatched: boolean;
    videoWatchedAt?: string;
    confirmationFormComplete: boolean;
    confirmationFormAt?: string;
    healthcareGuidanceReviewed: boolean;
    healthcareGuidanceAt?: string;
  };
  schedulingDecision?: {
    type: 'direct-evaluation' | 'testing-first';
    carePartnerRequired: boolean;
    appointmentTypes: string[];
    notes?: string;
    decidedBy: string;
    decidedAt: string;
  };
  schedulingWindows?: string[];
  schedulingState?:
    | 'pre-scheduling'
    | 'awaiting-huddle'
    | 'in-progress'
    | 'pending-surginet'
    | 'scheduled';
  appointmentConfirmed?: boolean;
  appointmentDate?: string;
  endReason?: string;
  endRationale?: string;
  endedAt?: string;
  endedBy?: string;
  linkedFromCaseId?: string;
  linkedToCaseId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  caseId: string;
  type: TaskType;
  title: string;
  description?: string;
  assignedToRole: UserRole;
  assignedToUser?: User;
  status: TaskStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string;
  slaStatus: SLAStatus;
  isExternalStep: boolean;
  externalSystem?: string;
  completedAt?: string;
  completedBy?: User;
  completionNotes?: string;
  createdAt: string;
}

export interface Decision {
  id: string;
  caseId: string;
  type: DecisionType;
  title: string;
  options: string[];
  selectedOption?: string;
  rationale?: string;
  decidedBy?: User;
  decidedAt?: string;
  status: 'pending' | 'completed';
  letterDraft?: string;
  letterApproved?: boolean;
  letterApprovedAt?: string;
  createdAt: string;
}

export interface Document {
  id: string;
  caseId: string;
  name: string;
  type: string;
  ownership: DocumentOwnership;
  status: DocumentStatus;
  isHardBlock: boolean;
  uploadedAt?: string;
  uploadedBy?: string;
  source: 'patient' | 'clinic' | 'external-retrieval';
  reviewedAt?: string;
  reviewedBy?: User;
  reviewNotes?: string;
  expiresAt?: string;
}

export interface Message {
  id: string;
  caseId: string;
  threadId: string;
  fromUser: User;
  toRecipients: {
    type: 'patient' | 'care-partner' | 'clinic-dusw' | 'clinic-nephrologist' | 'staff';
    name: string;
  }[];
  subject?: string;
  body: string;
  channel: MessageChannel;
  templateUsed?: string;
  sentAt: string;
  readAt?: string;
  isContactAttempt?: boolean;
  attemptNumber?: number;
}

export interface AuditEvent {
  id: string;
  caseId: string;
  eventType: string;
  description: string;
  performedBy: User;
  performedAt: string;
  metadata?: Record<string, unknown>;
}

export interface StageDefinition {
  id: CaseStage;
  name: string;
  shortName: string;
  order: number;
  slaDays: number;
  description: string;
}

export interface EndReasonCode {
  code: string;
  label: string;
  category: 'financial' | 'clinical' | 'patient' | 'administrative';
  reReferralRequirements: string[];
  letterTemplate: string;
}

export interface DocumentCatalogItem {
  type: string;
  name: string;
  ownership: DocumentOwnership;
  isRequired: boolean;
  isHardBlock: boolean;
  maxAgeDays?: number;
}

export interface SeedData {
  cases: Case[];
  tasks: Task[];
  documents: Document[];
  messages: Message[];
  decisions: Decision[];
  audit: AuditEvent[];
}

# AI Agent Instructions: Transplant Center Portal Prototype

## CRITICAL: Read This First

You are building a **demo-ready prototype** of a Transplant Center Portal for kidney transplant referral workflow management. This will be presented to healthcare executives who created the workflow specification. The prototype must:

1. **Look professional and modern** — clean healthcare SaaS aesthetic
2. **Simulate the COMPLETE workflow** — all 13 stages + re-referral + ending referral
3. **Be fully interactive** — clickable actions, modal dialogs, state transitions
4. **Use realistic mock data** — real-looking patient names, dates, statuses

**DO NOT** skip any workflow stages or persona capabilities. The executive will be checking that every feature they specified is present.

---

## Tech Stack (Required)

```
Framework:     Next.js 14+ (App Router)
Styling:       Tailwind CSS + shadcn/ui components
Icons:         Lucide React
State:         React Context + localStorage for persistence
Charts:        Recharts (for dashboard KPIs)
Date handling: date-fns
```

**Why this stack:**
- Next.js App Router enables clean routing structure
- shadcn/ui provides polished, accessible components out of the box
- Tailwind enables rapid, consistent styling
- localStorage allows demo persistence without backend

---

## Project Structure

```
/app
  /layout.tsx                    # Root layout with sidebar navigation
  /page.tsx                      # Redirect to /dashboard
  
  /login
    /page.tsx                    # Login page with role selector
  
  /dashboard
    /page.tsx                    # Auto-redirect based on role
    /front-desk/page.tsx         # Front Desk dashboard
    /ptc/page.tsx                # Pre-Transplant Coordinator dashboard
    /senior/page.tsx             # Senior Coordinator dashboard
    /financial/page.tsx          # Financial Coordinator dashboard
    /specialist/[type]/page.tsx  # Specialist dashboards (dietitian, social-work, nephrology)
  
  /pipeline
    /page.tsx                    # Pipeline View (shared case table)
  
  /cases
    /[id]/page.tsx               # Case Cockpit (tabbed detail view)
  
  /inbox
    /page.tsx                    # Cross-case messaging inbox
  
  /admin
    /page.tsx                    # Admin landing
    /stages/page.tsx             # Stage configuration
    /documents/page.tsx          # Document catalog
    /end-reasons/page.tsx        # End reason codes
    /templates/page.tsx          # Letter templates

/components
  /layout
    Sidebar.tsx                  # Left navigation sidebar
    Header.tsx                   # Top header with notifications + user menu
    RoleSwitcher.tsx             # Demo role switcher dropdown
  
  /dashboard
    KPIStrip.tsx                 # KPI cards row
    QueueTabs.tsx                # Tab switcher for queues
    CaseQueue.tsx                # List of cases in queue
    CaseQueueItem.tsx            # Individual case row in queue
    DecisionPanel.tsx            # Right-side decision panel (Senior Coord)
    MiniPipeline.tsx             # Small pipeline chart (PTC dashboard)
  
  /case-cockpit
    CaseHeader.tsx               # Patient info + stage + SLA header
    StageProgressBar.tsx         # Visual stage progress indicator
    TabNavigation.tsx            # Tab switcher
    SummaryTab.tsx               # Summary + next actions
    TasksTab.tsx                 # All tasks for case
    DocumentsTab.tsx             # Document checklist
    MessagesTab.tsx              # Threaded messages
    DecisionsTab.tsx             # Decision history
    SchedulingTab.tsx            # Scheduling workflow
    EndReferralTab.tsx           # End referral flow
    AuditTab.tsx                 # Audit timeline
  
  /pipeline
    PipelineTable.tsx            # Main pipeline table
    PipelineFilters.tsx          # Filter controls
    PipelineSummary.tsx          # SLA summary footer
  
  /modals
    SendMessageModal.tsx         # Compose message modal
    LogExternalStepModal.tsx     # Log EXTERNAL STEP modal
    CreateTaskModal.tsx          # Create task modal
    EndReferralModal.tsx         # End referral flow modal
    DecisionModal.tsx            # Generic decision modal (with rationale)
    AssignPTCModal.tsx           # PTC assignment modal
    SchedulingHuddleModal.tsx    # Scheduling huddle decision modal
    RequestRecordsModal.tsx      # Request records task creation
    SpecialistReviewModal.tsx    # Specialist outcome submission
    PartialPacketModal.tsx       # Partial packet decision modal
    ReReferralModal.tsx          # Start re-referral modal
  
  /shared
    Badge.tsx                    # Status/SLA badges
    SLAIndicator.tsx             # Color-coded SLA status
    ConsentIndicator.tsx         # Consent flags display
    Timeline.tsx                 # Audit/activity timeline
    TaskCard.tsx                 # Task display card
    DocumentRow.tsx              # Document checklist row
    MessageThread.tsx            # Message thread display

/lib
  /data
    mockCases.ts                 # Mock case data
    mockTasks.ts                 # Mock task data
    mockMessages.ts              # Mock message data
    mockDocuments.ts             # Mock document data
    mockDecisions.ts             # Mock decision data
    mockUsers.ts                 # Mock user/staff data
    stages.ts                    # Stage definitions
    endReasons.ts                # End reason codes
    documentCatalog.ts           # Document catalog
  
  /context
    AuthContext.tsx              # Current user + role context
    CaseContext.tsx              # Case data context
    NotificationContext.tsx      # Toast notifications
  
  /utils
    slaCalculations.ts           # SLA status calculations
    stageTransitions.ts          # Stage transition logic
    formatters.ts                # Date/name formatters

/types
  index.ts                       # All TypeScript interfaces
```

---

## Visual Design Requirements

### Color Palette

```css
/* Primary - Healthcare Blue */
--primary-50: #eff6ff;
--primary-100: #dbeafe;
--primary-500: #3b82f6;
--primary-600: #2563eb;
--primary-700: #1d4ed8;

/* Success - Green */
--success-50: #f0fdf4;
--success-500: #22c55e;
--success-700: #15803d;

/* Warning - Amber */
--warning-50: #fffbeb;
--warning-500: #f59e0b;
--warning-700: #b45309;

/* Danger - Red */
--danger-50: #fef2f2;
--danger-500: #ef4444;
--danger-700: #b91c1c;

/* Neutral - Slate */
--slate-50: #f8fafc;
--slate-100: #f1f5f9;
--slate-200: #e2e8f0;
--slate-300: #cbd5e1;
--slate-500: #64748b;
--slate-700: #334155;
--slate-900: #0f172a;
```

### SLA Status Colors

| Status | Color | Usage |
|--------|-------|-------|
| On Track (🟢) | `bg-emerald-100 text-emerald-700` | > 2 days remaining |
| At Risk (🟡) | `bg-amber-100 text-amber-700` | 1-2 days remaining |
| Overdue (🔴) | `bg-red-100 text-red-700` | Past due date |

### Typography

- **Headings:** Inter or system-ui, semi-bold
- **Body:** Inter or system-ui, regular
- **Monospace (IDs):** JetBrains Mono or mono

### Component Styling

- **Cards:** `bg-white rounded-xl border border-slate-200 shadow-sm`
- **Buttons Primary:** `bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2`
- **Buttons Secondary:** `bg-white border border-slate-300 hover:bg-slate-50 rounded-lg px-4 py-2`
- **Badges:** `rounded-full px-2.5 py-0.5 text-xs font-medium`
- **Inputs:** `rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500`

---

## Data Models (TypeScript Interfaces)

```typescript
// types/index.ts

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
  | 'new-referral'           // Stage 1
  | 'patient-onboarding'     // Stage 2
  | 'initial-todos'          // Stage 3
  | 'follow-through'         // Stage 4
  | 'intermediary-step'      // Stage 5
  | 'initial-screening'      // Stage 6
  | 'financial-screening'    // Stage 6.5
  | 'records-collection'     // Stage 7
  | 'medical-records-review' // Stage 8
  | 'specialist-review'      // Stage 9
  | 'final-decision'         // Stage 10
  | 'education'              // Stage 11
  | 'scheduling'             // Stage 12
  | 'scheduled'              // Post Stage 12
  | 'ended'                  // Ended referral
  | 're-referral-review';    // Stage 13

export type SLAStatus = 'on-track' | 'at-risk' | 'overdue';

export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled';

export type TaskType = 
  | 'review-document'
  | 'review-ie-responses'        // Review Inclusion/Exclusion
  | 'confirm-ie-review'          // Front Desk confirm I/E review
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
  | 'screening-routing'          // Financial vs Senior Coordinator
  | 'screening-override'         // Senior Coord override of flags
  | 'partial-packet'             // Proceed with partial records
  | 'hard-block-override'        // Override missing 2728 etc
  | 'specialist-conflict'        // Resolve conflicting specialist outcomes
  | 'final-decision'             // Approve vs Not Approved
  | 'no-response-3x'             // Continue vs End after 3 attempts
  | 'end-referral'               // Any end referral decision
  | 're-referral-eligibility';   // Re-referral return requirements

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
  caseNumber: string;  // e.g., "TC-2024-0142"
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
  
  flags: string[];  // e.g., ["Packet Stalled", "BMI > 42", "No Response x2"]
  
  // Stage-specific tracking
  initialTodosComplete: {
    inclusionExclusion: boolean;
    governmentId: boolean;
    insuranceCard: boolean;
  };
  ieConfirmReviewComplete: boolean;  // Front Desk confirmed I/E review
  
  // Attempt tracking
  contactAttempts: number;
  lastContactAttempt?: string;
  
  // Scheduling
  schedulingDecision?: {
    type: 'direct-evaluation' | 'testing-first';
    carePartnerRequired: boolean;
    appointmentTypes: string[];
    notes?: string;
    decidedBy: string;
    decidedAt: string;
  };
  appointmentConfirmed?: boolean;
  appointmentDate?: string;
  
  // End referral
  endReason?: string;
  endRationale?: string;
  endedAt?: string;
  endedBy?: string;
  
  // Re-referral
  linkedFromCaseId?: string;  // If this is a re-referral
  linkedToCaseId?: string;    // If this case spawned a re-referral
  
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
  
  isExternalStep: boolean;  // True if EXTERNAL STEP
  externalSystem?: string;  // e.g., "Surginet", "Cerner", "Phone", "Fax"
  
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
  
  options: string[];          // Available choices
  selectedOption?: string;    // What was chosen
  rationale?: string;         // Required explanation
  
  decidedBy?: User;
  decidedAt?: string;
  
  status: 'pending' | 'completed';
  
  // For end referral decisions
  letterDraft?: string;
  letterApproved?: boolean;
  letterApprovedAt?: string;
  
  createdAt: string;
}

export interface Document {
  id: string;
  caseId: string;
  
  name: string;
  type: string;              // From document catalog
  ownership: DocumentOwnership;
  
  status: DocumentStatus;
  isHardBlock: boolean;      // e.g., 2728 form
  
  uploadedAt?: string;
  uploadedBy?: string;
  source: 'patient' | 'clinic' | 'external-retrieval';
  
  reviewedAt?: string;
  reviewedBy?: User;
  reviewNotes?: string;
  
  expiresAt?: string;        // For re-referral age rules
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
  
  // For attempt tracking
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
  
  metadata?: Record<string, any>;
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
  maxAgeDays?: number;  // For re-referral expiration
}
```

---

## Mock Data Requirements

### Mock Cases (Create 15-20 cases)

Create cases distributed across ALL stages to demonstrate the full workflow:

| Stage | # of Cases | Example Scenarios |
|-------|------------|-------------------|
| initial-todos | 2 | Patient has partial TODOs complete |
| intermediary-step | 1 | Missing I/E values being collected |
| initial-screening | 2 | One flagged for Senior review, one normal |
| financial-screening | 2 | One pending, one needs clarification |
| records-collection | 3 | One with 2728 missing (hard-block), one stalled |
| medical-records-review | 2 | One with partial packet decision needed |
| specialist-review | 2 | One with conflict, one progressing normally |
| final-decision | 1 | Ready for Senior decision |
| education | 2 | One stalled (no response), one progressing |
| scheduling | 2 | One pending confirmation, one scheduled |
| ended | 2 | One financial, one no-response |
| re-referral-review | 1 | Re-referral pending Senior review |

### Mock Patients (Realistic names)

```typescript
const mockPatients = [
  { firstName: 'John', lastName: 'Smith', dob: '1965-03-15' },
  { firstName: 'Maria', lastName: 'Garcia', dob: '1958-07-22' },
  { firstName: 'Robert', lastName: 'Johnson', dob: '1970-11-08' },
  { firstName: 'Patricia', lastName: 'Williams', dob: '1962-04-30' },
  { firstName: 'Michael', lastName: 'Brown', dob: '1975-09-12' },
  { firstName: 'Jennifer', lastName: 'Davis', dob: '1968-01-25' },
  { firstName: 'David', lastName: 'Martinez', dob: '1972-06-18' },
  { firstName: 'Linda', lastName: 'Anderson', dob: '1955-12-03' },
  { firstName: 'James', lastName: 'Taylor', dob: '1963-08-27' },
  { firstName: 'Elizabeth', lastName: 'Thomas', dob: '1978-02-14' },
  { firstName: 'Richard', lastName: 'Jackson', dob: '1960-10-09' },
  { firstName: 'Susan', lastName: 'White', dob: '1967-05-21' },
  { firstName: 'Joseph', lastName: 'Harris', dob: '1973-03-07' },
  { firstName: 'Margaret', lastName: 'Clark', dob: '1959-11-30' },
  { firstName: 'Charles', lastName: 'Lewis', dob: '1971-07-16' },
];
```

### Mock Staff Users

```typescript
const mockUsers: User[] = [
  { id: 'fd-1', name: 'Jane Thompson', email: 'jthompson@transplant.org', role: 'front-desk' },
  { id: 'fd-2', name: 'Mark Rivera', email: 'mrivera@transplant.org', role: 'front-desk' },
  { id: 'ptc-1', name: 'Sarah Chen', email: 'schen@transplant.org', role: 'ptc' },
  { id: 'ptc-2', name: 'Tom Wilson', email: 'twilson@transplant.org', role: 'ptc' },
  { id: 'sc-1', name: 'Dr. Emily Adams', email: 'eadams@transplant.org', role: 'senior-coordinator' },
  { id: 'fin-1', name: 'Rachel Green', email: 'rgreen@transplant.org', role: 'financial' },
  { id: 'diet-1', name: 'Amy Foster', email: 'afoster@transplant.org', role: 'dietitian' },
  { id: 'sw-1', name: 'Michael Ross', email: 'mross@transplant.org', role: 'social-work' },
  { id: 'neph-1', name: 'Dr. David Burke', email: 'dburke@transplant.org', role: 'nephrology' },
  { id: 'pharm-1', name: 'Lisa Park', email: 'lpark@transplant.org', role: 'pharmacist' },
  { id: 'surg-1', name: 'Dr. James Mitchell', email: 'jmitchell@transplant.org', role: 'surgeon' },
];
```

### Referring Clinics

```typescript
const clinics = [
  'Fresenius Kidney Care - Wilmington',
  'DaVita Dialysis - Newark',
  'Fresenius Kidney Care - Dover',
  'DaVita Dialysis - Middletown',
  'Atlantic Dialysis Management - Bear',
];
```

---

## Page-by-Page Implementation Specifications

### 1. Login Page (`/login`)

**Purpose:** Role selection for demo (no actual auth)

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│              🏥 TransplantFlow                              │
│              Kidney Transplant Referral Management          │
│                                                             │
│     ┌─────────────────────────────────────────────────┐     │
│     │                                                 │     │
│     │   Select your role to continue:                 │     │
│     │                                                 │     │
│     │   ┌───────────────────────────────────────┐     │     │
│     │   │  👩‍💼 Front Desk / Navigator           │     │     │
│     │   └───────────────────────────────────────┘     │     │
│     │   ┌───────────────────────────────────────┐     │     │
│     │   │  👨‍⚕️ Pre-Transplant Coordinator (PTC) │     │     │
│     │   └───────────────────────────────────────┘     │     │
│     │   ┌───────────────────────────────────────┐     │     │
│     │   │  👩‍⚕️ Senior Coordinator               │     │     │
│     │   └───────────────────────────────────────┘     │     │
│     │   ┌───────────────────────────────────────┐     │     │
│     │   │  💰 Financial Coordinator             │     │     │
│     │   └───────────────────────────────────────┘     │     │
│     │   ┌───────────────────────────────────────┐     │     │
│     │   │  🍎 Dietitian                         │     │     │
│     │   └───────────────────────────────────────┘     │     │
│     │   ┌───────────────────────────────────────┐     │     │
│     │   │  👥 Social Worker                     │     │     │
│     │   └───────────────────────────────────────┘     │     │
│     │   ┌───────────────────────────────────────┐     │     │
│     │   │  🩺 Nephrology                        │     │     │
│     │   └───────────────────────────────────────┘     │     │
│     │                                                 │     │
│     └─────────────────────────────────────────────────┘     │
│                                                             │
│              Demo Mode - Select any role                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Behavior:**
- Clicking a role sets it in context and localStorage
- Redirects to `/dashboard` which auto-routes to role-specific dashboard
- Show subtle "Demo Mode" badge throughout app

---

### 2. Sidebar Navigation (`/components/layout/Sidebar.tsx`)

**Fixed left sidebar visible on all pages after login**

```
┌──────────────────┐
│ 🏥 TransplantFlow │
│                  │
│ ─────────────────│
│                  │
│ 📊 Dashboard     │  ← Active state: bg-blue-50, left border blue
│                  │
│ 📋 Pipeline      │
│                  │
│ 💬 Inbox    (3)  │  ← Badge for unread count
│                  │
│ ─────────────────│
│                  │
│ ⚙️ Admin         │  ← Only show for Senior Coordinator
│                  │
│ ─────────────────│
│                  │
│ 👤 Jane Thompson │
│    Front Desk    │
│    [Switch Role] │  ← Demo role switcher
│                  │
└──────────────────┘
```

---

### 3. Front Desk Dashboard (`/dashboard/front-desk`)

**This is the primary demo view - make it shine!**

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ HEADER: [Logo] [Search...] [🔔 Notifications (4)] [User Menu]                │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  FRONT DESK DASHBOARD                                     Today: Feb 4, 2024 │
│                                                                              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│  │   OVERDUE   │ │  DUE TODAY  │ │   UPCOMING  │ │  COMPLETED  │            │
│  │    🔴 4     │ │    🟡 7     │ │    🟢 12    │ │    ✓ 8      │            │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘            │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ QUEUE: [All] [Intake/TODOs] [Doc Review] [Missing Info] [Scheduling] │   │
│  │        [I/E Review] [End Letters]                                     │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ 🔴 OVERDUE                                                            │   │
│  │ ┌────────────────────────────────────────────────────────────────┐   │   │
│  │ │ ☐ Smith, John                      Stage: Initial Screening   │   │   │
│  │ │   Task: Review I/E Responses                                   │   │   │
│  │ │   Due: 2 days ago                          [Open Case →]       │   │   │
│  │ └────────────────────────────────────────────────────────────────┘   │   │
│  │ ┌────────────────────────────────────────────────────────────────┐   │   │
│  │ │ ☐ Garcia, Maria                    Stage: Follow-through      │   │   │
│  │ │   Task: Validate Insurance Card (Needs Review)                 │   │   │
│  │ │   Due: 1 day ago               [Approve] [Reject] [View]       │   │   │
│  │ └────────────────────────────────────────────────────────────────┘   │   │
│  │ ┌────────────────────────────────────────────────────────────────┐   │   │
│  │ │ ☐ Chen, Wei                        Stage: Ended                │   │   │
│  │ │   Task: Send End Referral Letter (Patient + Clinic)            │   │   │
│  │ │   Due: 1 day ago         [View Letter] [Mark Sent as EXTERNAL] │   │   │
│  │ └────────────────────────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ 🟡 DUE TODAY (7)                                         [See All]   │   │
│  │ ┌────────────────────────────────────────────────────────────────┐   │   │
│  │ │ ☐ Davis, Sarah                     Stage: Scheduling           │   │   │
│  │ │   Task: EXTERNAL STEP - Confirm in Surginet                    │   │   │
│  │ │   Due: Today                               [Log Completed]     │   │   │
│  │ └────────────────────────────────────────────────────────────────┘   │   │
│  │ ┌────────────────────────────────────────────────────────────────┐   │   │
│  │ │ ☐ Williams, Robert                 Stage: Initial Screening   │   │   │
│  │ │   Task: Confirm I/E Review (responses look OK)                 │   │   │
│  │ │   Due: Today                    [View Responses] [Confirm ✓]   │   │   │
│  │ └────────────────────────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Key Queue Tabs for Front Desk:**

1. **Intake/TODOs** — Cases in stages 3-4 waiting for patient to complete TODOs
2. **I/E Review** — Cases where patient submitted Inclusion/Exclusion and Front Desk needs to confirm review
3. **Doc Review** — Documents needing validation (uploaded by patient or clinic)
4. **Missing Info** — Stage 5 cases with missing I/E values
5. **Scheduling** — Scheduling tasks (enter time windows, EXTERNAL STEP confirmations)
6. **End Letters** — End referral letters ready to send

**Actions on each queue item:**
- **Open Case →** — Navigate to Case Cockpit
- **Approve/Reject** — For document validation
- **Confirm ✓** — For I/E review confirmation
- **Log Completed** — For EXTERNAL STEP tasks
- **View Letter** / **Mark Sent** — For end letters

---

### 4. PTC Dashboard (`/dashboard/ptc`)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ PRE-TRANSPLANT COORDINATOR DASHBOARD                                         │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────┐      │
│  │  MY CASES     AT RISK     STALLED     AWAITING      UNASSIGNED   │      │
│  │     42          7           3         REVIEWS        (claim)     │      │
│  │                                          5              3        │      │
│  └───────────────────────────────────────────────────────────────────┘      │
│                                                                              │
│  🚨 AT RISK CASES (7)                                                        │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ Patient        │ Stage              │ Days │ SLA    │ Blocker       │   │
│  ├────────────────┼────────────────────┼──────┼────────┼───────────────┤   │
│  │ Martinez, Ana  │ Records Collection │  12  │ 🔴 5d  │ 2728 Missing  │   │
│  │                │   [View] [Message Clinic] [Escalate to Senior]     │   │
│  ├────────────────┼────────────────────┼──────┼────────┼───────────────┤   │
│  │ Lee, David     │ Specialist Review  │   6  │ 🔴 3d  │ Diet Overdue  │   │
│  │                │   [View] [Nudge Dietitian]                         │   │
│  ├────────────────┼────────────────────┼──────┼────────┼───────────────┤   │
│  │ Adams, Rachel  │ Education          │   9  │ 🔴 2d  │ No Resp x2    │   │
│  │                │   [View] [Log Attempt #3] [Escalate]               │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  📊 MY PIPELINE                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  Screening  Financial  Records   Review   Decision  Education  Sched │   │
│  │      3         2          8        5         4         3         2   │   │
│  │    ███       ██      ████████    █████     ████      ███        ██   │   │
│  │                         ↑ 2 at risk                                  │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  🆕 PATIENTS NEEDING PTC (click to claim)                                    │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ Wilson, Emma          │ Initial Screening │ 1d in queue │ [Take Patient] │
│  │ Harris, Joseph        │ Initial Screening │ 3h in queue │ [Take Patient] │
│  │ Clark, Robin          │ Initial Screening │ 2d in queue │ [Take Patient] │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Key features:**
- **Unassigned queue** — Shows cases routed to Financial that need PTC to claim
- **"Take Patient" button** — Clicking assigns PTC to the case
- **Mini Pipeline** — Visual bar chart showing where their cases are

---

### 5. Senior Coordinator Dashboard (`/dashboard/senior`)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ SENIOR COORDINATOR DASHBOARD                                                 │
│                                                                              │
│  PENDING DECISIONS: 11                             [View Full Pipeline →]    │
│                                                                              │
│  DECISION TABS:                                                              │
│  [All (11)] [Assign PTC (3)] [Screening Override (2)] [Partial Packet (2)]  │
│  [Final Decision (1)] [No Response 3x (2)] [Re-Referral (1)]                │
│                                                                              │
│  ┌────────────────────────────────────┬─────────────────────────────────┐   │
│  │ DECISION QUEUE                     │ DECISION PANEL                  │   │
│  ├────────────────────────────────────┤                                 │   │
│  │                                    │ ┌─────────────────────────────┐ │   │
│  │ ● Taylor, James          🔴 2d    │ │ TAYLOR, JAMES               │ │   │
│  │   Screening Override              │ │                             │ │   │
│  │   BMI > 42, Active substance      │ │ Type: Screening Override    │ │   │
│  │                                    │ │                             │ │   │
│  │ ○ Martinez, Ana          🔴 5d    │ │ Flagged Items:              │ │   │
│  │   Partial Packet Decision         │ │ • BMI > 42 (flag)           │ │   │
│  │   2728 missing (hard-block)       │ │ • Active substance use      │ │   │
│  │                                    │ │                             │ │   │
│  │ ○ Wilson, Emma           🟡 1d    │ │ I/E Responses:              │ │   │
│  │   Assign PTC (unclaimed 2d)       │ │ [View Full Responses]       │ │   │
│  │                                    │ │                             │ │   │
│  │ ○ Brown, Sam             🟡       │ │ Front Desk Notes:           │ │   │
│  │   No Response 3x Decision         │ │ "BMI is borderline, may     │ │   │
│  │                                    │ │ need dietitian consult"     │ │   │
│  │ ○ Lewis, Charles         🟢       │ │                             │ │   │
│  │   Final Decision                  │ │ ─────────────────────────── │ │   │
│  │   All reviews complete            │ │                             │ │   │
│  │                                    │ │ YOUR DECISION: *            │ │   │
│  │ ○ Park, Min              🟢       │ │ ○ Override - Allow to       │ │   │
│  │   Re-Referral Review              │ │   proceed (→ Financial)     │ │   │
│  │                                    │ │ ○ Request clarification     │ │   │
│  │                                    │ │   from patient              │ │   │
│  │                                    │ │ ○ End Referral              │ │   │
│  │                                    │ │                             │ │   │
│  │                                    │ │ Rationale (required): *     │ │   │
│  │                                    │ │ ┌───────────────────────┐   │ │   │
│  │                                    │ │ │                       │   │ │   │
│  │                                    │ │ │                       │   │ │   │
│  │                                    │ │ └───────────────────────┘   │ │   │
│  │                                    │ │                             │ │   │
│  │                                    │ │     [Submit Decision]       │ │   │
│  │                                    │ └─────────────────────────────┘ │   │
│  └────────────────────────────────────┴─────────────────────────────────┘   │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Decision Types to Implement:**

1. **Assign PTC** — Cases unclaimed too long, Senior must assign
2. **Screening Override** — Front Desk flagged I/E concerns
3. **Partial Packet** — Proceed with missing docs vs wait vs end
4. **Hard-Block Override** — Missing 2728, rare override with rationale
5. **Specialist Conflict** — Conflicting specialist outcomes
6. **Final Decision** — Approve to education vs not approved
7. **No Response 3x** — Continue outreach vs end referral
8. **Re-Referral Review** — Return requirements met vs not met

**Each decision requires:**
- Selection of outcome
- **Rationale text field (required)**
- Submit button
- Audit logging

---

### 6. Financial Coordinator Dashboard (`/dashboard/financial`)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ FINANCIAL COORDINATOR DASHBOARD                                              │
│                                                                              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                            │
│  │  PENDING    │ │  NEEDS      │ │  RE-VERIFY  │                            │
│  │  SCREENING  │ │  CLARIFY    │ │ (re-referral)│                           │
│  │     5       │ │     2       │ │      1      │                            │
│  └─────────────┘ └─────────────┘ └─────────────┘                            │
│                                                                              │
│  FINANCIAL SCREENING QUEUE                                                   │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ Patient        │ Insurance Info     │ Days │ Status                  │   │
│  ├────────────────┼────────────────────┼──────┼─────────────────────────┤   │
│  │ Johnson, Robert│ Medicare + Medicaid│   2  │ [Review Insurance Card] │   │
│  │                │ DE Medicaid        │      │                         │   │
│  │                │   [Clear ✓] [Needs Info] [Not Cleared - End]        │   │
│  ├────────────────┼────────────────────┼──────┼─────────────────────────┤   │
│  │ Williams, Pat  │ Commercial - Aetna │   1  │ [Review Insurance Card] │   │
│  │                │ PPO Plan           │      │                         │   │
│  │                │   [Clear ✓] [Needs Info] [Not Cleared - End]        │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  NEEDS CLARIFICATION                                                         │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ Brown, Michael │ Unclear coverage   │   5  │ Awaiting patient reply  │   │
│  │                │ [View Messages] [Send Reminder] [Mark as Not Cleared]│   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Actions:**
- **Clear ✓** — Mark financially cleared, advance case
- **Needs Info** — Opens message modal to request clarification from patient
- **Not Cleared - End** — Opens End Referral modal with financial reason pre-selected

---

### 7. Specialist Dashboard (`/dashboard/specialist/[type]`)

Same structure for Dietitian, Social Work, Nephrology:

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ DIETITIAN DASHBOARD                                                          │
│                                                                              │
│  MY REVIEW TASKS                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ Patient        │ Assigned   │ Due      │ SLA    │ Actions            │   │
│  ├────────────────┼────────────┼──────────┼────────┼────────────────────┤   │
│  │ Smith, John    │ Feb 2      │ Feb 5    │ 🟡 1d  │ [Start Review]     │   │
│  │ Garcia, Maria  │ Feb 1      │ Feb 4    │ 🔴 1d  │ [Continue Review]  │   │
│  │ Taylor, James  │ Feb 3      │ Feb 6    │ 🟢 2d  │ [Start Review]     │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  PENDING CLARIFICATION                                                       │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ Davis, Sarah   │ Waiting on patient response about dietary habits    │   │
│  │                │ [View Case] [Send Follow-up]                         │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

**"Start Review" opens modal with:**
- View of relevant documents
- Structured outcome selection:
  - **Clear** — No concerns
  - **Needs Clarification** — Message patient, keep in review
  - **Concern → Escalate** — Escalate to Senior Coordinator
- Notes field
- Submit button

---

### 8. Pipeline View (`/pipeline`)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ PIPELINE VIEW                                              [Export CSV]      │
│                                                                              │
│ 87 active cases                                                              │
│                                                                              │
│ Filters:                                                                     │
│ [Stage ▼] [PTC ▼] [SLA Status ▼] [Clinic ▼] [Date Range ▼] [Clear Filters]  │
│                                                                              │
│ ┌────────────────────────────────────────────────────────────────────────┐  │
│ │ Patient       │ Stage            │ PTC       │ Days │ SLA   │ Flags    │  │
│ ├───────────────┼──────────────────┼───────────┼──────┼───────┼──────────┤  │
│ │ Smith, John   │ Specialist Review│ S. Chen   │   8  │ 🟡 2d │          │  │
│ │ Garcia, Maria │ Financial        │ —         │   2  │ 🟢    │ Doc Review│ │
│ │ Martinez, Ana │ Records Collect. │ T. Wilson │  12  │ 🔴 5d │ ⚠️ Stalled│ │
│ │ Chen, Wei     │ Education        │ S. Chen   │   3  │ 🟢    │          │  │
│ │ Wilson, Emma  │ Initial Screening│ —         │   1  │ 🟡 1d │ Assign PTC│ │
│ │ Taylor, James │ Initial Screening│ —         │   3  │ 🔴 2d │ ⚠️ Flagged│ │
│ │ Lee, David    │ Specialist Review│ T. Wilson │   6  │ 🔴 3d │          │  │
│ │ Clark, Robin  │ Final Decision   │ S. Chen   │   2  │ 🟢    │          │  │
│ │ Brown, Sam    │ Education        │ T. Wilson │  10  │ 🔴 3d │ No Resp x3│ │
│ │ Park, Min     │ Scheduling       │ S. Chen   │   1  │ 🟢    │          │  │
│ │ ...           │ ...              │ ...       │ ...  │ ...   │ ...      │  │
│ └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│ Showing 1-20 of 87                          [◀ Prev] 1 2 3 4 5 [Next ▶]     │
│                                                                              │
│ ─────────────────────────────────────────────────────────────────────────── │
│ Summary:  🟢 On Track: 58  │  🟡 At Risk: 17  │  🔴 Overdue: 12             │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Features:**
- Sortable columns (click header)
- Filterable by stage, PTC, SLA status, clinic
- Click row to open Case Cockpit
- Export to CSV button (can be simulated)
- Summary footer with SLA breakdown

---

### 9. Case Cockpit (`/cases/[id]`)

**THE MOST IMPORTANT PAGE - All work happens here**

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ ← Back to Dashboard                                                          │
│                                                                              │
│ ┌────────────────────────────────────────────────────────────────────────┐  │
│ │ SMITH, JOHN                                      Case #TC-2024-0142    │  │
│ │ DOB: Mar 15, 1965 (58y)              Referred: Jan 15, 2024            │  │
│ │ Stage: Specialist Review (9)         PTC: Sarah Chen                   │  │
│ │ Clinic: Fresenius - Wilmington       SLA: 🟡 2 days remaining          │  │
│ │                                                                        │  │
│ │ Consents: ROI ✅  SMS ✅  Email ❌  Care Partner: Mary Smith ✅         │  │
│ └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│ ┌────────────────────────────────────────────────────────────────────────┐  │
│ │ STAGE PROGRESS                                                         │  │
│ │ [✓]──[✓]──[✓]──[✓]──[✓]──[✓]──[✓]──[✓]──[●]──[ ]──[ ]──[ ]            │  │
│ │  1    2    3    4    5    6    7    8    9   10   11   12              │  │
│ │ Ref  ROI TODO Scrn Intrm Fin  Rec  Med Spec  Dec  Edu Sched            │  │
│ └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│ TABS: [Summary ●] [Tasks] [Documents] [Messages] [Decisions] [Scheduling]   │
│       [End Referral] [Audit]                                                 │
│ ────────────────────────────────────────────────────────────────────────────│
│                                                                              │
│  (Tab content renders here - see individual tab specs below)                 │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

#### 9a. Summary Tab (Default)

```
┌─────────────────────────────────────────┬──────────────────────────────────┐
│ ⚡ WHAT NEEDS TO HAPPEN                 │ 📋 TIMELINE                      │
│                                         │                                  │
│ ┌─────────────────────────────────────┐ │ Today                            │
│ │ 1. Nephrology Review                │ │ • Dietitian: Cleared ✓          │
│ │    Assigned: Dr. Burke              │ │                                  │
│ │    Due: Tomorrow          🟡        │ │ Yesterday                        │
│ │    [View Task] [Send Reminder]      │ │ • Social Work: Cleared ✓        │
│ └─────────────────────────────────────┘ │ • Message sent to patient        │
│                                         │                                  │
│ ✅ COMPLETED THIS STAGE                 │ Jan 28                           │
│ • Dietitian Review: Cleared             │ • Stage 8 → Stage 9              │
│ • Social Work Review: Cleared           │ • Senior approved "Proceed       │
│                                         │   to specialists"                │
│ ⏳ WAITING ON                           │                                  │
│ • Nothing — all prerequisites met       │ Jan 25                           │
│                                         │ • Records packet validated       │
│ 🚩 FLAGS                                │                                  │
│ • None                                  │ [View Full Audit →]              │
│                                         │                                  │
└─────────────────────────────────────────┴──────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────┐
│ QUICK ACTIONS                                                              │
│                                                                            │
│ [📧 Message Patient] [📋 Create Task] [📞 Log Phone Call (EXTERNAL)]       │
│ [⚠️ Escalate to Senior] [🚫 End Referral]                                  │
└────────────────────────────────────────────────────────────────────────────┘
```

---

#### 9b. Tasks Tab

```
┌────────────────────────────────────────────────────────────────────────────┐
│ ALL TASKS                                         [+ Create Task]          │
│                                                                            │
│ Filter: [All] [Pending] [Completed] [My Tasks]                             │
│                                                                            │
│ ┌──────────────────────────────────────────────────────────────────────┐  │
│ │ 🟡 Nephrology Review                                         PENDING │  │
│ │ Assigned: Dr. David Burke (Nephrology)                               │  │
│ │ Due: Feb 5, 2024                                                     │  │
│ │ [Open] [Send Reminder]                                               │  │
│ └──────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│ ┌──────────────────────────────────────────────────────────────────────┐  │
│ │ ✓ Dietitian Review                                        COMPLETED  │  │
│ │ Completed by: Amy Foster on Feb 3, 2024                              │  │
│ │ Outcome: Cleared                                                     │  │
│ │ [View Details]                                                       │  │
│ └──────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│ ┌──────────────────────────────────────────────────────────────────────┐  │
│ │ ✓ Social Work Review                                      COMPLETED  │  │
│ │ Completed by: Michael Ross on Feb 3, 2024                            │  │
│ │ Outcome: Cleared                                                     │  │
│ │ [View Details]                                                       │  │
│ └──────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│ ┌──────────────────────────────────────────────────────────────────────┐  │
│ │ ✓ EXTERNAL STEP: Retrieve outside cardiology records      COMPLETED  │  │
│ │ Completed by: Jane Thompson on Jan 26, 2024                          │  │
│ │ System: Phone/Fax                                                    │  │
│ │ Notes: "Faxed records received from St. Francis"                     │  │
│ │ [View Details]                                                       │  │
│ └──────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

---

#### 9c. Documents Tab

```
┌────────────────────────────────────────────────────────────────────────────┐
│ DOCUMENT CHECKLIST                                   [+ Upload Document]   │
│                                                                            │
│ ┌──────────────────────────────────────────────────────────────────────┐  │
│ │ PATIENT-PROVIDED                                                     │  │
│ ├──────────────────────────────────────────────────────────────────────┤  │
│ │ ✅ Government ID              Validated   Jan 16   Patient           │  │
│ │ ✅ Insurance Card             Validated   Jan 16   Patient           │  │
│ │ ✅ Inclusion/Exclusion Form   Complete    Jan 17   Patient           │  │
│ └──────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│ ┌──────────────────────────────────────────────────────────────────────┐  │
│ │ DIALYSIS CLINIC PACKET                                               │  │
│ ├──────────────────────────────────────────────────────────────────────┤  │
│ │ ✅ Medicare 2728 Form ⚠️      Validated   Jan 20   DUSW (hard-block) │  │
│ │ ✅ Dialysis Treatment Summary Validated   Jan 20   DUSW              │  │
│ │ ✅ Lab Results (last 3 mo)    Validated   Jan 21   Nephrologist      │  │
│ │ 🟡 Cardiology Clearance       Received    Jan 25   Shared            │  │
│ │    ↳ Status: Needs Review by Front Desk                              │  │
│ │ ❌ Hepatitis Panel            Missing     —        Nephrologist      │  │
│ │    ↳ [Request from Clinic]                                           │  │
│ └──────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│ ┌──────────────────────────────────────────────────────────────────────┐  │
│ │ EXTERNALLY RETRIEVED                                                 │  │
│ ├──────────────────────────────────────────────────────────────────────┤  │
│ │ ✅ Outside Cardiology Records Validated   Jan 26   EXTERNAL STEP     │  │
│ │ ❌ PCP Records (last 2 years) Missing     —        EXTERNAL STEP     │  │
│ │    ↳ [Create Retrieval Task]                                         │  │
│ └──────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│ Summary: 8 of 10 required documents received                               │
│ Hard-blocks: ✅ All cleared                                                │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

**Key features:**
- Color-coded status badges
- Hard-block items highlighted
- Document ownership shown (DUSW/Nephrologist/Shared/Patient)
- Actions: Request from Clinic, Create Retrieval Task, Upload, Validate

---

#### 9d. Messages Tab

```
┌────────────────────────────────────────────────────────────────────────────┐
│ MESSAGES                                            [+ New Message]        │
│                                                                            │
│ Filter: [All] [To Patient] [To Care Partner] [To Clinic] [Internal]       │
│                                                                            │
│ ┌──────────────────────────────────────────────────────────────────────┐  │
│ │ Feb 3, 2024 at 2:15 PM                                               │  │
│ │ From: Sarah Chen (PTC) → John Smith (Patient)                        │  │
│ │ Channel: In-App                                                      │  │
│ │ ──────────────────────────────────────────────────────────────────   │  │
│ │ Hi John,                                                             │  │
│ │                                                                      │  │
│ │ Great news - your specialist reviews are almost complete. We're      │  │
│ │ just waiting on the nephrology review which should be done by        │  │
│ │ tomorrow.                                                            │  │
│ │                                                                      │  │
│ │ Please let me know if you have any questions.                        │  │
│ │                                                                      │  │
│ │ - Sarah                                                              │  │
│ │                                                                      │  │
│ │ ✓ Read Feb 3, 2024 at 3:42 PM                                       │  │
│ └──────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│ ┌──────────────────────────────────────────────────────────────────────┐  │
│ │ Jan 25, 2024 at 10:30 AM                                             │  │
│ │ From: Jane Thompson (Front Desk) → Fresenius - Dr. Patel (Clinic)    │  │
│ │ Channel: In-App (to clinic portal)                                   │  │
│ │ ──────────────────────────────────────────────────────────────────   │  │
│ │ Dr. Patel,                                                           │  │
│ │                                                                      │  │
│ │ We're still missing the Hepatitis Panel for John Smith. Could you    │  │
│ │ please upload this at your earliest convenience?                     │  │
│ │                                                                      │  │
│ │ Thank you,                                                           │  │
│ │ Jane                                                                 │  │
│ │                                                                      │  │
│ │ ⏳ Unread                                                            │  │
│ └──────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

---

#### 9e. Decisions Tab

```
┌────────────────────────────────────────────────────────────────────────────┐
│ DECISIONS                                                                  │
│                                                                            │
│ ┌──────────────────────────────────────────────────────────────────────┐  │
│ │ Jan 28, 2024 — PROCEED TO SPECIALIST REVIEWS                         │  │
│ │ Decision by: Dr. Emily Adams (Senior Coordinator)                    │  │
│ │ Type: Medical Records Review Outcome                                 │  │
│ │ ──────────────────────────────────────────────────────────────────   │  │
│ │ Outcome: Proceed to Specialist Reviews                               │  │
│ │                                                                      │  │
│ │ Rationale:                                                           │  │
│ │ "All required records received. Patient meets initial criteria.     │  │
│ │ Proceeding to dietitian, social work, and nephrology reviews."       │  │
│ └──────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│ ┌──────────────────────────────────────────────────────────────────────┐  │
│ │ Jan 22, 2024 — PROCEED WITH PARTIAL DIALYSIS RECORDS                 │  │
│ │ Decision by: Dr. Emily Adams (Senior Coordinator)                    │  │
│ │ Type: Partial Packet Decision                                        │  │
│ │ ──────────────────────────────────────────────────────────────────   │  │
│ │ Outcome: Proceed with partial records                                │  │
│ │                                                                      │  │
│ │ Rationale:                                                           │  │
│ │ "Missing hepatitis panel is being retrieved. Core dialysis records   │  │
│ │ are sufficient to begin medical records review while we wait."       │  │
│ │                                                                      │  │
│ │ Missing items at time of decision:                                   │  │
│ │ • Hepatitis Panel (nephrologist-owned)                               │  │
│ └──────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│ ┌──────────────────────────────────────────────────────────────────────┐  │
│ │ Jan 18, 2024 — FINANCIAL CLEARED                                     │  │
│ │ Decision by: Rachel Green (Financial Coordinator)                    │  │
│ │ Type: Financial Screening                                            │  │
│ │ ──────────────────────────────────────────────────────────────────   │  │
│ │ Outcome: Cleared                                                     │  │
│ │                                                                      │  │
│ │ Insurance: Medicare + Delaware Medicaid (accepted)                   │  │
│ └──────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

---

#### 9f. Scheduling Tab

Show different states based on case stage:

**State 1: Pre-Scheduling (before education complete)**
```
┌────────────────────────────────────────────────────────────────────────────┐
│ SCHEDULING                                                                 │
│                                                                            │
│ ⏳ Education must be completed before scheduling can begin.                │
│                                                                            │
│ Education Status:                                                          │
│ • Video watched: ❌ Not started                                            │
│ • Confirmation form: ❌ Not started                                        │
│ • Healthcare guidance: ❌ Not started                                      │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

**State 2: Awaiting Scheduling Huddle**
```
┌────────────────────────────────────────────────────────────────────────────┐
│ SCHEDULING                                                                 │
│                                                                            │
│ ✅ Education complete                                                      │
│                                                                            │
│ ⏳ Awaiting Scheduling Huddle Decision                                     │
│                                                                            │
│ The in-person scheduling planning meeting must occur before proceeding.    │
│                                                                            │
│ [Record Scheduling Huddle Decision]  ← Opens modal                         │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

**State 3: Scheduling in Progress**
```
┌────────────────────────────────────────────────────────────────────────────┐
│ SCHEDULING                                                                 │
│                                                                            │
│ ✅ Scheduling Huddle Decision recorded Feb 3, 2024                         │
│    Type: Direct Evaluation                                                 │
│    Care Partner Required: Yes                                              │
│    Decided by: Jane Thompson                                               │
│                                                                            │
│ ┌──────────────────────────────────────────────────────────────────────┐  │
│ │ TIME WINDOWS (sent to patient)                                       │  │
│ │                                                                      │  │
│ │ • Tuesday, Feb 13 — 9:00 AM - 11:00 AM                              │  │
│ │ • Wednesday, Feb 14 — 1:00 PM - 3:00 PM                             │  │
│ │ • Thursday, Feb 15 — 10:00 AM - 12:00 PM                            │  │
│ │                                                                      │  │
│ │ [Edit Windows] [Send Reminder]                                       │  │
│ └──────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│ Patient Selection: ⏳ Awaiting response                                    │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

**State 4: Pending Surginet Confirmation**
```
┌────────────────────────────────────────────────────────────────────────────┐
│ SCHEDULING                                                                 │
│                                                                            │
│ ✅ Patient selected: Wednesday, Feb 14 at 1:00 PM                          │
│ ✅ Care partner confirmed: Mary Smith will attend                          │
│                                                                            │
│ ⏳ EXTERNAL STEP: Confirm in Surginet                                      │
│                                                                            │
│ [Mark as Confirmed in Surginet]  ← Opens EXTERNAL STEP modal               │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

**State 5: Scheduled**
```
┌────────────────────────────────────────────────────────────────────────────┐
│ SCHEDULING                                                                 │
│                                                                            │
│ ✅ APPOINTMENT CONFIRMED                                                   │
│                                                                            │
│ Date: Wednesday, February 14, 2024                                         │
│ Time: 1:00 PM                                                              │
│ Type: Direct Evaluation                                                    │
│ Care Partner: Mary Smith (confirmed attending)                             │
│                                                                            │
│ Confirmed in Surginet: Feb 5, 2024 by Jane Thompson                        │
│                                                                            │
│ [Mark No-Show] [Reschedule]                                                │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

---

#### 9g. End Referral Tab

```
┌────────────────────────────────────────────────────────────────────────────┐
│ END REFERRAL                                                               │
│                                                                            │
│ ⚠️ This will permanently end the referral and trigger the letter workflow.│
│    The case will be marked Inactive.                                       │
│                                                                            │
│ ──────────────────────────────────────────────────────────────────────────│
│                                                                            │
│ STEP 1: SELECT END REASON *                                                │
│ ┌──────────────────────────────────────────────────────────────────────┐  │
│ │ ○ Financial - Insurance not accepted                                 │  │
│ │ ○ Financial - Unable to verify coverage                              │  │
│ │ ○ Clinical - Does not meet inclusion criteria                        │  │
│ │ ○ Clinical - Exclusion criteria present                              │  │
│ │ ○ Clinical - Medical contraindication                                │  │
│ │ ○ No response after 3 attempts                                       │  │
│ │ ○ Patient withdrew interest                                          │  │
│ │ ○ Incomplete packet - unable to proceed                              │  │
│ │ ○ Other (requires detailed explanation)                              │  │
│ └──────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│ STEP 2: RATIONALE (required) *                                             │
│ ┌──────────────────────────────────────────────────────────────────────┐  │
│ │                                                                      │  │
│ │                                                                      │  │
│ │                                                                      │  │
│ └──────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│ STEP 3: REVIEW & APPROVE LETTER                                            │
│ ┌──────────────────────────────────────────────────────────────────────┐  │
│ │ Dear Mr. Smith,                                                      │  │
│ │                                                                      │  │
│ │ We regret to inform you that your referral to the ChristianaCare    │  │
│ │ Kidney Transplant Program has been ended.                            │  │
│ │                                                                      │  │
│ │ Reason: [Auto-populated based on selection]                          │  │
│ │                                                                      │  │
│ │ To be re-referred in the future, you will need to:                   │  │
│ │ • [Re-referral requirements based on end reason]                     │  │
│ │                                                                      │  │
│ │ If you have questions, please contact us at (302) 555-0100.          │  │
│ │                                                                      │  │
│ │ Sincerely,                                                           │  │
│ │ ChristianaCare Transplant Team                                       │  │
│ └──────────────────────────────────────────────────────────────────────┘  │
│ [✏️ Edit Letter]                                                           │
│                                                                            │
│ ──────────────────────────────────────────────────────────────────────────│
│                                                                            │
│ [ Cancel ]                                      [ Approve & End Referral ] │
│                                                                            │
│ ℹ️ After approval, Front Desk will receive a task to send this letter     │
│    to the patient and referring clinic.                                    │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

---

#### 9h. Audit Tab

```
┌────────────────────────────────────────────────────────────────────────────┐
│ AUDIT LOG                                                   [Export]       │
│                                                                            │
│ Filter: [All Events] [Stage Changes] [Decisions] [Tasks] [Messages]       │
│                                                                            │
│ ┌──────────────────────────────────────────────────────────────────────┐  │
│ │ Feb 3, 2024 at 2:15 PM                                               │  │
│ │ MESSAGE SENT                                    Sarah Chen (PTC)     │  │
│ │ Sent in-app message to patient regarding specialist review status    │  │
│ └──────────────────────────────────────────────────────────────────────┘  │
│ ┌──────────────────────────────────────────────────────────────────────┐  │
│ │ Feb 3, 2024 at 11:30 AM                                              │  │
│ │ TASK COMPLETED                                  Michael Ross (SW)    │  │
│ │ Social Work Review completed — Outcome: Cleared                      │  │
│ └──────────────────────────────────────────────────────────────────────┘  │
│ ┌──────────────────────────────────────────────────────────────────────┐  │
│ │ Feb 3, 2024 at 9:15 AM                                               │  │
│ │ TASK COMPLETED                                  Amy Foster (Diet)    │  │
│ │ Dietitian Review completed — Outcome: Cleared                        │  │
│ └──────────────────────────────────────────────────────────────────────┘  │
│ ┌──────────────────────────────────────────────────────────────────────┐  │
│ │ Jan 28, 2024 at 3:00 PM                                              │  │
│ │ DECISION RECORDED                            Dr. Emily Adams (SC)    │  │
│ │ Medical Records Review: Proceed to Specialist Reviews                │  │
│ │ Rationale: "All required records received. Patient meets initial..." │  │
│ └──────────────────────────────────────────────────────────────────────┘  │
│ ┌──────────────────────────────────────────────────────────────────────┐  │
│ │ Jan 28, 2024 at 2:45 PM                                              │  │
│ │ STAGE CHANGE                                 System                  │  │
│ │ Stage changed: Medical Records Review → Specialist Review            │  │
│ └──────────────────────────────────────────────────────────────────────┘  │
│ ┌──────────────────────────────────────────────────────────────────────┐  │
│ │ Jan 26, 2024 at 4:30 PM                                              │  │
│ │ EXTERNAL STEP COMPLETED                   Jane Thompson (FD)         │  │
│ │ Retrieved outside cardiology records via fax                         │  │
│ │ System: Phone/Fax | Notes: "Faxed records received from St. Francis" │  │
│ └──────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│ ... (scrollable)                                                           │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

---

### 10. Modals

#### Send Message Modal

```
┌─────────────────────────────────────────────────────────────┐
│ Send Message                                          [X]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ To: *                                                       │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ☑ John Smith (Patient)              ✅ In-app consent  │ │
│ │ ☐ Mary Smith (Care Partner)         ✅ Notifications   │ │
│ │ ☐ Fresenius - DUSW Contact                             │ │
│ │ ☐ Fresenius - Nephrologist Contact                     │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Template (optional):                                        │
│ [ Select template...                               ▼]       │
│                                                             │
│ Message: *                                                  │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Hi John,                                                │ │
│ │                                                         │ │
│ │ [cursor]                                                │ │
│ │                                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ☐ Mark as contact attempt #__                               │
│                                                             │
│ ℹ️ Messages are sent via the in-app portal. If SMS/email    │
│    notification is consented, a notification-only alert     │
│    (no PHI) will also be sent.                              │
│                                                             │
│                        [Cancel]  [Send Message]             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Log EXTERNAL STEP Modal

```
┌─────────────────────────────────────────────────────────────┐
│ Log EXTERNAL STEP                                     [X]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Action Type: *                                              │
│ [ Select...                                        ▼]       │
│   • Phone call to patient                                   │
│   • Phone call to clinic                                    │
│   • Phone call to outside provider                          │
│   • Fax sent                                                │
│   • Fax received                                            │
│   • Confirmed in Surginet                                   │
│   • Confirmed in Cerner                                     │
│   • Mailed letter                                           │
│   • Other                                                   │
│                                                             │
│ External System: *                                          │
│ [ Select...                                        ▼]       │
│   • Surginet                                                │
│   • Cerner                                                  │
│   • Phone                                                   │
│   • Fax                                                     │
│   • Mail                                                    │
│   • Other                                                   │
│                                                             │
│ Outcome/Notes: *                                            │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                                                         │ │
│ │                                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ☐ This is a contact attempt (attempt #__)                   │
│                                                             │
│                        [Cancel]  [Log EXTERNAL STEP]        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Decision Modal (Generic)

```
┌─────────────────────────────────────────────────────────────┐
│ Record Decision                                       [X]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Decision Type: Partial Packet Decision                      │
│ Case: TC-2024-0142 (Smith, John)                           │
│                                                             │
│ ──────────────────────────────────────────────────────────  │
│                                                             │
│ Context:                                                    │
│ The following documents are still missing:                  │
│ • Hepatitis Panel (nephrologist-owned)                      │
│ • PCP Records — last 2 years (external retrieval)           │
│                                                             │
│ ──────────────────────────────────────────────────────────  │
│                                                             │
│ Your Decision: *                                            │
│ ○ Proceed with partial records                              │
│ ○ Extend wait (set new expected date)                       │
│ ○ End referral (incomplete packet)                          │
│                                                             │
│ Rationale (required): *                                     │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                                                         │ │
│ │                                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│                        [Cancel]  [Submit Decision]          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Specialist Review Modal

```
┌─────────────────────────────────────────────────────────────┐
│ Submit Review Outcome                                 [X]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Review Type: Dietitian Review                               │
│ Case: TC-2024-0142 (Smith, John)                           │
│                                                             │
│ ──────────────────────────────────────────────────────────  │
│                                                             │
│ Documents Available:                                        │
│ • Dialysis Treatment Summary [View]                         │
│ • Lab Results [View]                                        │
│ • Inclusion/Exclusion Responses [View]                      │
│                                                             │
│ ──────────────────────────────────────────────────────────  │
│                                                             │
│ Your Outcome: *                                             │
│ ○ Clear — No concerns                                       │
│ ○ Needs Clarification — Will message patient                │
│ ○ Concern → Escalate to Senior Coordinator                  │
│                                                             │
│ Notes:                                                      │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                                                         │ │
│ │                                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ [Request Additional Records]                                │
│                                                             │
│                        [Cancel]  [Submit Outcome]           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Scheduling Huddle Modal

```
┌─────────────────────────────────────────────────────────────┐
│ Record Scheduling Huddle Decision                     [X]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Case: TC-2024-0142 (Smith, John)                           │
│                                                             │
│ This records the outcome of the in-person scheduling        │
│ planning meeting.                                           │
│                                                             │
│ ──────────────────────────────────────────────────────────  │
│                                                             │
│ Appointment Type: *                                         │
│ ○ Direct Evaluation                                         │
│ ○ Testing First                                             │
│                                                             │
│ If "Testing First," select required tests:                  │
│ ☐ Cardiac stress test                                       │
│ ☐ Colonoscopy                                               │
│ ☐ Mammogram                                                 │
│ ☐ Other: ______________                                     │
│                                                             │
│ Care Partner Must Attend: *                                 │
│ ● Yes (default)                                             │
│ ○ No (override with rationale)                              │
│                                                             │
│ Notes:                                                      │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│                        [Cancel]  [Record Decision]          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Start Re-Referral Modal

```
┌─────────────────────────────────────────────────────────────┐
│ Start Re-Referral                                     [X]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Original Case: TC-2023-0089 (Clark, Robin)                 │
│ Ended: Nov 15, 2023                                         │
│ End Reason: No response after 3 attempts                    │
│                                                             │
│ ──────────────────────────────────────────────────────────  │
│                                                             │
│ Re-Referral Requirements from Previous End:                 │
│ ✅ Patient must respond to contact attempts                 │
│ ⏳ ROI may need re-signing (check expiration)               │
│                                                             │
│ ──────────────────────────────────────────────────────────  │
│                                                             │
│ This will:                                                  │
│ • Create a NEW case record linked to the original           │
│ • Copy forward: name, contact info only                     │
│ • NOT copy: clinical info, old documents (need re-review)   │
│ • Create a "Re-Referral Review" task for Senior Coordinator │
│                                                             │
│                        [Cancel]  [Start Re-Referral]        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### 11. Admin Pages (Senior Coordinator Only)

#### Admin Landing

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ ADMIN / CONFIGURATION                                                        │
│                                                                              │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐                 │
│ │ 📊 Stages       │ │ 📄 Documents    │ │ 🚫 End Reasons  │                 │
│ │                 │ │                 │ │                 │                 │
│ │ Configure stage │ │ Document catalog│ │ Standardized    │                 │
│ │ definitions,    │ │ requirements,   │ │ end reason      │                 │
│ │ SLAs, order     │ │ hard-blocks     │ │ codes           │                 │
│ │                 │ │                 │ │                 │                 │
│ │ [Manage →]      │ │ [Manage →]      │ │ [Manage →]      │                 │
│ └─────────────────┘ └─────────────────┘ └─────────────────┘                 │
│                                                                              │
│ ┌─────────────────┐ ┌─────────────────┐                                     │
│ │ 📝 Templates    │ │ 👥 Users        │                                     │
│ │                 │ │                 │                                     │
│ │ Letter and      │ │ Staff accounts  │                                     │
│ │ message         │ │ and role        │                                     │
│ │ templates       │ │ assignments     │                                     │
│ │                 │ │                 │                                     │
│ │ [Manage →]      │ │ [Manage →]      │                                     │
│ └─────────────────┘ └─────────────────┘                                     │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

Show simple editable tables for each config area. Can be read-only for demo purposes with "Save" buttons that show toast notifications.

---

## Interaction Behaviors

### State Transitions (Simulated)

When actions are taken, update the case state and show the change:

1. **Complete Task** → Mark task complete, check if stage should advance
2. **Record Decision** → Log decision, trigger next workflow step
3. **Send Message** → Add to message thread, increment contact attempt if flagged
4. **Take Patient (PTC)** → Assign PTC to case, remove from unassigned queue
5. **Approve Document** → Change status to Validated
6. **End Referral** → Change stage to "ended", create letter send task
7. **Start Re-Referral** → Create new linked case, stage = re-referral-review

### Toast Notifications

After every action, show a toast notification:
- ✅ "Task completed successfully"
- ✅ "Decision recorded"
- ✅ "Message sent to patient"
- ✅ "Case assigned to you"
- ✅ "Document validated"

### Persist to localStorage

Store all mock data in localStorage so changes persist during the demo:

```typescript
// On app load
const cases = JSON.parse(localStorage.getItem('transplant-cases') || '[]');

// After any change
localStorage.setItem('transplant-cases', JSON.stringify(cases));
```

Include a "Reset Demo Data" button in the header for convenience.

---

## Workflow Coverage Checklist

**The prototype MUST demonstrate all of these:**

### Stage Progressions
- [ ] Stage 1-2: New referral → Patient onboarding → ROI signed
- [ ] Stage 3: Initial TODOs (I/E form, ID, Insurance)
- [ ] Stage 4: Front Desk confirms I/E review
- [ ] Stage 5: Intermediary step (collect missing I/E values)
- [ ] Stage 6: Initial screening → routing decision (Financial vs Senior)
- [ ] Stage 6.5: Financial screening (Clear / Needs Info / Not Cleared)
- [ ] Stage 7: Records collection (clinic packet, 2728 hard-block)
- [ ] Stage 8: Senior Coordinator medical records review
- [ ] Stage 9: Specialist reviews (parallel: Diet, SW, Neph)
- [ ] Stage 10: Senior Coordinator final decision
- [ ] Stage 11: Education (video, form, guidance)
- [ ] Stage 12: Scheduling (huddle → time windows → confirm)
- [ ] Stage 13: Re-referral flow

### Key Features
- [ ] PTC self-assignment from shared queue
- [ ] SLA tracking with color-coded badges
- [ ] EXTERNAL STEP logging (phone, fax, Surginet)
- [ ] Partial packet decisions with rationale
- [ ] Hard-block document tracking (2728)
- [ ] 3x contact attempt tracking + escalation
- [ ] Specialist conflict flagging
- [ ] End referral flow (reason → rationale → letter → send task)
- [ ] Re-referral as linked case
- [ ] Care partner consent display
- [ ] Message threading with consent checks
- [ ] Full audit trail

### Role-Specific Queues
- [ ] Front Desk: Intake, Doc Review, I/E Review, Missing Info, Scheduling, End Letters
- [ ] PTC: My Cases, At Risk, Unassigned queue
- [ ] Senior Coordinator: Decision queue by type
- [ ] Financial: Screening queue, Needs Clarification
- [ ] Specialists: Review tasks queue

---

## Demo Script Preparation

Create mock data that supports this demo flow:

1. **Show Front Desk dashboard** — highlight overdue tasks, I/E review queue
2. **Open a case in Initial Screening** — show I/E responses, confirm review
3. **Show routing decision** — Front Desk routes to Financial (normal) or Senior (flagged)
4. **Show PTC dashboard** — demonstrate "Take Patient" from unassigned queue
5. **Show case with stalled packet** — 2728 missing, partial packet decision needed
6. **Show Senior Coordinator decisions** — walk through decision panel
7. **Show specialist review submission** — Dietitian clears, show audit log
8. **Show education stage** — patient TODOs visible
9. **Show scheduling flow** — huddle decision → time windows → Surginet confirmation
10. **Show end referral flow** — full letter workflow
11. **Show re-referral** — start from ended case, show linked case creation
12. **Show pipeline view** — filter by SLA status, export capability

---

## Final Checklist Before Submission

- [ ] All 7 role dashboards implemented and functional
- [ ] Pipeline view with filtering and pagination
- [ ] Case Cockpit with all 8 tabs
- [ ] All modals implemented and connected
- [ ] Mock data covers all stages and scenarios
- [ ] SLA calculations working (color-coded badges)
- [ ] Actions update state and show in audit log
- [ ] Toast notifications on all actions
- [ ] localStorage persistence working
- [ ] Role switcher in sidebar
- [ ] Mobile-responsive (works on tablet)
- [ ] No console errors
- [ ] Clean, professional UI matching healthcare aesthetic
- [ ] Demo reset button functional

---

## IMPORTANT: Error Avoidance

1. **Do NOT skip any workflow stage** — all 13 stages must be demonstrable
2. **Do NOT forget EXTERNAL STEP tracking** — this is critical
3. **Do NOT forget rationale fields** — they're required on decisions
4. **Do NOT forget care partner consent checks** — they must be visible
5. **Do NOT forget the 2728 hard-block** — must be specially called out
6. **Do NOT forget PTC self-assignment** — it's a specific workflow step
7. **Do NOT forget the scheduling huddle** — it's the first step in scheduling
8. **Do NOT use generic placeholder text** — use realistic healthcare content

---

## Now Build It!

Follow this guide exactly. Build each component methodically. Test each interaction. The executive reviewing this will check that every workflow step from their specification is visible and functional in the prototype.

Good luck! 🏥

# Transplant Center Portal: Complete Fix & Enhancement Instructions

## CRITICAL CONTEXT FOR AI AGENT

You are fixing a Next.js 14 prototype of a Transplant Center Portal for kidney transplant referral workflow management. This prototype will be **live demoed to the Senior Coordinator at ChristianaCare hospital** who wrote the original workflow specification.

**THE DEMO MUST BE FLAWLESS.** Every workflow step from the specification must work. The Senior Coordinator will test edge cases.

**Tech Stack:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- React Context for state
- localStorage for persistence

**Project Location:** The codebase is already set up. You are making targeted fixes and enhancements.

---

## TABLE OF CONTENTS

1. [Critical Workflow Fixes](#1-critical-workflow-fixes) (6 items)
2. [Important Workflow Fixes](#2-important-workflow-fixes) (8 items)
3. [UI/UX Enhancements](#3-uiux-enhancements) (10 items)
4. [Data & State Fixes](#4-data--state-fixes) (5 items)
5. [Demo Polish Items](#5-demo-polish-items) (8 items)
6. [New Mock Data Requirements](#6-new-mock-data-requirements)
7. [Testing Checklist](#7-testing-checklist)

---

## 1. CRITICAL WORKFLOW FIXES

### Fix 1.1: Add Initial Screening Routing Decision (Stage 6)

**Problem:** Front Desk cannot route cases from Initial Screening to either Financial or Senior Coordinator.

**Files to Create/Modify:**

#### Create: `components/modals/ScreeningRoutingModal.tsx`

```tsx
'use client';

import { useState } from 'react';
import { Case } from '@/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';

interface ScreeningRoutingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentCase: Case;
  onRoute: (destination: 'financial' | 'senior', notes: string) => void;
}

export function ScreeningRoutingModal({ open, onOpenChange, currentCase, onRoute }: ScreeningRoutingModalProps) {
  const [notes, setNotes] = useState('');
  const [destination, setDestination] = useState<'financial' | 'senior' | null>(null);

  const hasFlags = currentCase.flags.length > 0;
  const flagsExcludingAssignPTC = currentCase.flags.filter(f => f !== 'Assign PTC');

  const handleSubmit = () => {
    if (!destination) return;
    if (destination === 'senior' && !notes.trim()) return;
    onRoute(destination, notes);
    setNotes('');
    setDestination(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5" />
            Route Initial Screening
          </DialogTitle>
          <DialogDescription>
            Review the patient's Inclusion/Exclusion responses and route to the appropriate next step.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Patient Info */}
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-lg font-semibold text-slate-900">
              {currentCase.patient.lastName}, {currentCase.patient.firstName}
            </p>
            <p className="text-sm text-slate-600">
              Case: {currentCase.caseNumber} • DOB: {currentCase.patient.dateOfBirth}
            </p>
            <p className="text-sm text-slate-600">
              Clinic: {currentCase.referringClinic}
            </p>
          </div>

          {/* I/E Confirmation Status */}
          <div className={`flex items-center gap-2 rounded-lg p-3 ${currentCase.ieConfirmReviewComplete ? 'bg-emerald-50 border border-emerald-200' : 'bg-amber-50 border border-amber-200'}`}>
            {currentCase.ieConfirmReviewComplete ? (
              <>
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-800">I/E Review Confirmed</span>
              </>
            ) : (
              <>
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <span className="text-sm font-medium text-amber-800">I/E Review Not Yet Confirmed</span>
              </>
            )}
          </div>

          {/* Flagged Items Warning */}
          {flagsExcludingAssignPTC.length > 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
              <p className="flex items-center gap-2 text-sm font-semibold text-amber-800">
                <AlertTriangle className="h-4 w-4" />
                System Flags Detected:
              </p>
              <ul className="mt-1 list-disc pl-5 text-sm text-amber-700">
                {flagsExcludingAssignPTC.map(flag => <li key={flag}>{flag}</li>)}
              </ul>
              <p className="mt-2 text-xs text-amber-600">
                Consider routing to Senior Coordinator for review if flags indicate concerns.
              </p>
            </div>
          )}

          {/* Routing Options */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Select Routing Destination:</Label>
            
            <button
              type="button"
              onClick={() => setDestination('financial')}
              className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
                destination === 'financial' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <p className="font-semibold text-slate-900">Route to Financial Screening</p>
              <p className="text-sm text-slate-600">
                Patient responses appear acceptable. Proceed with insurance verification.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setDestination('senior')}
              className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
                destination === 'senior' 
                  ? 'border-amber-500 bg-amber-50' 
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <p className="font-semibold text-slate-900">Route to Senior Coordinator Review</p>
              <p className="text-sm text-slate-600">
                Responses are unclear, concerning, or require clinical judgment.
              </p>
            </button>
          </div>

          {/* Notes Field (Required for Senior routing) */}
          {destination === 'senior' && (
            <div className="space-y-2">
              <Label className="text-sm font-semibold">
                Routing Notes <span className="text-red-500">*</span>
              </Label>
              <Textarea 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)} 
                placeholder="Describe the concerns or reasons for Senior Coordinator review..."
                className="min-h-[100px]"
              />
              <p className="text-xs text-slate-500">
                Required: Explain why this case needs Senior Coordinator review.
              </p>
            </div>
          )}

          {/* Notes Field (Optional for Financial routing) */}
          {destination === 'financial' && (
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Notes (Optional)</Label>
              <Textarea 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)} 
                placeholder="Any additional notes for the financial team..."
                className="min-h-[60px]"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              className="flex-1"
              disabled={!destination || (destination === 'senior' && !notes.trim())}
              onClick={handleSubmit}
            >
              {destination === 'financial' ? 'Route to Financial →' : 
               destination === 'senior' ? 'Route to Senior →' : 'Select Destination'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

#### Modify: `lib/context/CaseContext.tsx`

Add this function to the CaseContext (add to interface and implementation):

```typescript
// Add to CaseContextValue interface:
routeInitialScreening: (caseId: string, destination: 'financial' | 'senior', notes: string) => void;

// Add implementation inside CaseProvider:
const routeInitialScreening = (caseId: string, destination: 'financial' | 'senior', notes: string) => {
  if (!actor) return;

  setData((current) => {
    const next = structuredClone(current);
    const currentCase = next.cases.find((item) => item.id === caseId);
    if (!currentCase) return current;

    if (destination === 'financial') {
      // Route to Financial Screening
      currentCase.stage = 'financial-screening';
      currentCase.stageEnteredAt = nowIso();
      currentCase.updatedAt = nowIso();
      
      // Create financial screening task
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

      // Ensure case appears in PTC assignment queue if no PTC assigned
      if (!currentCase.assignedPTC) {
        if (!currentCase.flags.includes('Assign PTC')) {
          currentCase.flags.push('Assign PTC');
        }
      }

      // Record the routing decision
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
      // Route to Senior Coordinator for review
      next.decisions.unshift({
        id: buildId('decision'),
        caseId,
        type: 'screening-override',
        title: 'Screening Override Review',
        options: ['Override - Proceed to Financial', 'Request clarification from patient', 'End referral'],
        status: 'pending',
        createdAt: nowIso()
      });

      next.tasks.unshift({
        id: buildId('task'),
        caseId,
        type: 'screening-override',
        title: 'Review Flagged Initial Screening',
        description: `Front Desk notes: ${notes}`,
        assignedToRole: 'senior-coordinator',
        status: 'pending',
        priority: 'urgent',
        dueDate: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
        slaStatus: 'at-risk',
        isExternalStep: false,
        createdAt: nowIso()
      });

      // Add flag to indicate pending senior review
      if (!currentCase.flags.includes('Pending Senior Review')) {
        currentCase.flags.push('Pending Senior Review');
      }

      withAudit(next, caseId, 'SCREENING_FLAGGED', `Routed to Senior Coordinator for review: ${notes}`, { destination: 'senior', notes });
    }

    return next;
  });
};

// Add to the value object returned by useMemo:
routeInitialScreening,
```

#### Modify: `app/dashboard/front-desk/page.tsx`

Add the routing functionality to the Front Desk dashboard:

1. Import the new modal:
```typescript
import { ScreeningRoutingModal } from '@/components/modals/ScreeningRoutingModal';
```

2. Add state for the modal:
```typescript
const [routingModalOpen, setRoutingModalOpen] = useState(false);
const [routingCase, setRoutingCase] = useState<Case | null>(null);
```

3. Add the `routeInitialScreening` function from context:
```typescript
const { cases, tasks, documents, completeTask, validateDocument, logExternalStep, routeInitialScreening } = useCases();
```

4. Add a new queue tab for Initial Screening:
```typescript
const queueTabs = [
  { id: 'all', label: 'All' },
  { id: 'intake', label: 'Intake/TODOs' },
  { id: 'ie-review', label: 'I/E Review' },
  { id: 'initial-screening', label: 'Route Screening' },  // ADD THIS
  { id: 'doc-review', label: 'Doc Review' },
  { id: 'missing-info', label: 'Missing Info' },
  { id: 'scheduling', label: 'Scheduling' },
  { id: 'end-letters', label: 'End Letters' }
] as const;
```

5. Add filter logic for initial-screening tab (in the filteredCases useMemo):
```typescript
if (activeTab === 'initial-screening') {
  return cases.filter((currentCase) => currentCase.stage === 'initial-screening' && currentCase.ieConfirmReviewComplete);
}
```

6. Add action buttons for initial-screening cases in the actionsByCaseId useMemo:
```typescript
// Add this case in the forEach loop:
if (currentCase.stage === 'initial-screening' && currentCase.ieConfirmReviewComplete) {
  actionMap[currentCase.id] = (
    <Button
      size='sm'
      onClick={() => {
        setRoutingCase(currentCase);
        setRoutingModalOpen(true);
      }}
    >
      Route Case →
    </Button>
  );
  return;
}
```

7. Add the modal at the bottom of the component (before the closing div):
```tsx
{routingCase && (
  <ScreeningRoutingModal
    open={routingModalOpen}
    onOpenChange={setRoutingModalOpen}
    currentCase={routingCase}
    onRoute={(destination, notes) => {
      routeInitialScreening(routingCase.id, destination, notes);
      notify(destination === 'financial' ? 'Case routed to Financial Screening' : 'Case routed to Senior Coordinator');
      setRoutingCase(null);
    }}
  />
)}
```

---

### Fix 1.2: Enforce 2728 Hard-Block Document

**Problem:** Cases can advance from Records Collection without the required Medicare 2728 form.

#### Modify: `lib/utils/stageTransitions.ts`

Replace the entire file:

```typescript
import { orderedProgressStages, stageDefinitions } from '@/lib/data/stages';
import { Case, CaseStage, Document, Task } from '@/types';

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

export function checkHardBlocksCleared(caseId: string, documents: Document[]): { cleared: boolean; missing: Document[] } {
  const caseDocuments = documents.filter(d => d.caseId === caseId);
  const missingHardBlocks = caseDocuments.filter(d => d.isHardBlock && d.status !== 'validated');
  return {
    cleared: missingHardBlocks.length === 0,
    missing: missingHardBlocks
  };
}

export function canAdvanceFromRecordsCollection(currentCase: Case, documents: Document[], hasPartialPacketDecision: boolean): { canAdvance: boolean; reason?: string; missingDocs?: Document[] } {
  const { cleared, missing } = checkHardBlocksCleared(currentCase.id, documents);
  
  if (cleared) {
    return { canAdvance: true };
  }
  
  if (hasPartialPacketDecision) {
    return { canAdvance: true, reason: 'Advancing with Senior Coordinator override' };
  }
  
  return { 
    canAdvance: false, 
    reason: `Hard-block documents missing: ${missing.map(d => d.name).join(', ')}`,
    missingDocs: missing
  };
}

export function maybeAdvanceCaseStage(currentCase: Case, caseTasks: Task[], caseDocuments?: Document[]): CaseStage | undefined {
  const pendingBlocking = caseTasks.some((task) => task.status !== 'completed' && task.priority !== 'low');
  if (pendingBlocking) return undefined;
  
  // Special check for records-collection stage
  if (currentCase.stage === 'records-collection' && caseDocuments) {
    const { cleared } = checkHardBlocksCleared(currentCase.id, caseDocuments);
    if (!cleared) return undefined;
  }
  
  return getNextStage(currentCase.stage);
}

export function stageDisplay(stage: CaseStage) {
  return stageDefinitions.find((s) => s.id === stage)?.name ?? stage;
}
```

#### Modify: `components/case-cockpit/DocumentsTab.tsx`

Add a prominent hard-block warning banner. Replace the component:

```tsx
'use client';

import { useMemo, useState } from 'react';
import { AlertTriangle, FileWarning, CheckCircle2, Upload } from 'lucide-react';
import { Case, Document, Task } from '@/types';
import { Button } from '@/components/ui/button';
import { DocumentRow } from '@/components/shared/DocumentRow';
import { RequestRecordsModal } from '@/components/modals/RequestRecordsModal';

interface DocumentsTabProps {
  currentCase: Case;
  documents: Document[];
  onValidateDocument: (documentId: string, status?: 'validated' | 'rejected') => void;
  onCreateTask: (payload: {
    title: string;
    type: Task['type'];
    assignedToRole: Task['assignedToRole'];
    dueDate: string;
    description: string;
    isExternalStep: boolean;
    externalSystem?: string;
  }) => void;
}

export function DocumentsTab({ currentCase, documents, onValidateDocument, onCreateTask }: DocumentsTabProps) {
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [requestTarget, setRequestTarget] = useState<Document | null>(null);

  const patientDocs = useMemo(() => documents.filter((document) => document.ownership === 'patient'), [documents]);
  const duswDocs = useMemo(() => documents.filter((document) => document.ownership === 'dusw'), [documents]);
  const nephDocs = useMemo(() => documents.filter((document) => document.ownership === 'nephrologist'), [documents]);
  const sharedDocs = useMemo(() => documents.filter((document) => document.ownership === 'shared'), [documents]);
  const externalDocs = useMemo(() => documents.filter((document) => document.source === 'external-retrieval'), [documents]);

  const requiredTotal = documents.filter((document) => document.status !== 'expired').length;
  const receivedTotal = documents.filter((document) => ['received', 'validated', 'needs-review'].includes(document.status)).length;
  
  // Hard-block analysis
  const hardBlockDocs = documents.filter((document) => document.isHardBlock);
  const hardBlocksMissing = hardBlockDocs.filter((document) => document.status !== 'validated');
  const hardBlocksCleared = hardBlocksMissing.length === 0;

  const isRecordsStage = currentCase.stage === 'records-collection';

  return (
    <div className='space-y-4'>
      {/* HARD-BLOCK WARNING BANNER */}
      {isRecordsStage && hardBlocksMissing.length > 0 && (
        <div className="rounded-xl border-2 border-red-300 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <FileWarning className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-800">
                ⚠️ Hard-Block: Case Cannot Advance
              </h3>
              <p className="text-sm text-red-700 mt-1">
                The following required documents must be received and validated before this case can proceed to Medical Records Review:
              </p>
              <ul className="mt-2 space-y-1">
                {hardBlocksMissing.map((doc) => (
                  <li key={doc.id} className="flex items-center gap-2 text-sm font-medium text-red-800">
                    <AlertTriangle className="h-4 w-4" />
                    {doc.name} 
                    <span className="text-red-600 font-normal">
                      ({doc.status === 'required' ? 'Not received' : doc.status === 'received' ? 'Awaiting validation' : doc.status})
                    </span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-red-600 mt-3">
                Senior Coordinator can override this block with documented rationale if necessary.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Hard-blocks cleared success message */}
      {isRecordsStage && hardBlocksCleared && hardBlockDocs.length > 0 && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            <div>
              <h3 className="font-semibold text-emerald-800">Hard-Block Documents Cleared</h3>
              <p className="text-sm text-emerald-700">All required blocking documents have been validated.</p>
            </div>
          </div>
        </div>
      )}

      <div className='flex items-center justify-between'>
        <h3 className='text-sm font-semibold uppercase tracking-wide text-slate-500'>Document Checklist</h3>
        <Button variant='secondary'>
          <Upload className="h-4 w-4 mr-2" />
          Upload Document
        </Button>
      </div>

      {/* Patient-Provided Documents */}
      <section className='space-y-2 rounded-xl border border-slate-200 bg-white p-4'>
        <h4 className='text-sm font-semibold text-slate-800'>Patient-Provided</h4>
        {patientDocs.length === 0 ? (
          <p className="text-sm text-slate-500">No patient documents tracked.</p>
        ) : (
          patientDocs.map((document) => (
            <DocumentRow
              key={document.id}
              document={document}
              onValidate={() => onValidateDocument(document.id, 'validated')}
              onReject={() => onValidateDocument(document.id, 'rejected')}
            />
          ))
        )}
      </section>

      {/* Dialysis Clinic Packet - DUSW */}
      <section className='space-y-2 rounded-xl border border-slate-200 bg-white p-4'>
        <h4 className='text-sm font-semibold text-slate-800'>Dialysis Clinic Packet - DUSW Owned</h4>
        {duswDocs.length === 0 ? (
          <p className="text-sm text-slate-500">No DUSW documents tracked.</p>
        ) : (
          duswDocs.map((document) => (
            <DocumentRow
              key={document.id}
              document={document}
              onValidate={() => onValidateDocument(document.id, 'validated')}
              onReject={() => onValidateDocument(document.id, 'rejected')}
              onRequest={
                document.status === 'required'
                  ? () => {
                      setRequestTarget(document);
                      setRequestModalOpen(true);
                    }
                  : undefined
              }
            />
          ))
        )}
      </section>

      {/* Dialysis Clinic Packet - Nephrologist */}
      <section className='space-y-2 rounded-xl border border-slate-200 bg-white p-4'>
        <h4 className='text-sm font-semibold text-slate-800'>Dialysis Clinic Packet - Nephrologist Owned</h4>
        {nephDocs.length === 0 ? (
          <p className="text-sm text-slate-500">No nephrologist documents tracked.</p>
        ) : (
          nephDocs.map((document) => (
            <DocumentRow
              key={document.id}
              document={document}
              onValidate={() => onValidateDocument(document.id, 'validated')}
              onReject={() => onValidateDocument(document.id, 'rejected')}
              onRequest={
                document.status === 'required'
                  ? () => {
                      setRequestTarget(document);
                      setRequestModalOpen(true);
                    }
                  : undefined
              }
            />
          ))
        )}
      </section>

      {/* Shared/Either Documents */}
      {sharedDocs.length > 0 && (
        <section className='space-y-2 rounded-xl border border-slate-200 bg-white p-4'>
          <h4 className='text-sm font-semibold text-slate-800'>Shared / Either Role</h4>
          {sharedDocs.map((document) => (
            <DocumentRow
              key={document.id}
              document={document}
              onValidate={() => onValidateDocument(document.id, 'validated')}
              onReject={() => onValidateDocument(document.id, 'rejected')}
              onRequest={
                document.status === 'required'
                  ? () => {
                      setRequestTarget(document);
                      setRequestModalOpen(true);
                    }
                  : undefined
              }
            />
          ))}
        </section>
      )}

      {/* Externally Retrieved */}
      <section className='space-y-2 rounded-xl border border-slate-200 bg-white p-4'>
        <h4 className='text-sm font-semibold text-slate-800'>Externally Retrieved (EXTERNAL STEP)</h4>
        {externalDocs.length === 0 ? (
          <p className="text-sm text-slate-500">No external records retrieved yet.</p>
        ) : (
          externalDocs.map((document) => (
            <DocumentRow
              key={document.id}
              document={document}
              onValidate={() => onValidateDocument(document.id, 'validated')}
              onRequest={
                document.status === 'required'
                  ? () => {
                      setRequestTarget(document);
                      setRequestModalOpen(true);
                    }
                  : undefined
              }
            />
          ))
        )}
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => {
            setRequestTarget(null);
            setRequestModalOpen(true);
          }}
        >
          + Request External Records
        </Button>
      </section>

      {/* Summary */}
      <div className='rounded-xl border border-slate-200 bg-white p-4'>
        <div className="flex flex-wrap gap-4 text-sm">
          <div>
            <span className="text-slate-600">Documents:</span>{' '}
            <span className="font-semibold">{receivedTotal} of {requiredTotal} received</span>
          </div>
          <div>
            <span className="text-slate-600">Hard-blocks:</span>{' '}
            <span className={`font-semibold ${hardBlocksCleared ? 'text-emerald-700' : 'text-red-700'}`}>
              {hardBlocksCleared ? '✓ All cleared' : `${hardBlocksMissing.length} pending`}
            </span>
          </div>
        </div>
      </div>

      <RequestRecordsModal
        open={requestModalOpen}
        onOpenChange={setRequestModalOpen}
        defaultDocumentName={requestTarget?.name}
        onSubmit={({ documentName, notes, isExternal }) => {
          onCreateTask({
            title: isExternal ? `EXTERNAL STEP: Retrieve ${documentName}` : `Request from clinic: ${documentName}`,
            type: isExternal ? 'log-external-step' : 'request-records',
            assignedToRole: isExternal ? 'front-desk' : 'ptc',
            dueDate: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString(),
            description: notes,
            isExternalStep: isExternal,
            externalSystem: isExternal ? 'Phone/Fax' : undefined
          });
        }}
      />
    </div>
  );
}
```

#### Modify: `components/shared/DocumentRow.tsx`

Enhance to show hard-block indicator:

```tsx
'use client';

import { Document } from '@/types';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, Clock, FileX, File, AlertOctagon } from 'lucide-react';

interface DocumentRowProps {
  document: Document;
  onValidate?: () => void;
  onReject?: () => void;
  onRequest?: () => void;
}

const statusConfig = {
  required: { icon: Clock, color: 'text-slate-400', bg: 'bg-slate-100', label: 'Not Received' },
  received: { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Received' },
  'needs-review': { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-100', label: 'Needs Review' },
  validated: { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100', label: 'Validated' },
  rejected: { icon: FileX, color: 'text-red-600', bg: 'bg-red-100', label: 'Rejected' },
  expired: { icon: AlertOctagon, color: 'text-orange-600', bg: 'bg-orange-100', label: 'Expired' }
};

const ownershipLabels = {
  dusw: 'DUSW',
  nephrologist: 'Nephrologist',
  shared: 'Shared',
  patient: 'Patient'
};

export function DocumentRow({ document, onValidate, onReject, onRequest }: DocumentRowProps) {
  const config = statusConfig[document.status];
  const Icon = config.icon;

  return (
    <div className={`flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3 ${document.isHardBlock && document.status !== 'validated' ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'}`}>
      <div className="flex items-center gap-3">
        <File className="h-5 w-5 text-slate-400" />
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-slate-900">{document.name}</p>
            {document.isHardBlock && (
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                HARD-BLOCK
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">
            {ownershipLabels[document.ownership]} • {document.source === 'external-retrieval' ? 'External' : document.source}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${config.bg} ${config.color}`}>
          <Icon className="h-3 w-3" />
          {config.label}
        </span>

        {(document.status === 'received' || document.status === 'needs-review') && onValidate && (
          <>
            <Button size="sm" variant="secondary" onClick={onValidate}>
              Validate
            </Button>
            {onReject && (
              <Button size="sm" variant="ghost" onClick={onReject}>
                Reject
              </Button>
            )}
          </>
        )}

        {document.status === 'required' && onRequest && (
          <Button size="sm" variant="secondary" onClick={onRequest}>
            Request
          </Button>
        )}

        {document.status === 'validated' && document.reviewedAt && (
          <span className="text-xs text-slate-500">
            {new Date(document.reviewedAt).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
}
```

---

### Fix 1.3: Auto-Create Decision on 3x No Response

**Problem:** When contact attempts reach 3, no decision is auto-created for Senior Coordinator.

#### Modify: `lib/context/CaseContext.tsx`

Update the `sendMessage` function. Find the section that handles `markAsContactAttempt` and replace it:

```typescript
if (input.markAsContactAttempt) {
  currentCase.contactAttempts += 1;
  currentCase.lastContactAttempt = nowIso();
  
  // Update flags based on attempt count
  const attemptFlags = ['No Response x1', 'No Response x2', 'No Response x3'];
  // Remove old attempt flags
  currentCase.flags = currentCase.flags.filter(f => !attemptFlags.includes(f));
  
  // Add current attempt flag
  if (currentCase.contactAttempts === 1) {
    currentCase.flags.push('No Response x1');
  } else if (currentCase.contactAttempts === 2) {
    currentCase.flags.push('No Response x2');
  } else if (currentCase.contactAttempts >= 3) {
    currentCase.flags.push('No Response x3');
    
    // AUTO-CREATE DECISION FOR SENIOR COORDINATOR
    const existingDecision = next.decisions.find(
      d => d.caseId === currentCase.id && d.type === 'no-response-3x' && d.status === 'pending'
    );
    
    if (!existingDecision) {
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
        description: 'Patient has not responded after 3 documented contact attempts. Senior Coordinator must decide whether to continue outreach or end the referral.',
        assignedToRole: 'senior-coordinator',
        status: 'pending',
        priority: 'urgent',
        dueDate: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
        slaStatus: 'at-risk',
        isExternalStep: false,
        createdAt: nowIso()
      });
      
      withAudit(next, currentCase.id, 'NO_RESPONSE_3X_ESCALATION', 
        'Patient unresponsive after 3 contact attempts. Decision escalated to Senior Coordinator.', 
        { attempts: currentCase.contactAttempts }
      );
    }
  }
}
```

Also update the `logExternalStep` function similarly:

```typescript
if (input.markAsContactAttempt) {
  currentCase.contactAttempts += 1;
  currentCase.lastContactAttempt = nowIso();
  
  // Same logic as above for flags and auto-decision
  const attemptFlags = ['No Response x1', 'No Response x2', 'No Response x3'];
  currentCase.flags = currentCase.flags.filter(f => !attemptFlags.includes(f));
  
  if (currentCase.contactAttempts === 1) {
    currentCase.flags.push('No Response x1');
  } else if (currentCase.contactAttempts === 2) {
    currentCase.flags.push('No Response x2');
  } else if (currentCase.contactAttempts >= 3) {
    currentCase.flags.push('No Response x3');
    
    const existingDecision = next.decisions.find(
      d => d.caseId === currentCase.id && d.type === 'no-response-3x' && d.status === 'pending'
    );
    
    if (!existingDecision) {
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
        description: 'Patient has not responded after 3 documented contact attempts.',
        assignedToRole: 'senior-coordinator',
        status: 'pending',
        priority: 'urgent',
        dueDate: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
        slaStatus: 'at-risk',
        isExternalStep: false,
        createdAt: nowIso()
      });
      
      withAudit(next, currentCase.id, 'NO_RESPONSE_3X_ESCALATION', 
        'Patient unresponsive after 3 contact attempts. Decision escalated to Senior Coordinator.', 
        { attempts: currentCase.contactAttempts }
      );
    }
  }
}
```

---

### Fix 1.4: Enhance Senior Coordinator DecisionPanel with Case Context

**Problem:** DecisionPanel only shows decision options, not the case context needed to make informed decisions.

#### Modify: `components/dashboard/DecisionPanel.tsx`

Replace the entire file:

```tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Decision, Case, Document } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  AlertTriangle, 
  FileText, 
  User, 
  Calendar, 
  Clock, 
  Flag, 
  ExternalLink,
  CheckCircle,
  XCircle,
  AlertOctagon
} from 'lucide-react';

interface DecisionPanelProps {
  decision?: Decision;
  currentCase?: Case;
  documents?: Document[];
  onSubmit: (option: string, rationale: string) => void;
}

export function DecisionPanel({ decision, currentCase, documents, onSubmit }: DecisionPanelProps) {
  const [selected, setSelected] = useState('');
  const [rationale, setRationale] = useState('');

  if (!decision) {
    return (
      <div className='rounded-xl border border-slate-200 bg-white p-6 text-center'>
        <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
        <p className='text-sm text-slate-500'>Select a decision from the queue to review.</p>
      </div>
    );
  }

  const caseDocuments = documents?.filter(d => d.caseId === decision.caseId) || [];
  const missingDocs = caseDocuments.filter(d => d.status === 'required');
  const pendingDocs = caseDocuments.filter(d => d.status === 'received' || d.status === 'needs-review');
  const hardBlockMissing = caseDocuments.filter(d => d.isHardBlock && d.status !== 'validated');

  const handleSubmit = () => {
    if (!selected || !rationale.trim()) return;
    onSubmit(selected, rationale);
    setSelected('');
    setRationale('');
  };

  return (
    <div className='rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden'>
      {/* Case Header */}
      {currentCase && (
        <div className="bg-slate-50 p-4 border-b border-slate-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xl font-bold text-slate-900">
                {currentCase.patient.lastName}, {currentCase.patient.firstName}
              </p>
              <p className="text-sm text-slate-600 mt-1">
                Case: {currentCase.caseNumber} • DOB: {currentCase.patient.dateOfBirth}
              </p>
              <p className="text-sm text-slate-600">
                Clinic: {currentCase.referringClinic}
              </p>
            </div>
            <Link href={`/cases/${currentCase.id}`}>
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-1" />
                Full Case
              </Button>
            </Link>
          </div>
          
          {/* Quick Stats */}
          <div className="flex flex-wrap gap-4 mt-3 text-sm">
            <div className="flex items-center gap-1 text-slate-600">
              <Clock className="h-4 w-4" />
              <span>Stage: <strong>{currentCase.stage.replace(/-/g, ' ')}</strong></span>
            </div>
            <div className="flex items-center gap-1 text-slate-600">
              <Calendar className="h-4 w-4" />
              <span><strong>{currentCase.daysInStage}</strong> days in stage</span>
            </div>
            {currentCase.assignedPTC && (
              <div className="flex items-center gap-1 text-slate-600">
                <User className="h-4 w-4" />
                <span>PTC: <strong>{currentCase.assignedPTC.name}</strong></span>
              </div>
            )}
          </div>
          
          {/* Flags */}
          {currentCase.flags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {currentCase.flags.map(flag => (
                <span 
                  key={flag} 
                  className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800"
                >
                  <Flag className="h-3 w-3" />
                  {flag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="p-4 space-y-4">
        {/* Decision Title & Type */}
        <div>
          <p className='text-lg font-semibold text-slate-900'>{decision.title}</p>
          <p className='text-xs text-slate-500 uppercase tracking-wide mt-1'>
            Decision Type: {decision.type.replace(/-/g, ' ')}
          </p>
        </div>

        {/* Hard-block Warning */}
        {hardBlockMissing.length > 0 && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="flex items-center gap-2 text-sm font-semibold text-red-800">
              <AlertOctagon className="h-4 w-4" />
              Hard-Block Documents Missing:
            </p>
            <ul className="mt-1 list-disc pl-5 text-sm text-red-700">
              {hardBlockMissing.map(d => <li key={d.id}>{d.name}</li>)}
            </ul>
          </div>
        )}

        {/* Missing/Pending Documents (for relevant decision types) */}
        {(decision.type === 'partial-packet' || decision.type === 'hard-block-override') && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-sm font-semibold text-slate-700 mb-2">Document Status:</p>
            
            {missingDocs.length > 0 && (
              <div className="mb-2">
                <p className="flex items-center gap-1 text-xs font-medium text-red-600">
                  <XCircle className="h-3 w-3" /> Not Received ({missingDocs.length}):
                </p>
                <ul className="list-disc pl-5 text-xs text-slate-600">
                  {missingDocs.slice(0, 5).map(d => (
                    <li key={d.id}>
                      {d.name}
                      {d.isHardBlock && <span className="text-red-600 font-semibold"> (HARD-BLOCK)</span>}
                    </li>
                  ))}
                  {missingDocs.length > 5 && <li>+{missingDocs.length - 5} more...</li>}
                </ul>
              </div>
            )}
            
            {pendingDocs.length > 0 && (
              <div>
                <p className="flex items-center gap-1 text-xs font-medium text-amber-600">
                  <Clock className="h-3 w-3" /> Pending Review ({pendingDocs.length}):
                </p>
                <ul className="list-disc pl-5 text-xs text-slate-600">
                  {pendingDocs.slice(0, 3).map(d => <li key={d.id}>{d.name}</li>)}
                  {pendingDocs.length > 3 && <li>+{pendingDocs.length - 3} more...</li>}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Contact Attempts Info (for no-response decisions) */}
        {decision.type === 'no-response-3x' && currentCase && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
            <p className="flex items-center gap-2 text-sm font-semibold text-amber-800">
              <AlertTriangle className="h-4 w-4" />
              Contact Attempts: {currentCase.contactAttempts}
            </p>
            {currentCase.lastContactAttempt && (
              <p className="text-xs text-amber-700 mt-1">
                Last attempt: {new Date(currentCase.lastContactAttempt).toLocaleString()}
              </p>
            )}
            <p className="text-xs text-amber-600 mt-2">
              Patient has not responded to {currentCase.contactAttempts} documented outreach attempts.
            </p>
          </div>
        )}

        {/* Decision Options */}
        <div className='space-y-2'>
          <p className="text-sm font-semibold text-slate-700">Your Decision:</p>
          {decision.options.map((option) => (
            <label 
              key={option} 
              className={`flex items-start gap-3 rounded-lg border-2 p-3 cursor-pointer transition-all ${
                selected === option 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <input
                type='radio'
                checked={selected === option}
                onChange={() => setSelected(option)}
                className='mt-0.5 h-4 w-4'
              />
              <span className="text-sm text-slate-900">{option}</span>
            </label>
          ))}
        </div>

        {/* Rationale Field */}
        <div>
          <p className='mb-1 text-sm font-semibold text-slate-700'>
            Rationale <span className="text-red-500">*</span>
          </p>
          <Textarea 
            value={rationale} 
            onChange={(event) => setRationale(event.target.value)} 
            placeholder="Document your reasoning for this decision..."
            className="min-h-[100px]"
          />
          <p className="text-xs text-slate-500 mt-1">
            Required: This rationale will be permanently recorded in the audit trail.
          </p>
        </div>

        {/* Submit Button */}
        <Button
          className='w-full'
          disabled={!selected || !rationale.trim()}
          onClick={handleSubmit}
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Submit Decision
        </Button>
      </div>
    </div>
  );
}
```

#### Modify: `app/dashboard/senior/page.tsx`

Update to pass case and documents to DecisionPanel:

```tsx
// In the return statement, update the DecisionPanel usage:
<DecisionPanel
  decision={selectedDecision}
  currentCase={selectedCase}
  documents={documents}  // Add this - get documents from useCases()
  onSubmit={(option, rationale) => {
    if (!selectedDecision) return;
    recordDecision(selectedDecision.id, option, rationale);
    notify('Decision recorded');
  }}
/>
```

Also add `documents` to the destructured values from `useCases()`:
```tsx
const { decisions, cases, documents, recordDecision, assignPTC } = useCases();
```

---

### Fix 1.5: Fix I/E Confirm Review Flag Update

**Problem:** Completing the confirm-ie-review task doesn't update `ieConfirmReviewComplete` on the case.

#### Modify: `lib/context/CaseContext.tsx`

In the `completeTask` function, add handling for `confirm-ie-review`:

```typescript
// After the existing checks (confirm-surginet, scheduling-huddle), add:
if (targetTask.type === 'confirm-ie-review') {
  currentCase.ieConfirmReviewComplete = true;
  currentCase.updatedAt = nowIso();
  // Remove any related flag
  currentCase.flags = currentCase.flags.filter(f => f !== 'I/E Review Pending');
  withAudit(next, currentCase.id, 'IE_REVIEW_CONFIRMED', 'Front Desk confirmed Inclusion/Exclusion responses are acceptable.');
}
```

---

### Fix 1.6: Create Decision Records on Specialist Escalation

**Problem:** When specialists escalate concerns, no Decision record is created for Senior Coordinator.

#### Modify: `app/dashboard/specialist/[type]/page.tsx`

Update the onSubmit handler for SpecialistReviewModal. Replace the existing handler:

```tsx
onSubmit={({ outcome, notes }) => {
  const currentCase = cases.find((item) => item.id === selectedTask.caseId);
  if (!currentCase) return;

  if (outcome === 'needs-clarification') {
    // Mark task as in-progress (awaiting clarification)
    // Create follow-up task
    createTask({
      caseId: currentCase.id,
      title: `${specialist.title.replace(' Dashboard', '')} Clarification Follow-up`,
      type: 'send-message',
      assignedToRole: 'ptc',
      dueDate: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      description: notes,
      isExternalStep: false
    });
    sendMessage({
      caseId: currentCase.id,
      toRecipients: [{ type: 'patient', name: `${currentCase.patient.firstName} ${currentCase.patient.lastName}` }],
      body: notes || 'Please provide clarification requested during specialist review.',
      markAsContactAttempt: true,
      channel: 'in-app'
    });
    notify('Clarification request sent');
  } else if (outcome === 'clear') {
    completeTask(selectedTask.id, `Cleared - ${notes || 'No concerns identified.'}`);
    notify('Review completed - Cleared');
  } else if (outcome === 'escalate') {
    // Complete the specialist task with escalation note
    completeTask(selectedTask.id, `ESCALATED to Senior Coordinator - ${notes}`);
    
    // Create escalation task for Senior Coordinator
    createTask({
      caseId: currentCase.id,
      title: `${specialist.title.replace(' Dashboard', '')} Escalation Review`,
      type: 'screening-override',
      assignedToRole: 'senior-coordinator',
      dueDate: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      description: `${specialist.title.replace(' Dashboard', '')} raised concern: ${notes}`,
      isExternalStep: false,
      priority: 'urgent'
    });
    
    // Add flag to case
    if (!currentCase.flags.includes('Specialist Concern')) {
      // We need to update the case - this requires adding a function to context
      // For now, we'll create a decision record
    }
    
    // Create Decision record for Senior Coordinator
    // Note: This requires adding createDecision to CaseContext
    notify('Escalation sent to Senior Coordinator');
  }
  
  setSelectedTask(null);
}}
```

#### Add to CaseContext.tsx - createDecision function:

```typescript
// Add to interface:
createDecision: (input: {
  caseId: string;
  type: Decision['type'];
  title: string;
  options: string[];
}) => void;

// Add implementation:
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

// Add to value object
createDecision,
```

Then update the specialist escalation to use it:

```tsx
// In specialist dashboard, after creating the task:
createDecision({
  caseId: currentCase.id,
  type: 'specialist-conflict',
  title: `${specialist.title.replace(' Dashboard', '')} Concern - Review Required`,
  options: ['Proceed despite concern', 'Request additional information', 'End referral']
});
```

---

## 2. IMPORTANT WORKFLOW FIXES

### Fix 2.1: Financial "Needs Clarification" Flag

#### Modify: `app/dashboard/financial/page.tsx`

When "Needs Info" is clicked, add flag to case. Update the SendMessageModal onSend:

```tsx
// Add updateCaseFlags to the context (see below), then:
onSend={({ recipients, body, markAsContactAttempt }) => {
  sendMessage({
    caseId: messageCase.id,
    toRecipients: recipients,
    body,
    markAsContactAttempt,
    channel: 'in-app'
  });
  // Add "Needs Clarification" flag
  addCaseFlag(messageCase.id, 'Needs Clarification');
  notify('Clarification request sent');
}}
```

#### Add to CaseContext.tsx:

```typescript
// Add to interface:
addCaseFlag: (caseId: string, flag: string) => void;
removeCaseFlag: (caseId: string, flag: string) => void;

// Add implementations:
const addCaseFlag = (caseId: string, flag: string) => {
  setData((current) => {
    const next = structuredClone(current);
    const currentCase = next.cases.find((item) => item.id === caseId);
    if (!currentCase) return current;
    if (!currentCase.flags.includes(flag)) {
      currentCase.flags.push(flag);
      currentCase.updatedAt = nowIso();
    }
    return next;
  });
};

const removeCaseFlag = (caseId: string, flag: string) => {
  setData((current) => {
    const next = structuredClone(current);
    const currentCase = next.cases.find((item) => item.id === caseId);
    if (!currentCase) return current;
    currentCase.flags = currentCase.flags.filter(f => f !== flag);
    currentCase.updatedAt = nowIso();
    return next;
  });
};

// Add to value object
addCaseFlag,
removeCaseFlag,
```

---

### Fix 2.2: Education Stage TODO Tracking

#### Add to types/index.ts:

```typescript
// Add to Case interface:
educationProgress?: {
  videoWatched: boolean;
  videoWatchedAt?: string;
  confirmationFormComplete: boolean;
  confirmationFormAt?: string;
  healthcareGuidanceReviewed: boolean;
  healthcareGuidanceAt?: string;
};
```

#### Modify: `components/case-cockpit/SchedulingTab.tsx`

Update State 1 (pre-scheduling) to show actual education status:

```tsx
{effectiveState === 'pre-scheduling' && (
  <section className='rounded-xl border border-slate-200 bg-white p-4'>
    <h3 className='mb-2 text-sm font-semibold text-slate-900'>Scheduling</h3>
    <p className='text-sm text-slate-700 mb-3'>Education must be completed before scheduling can begin.</p>
    
    <div className="space-y-2">
      <div className={`flex items-center gap-2 p-2 rounded-lg ${currentCase.educationProgress?.videoWatched ? 'bg-emerald-50' : 'bg-slate-50'}`}>
        {currentCase.educationProgress?.videoWatched ? (
          <CheckCircle className="h-5 w-5 text-emerald-600" />
        ) : (
          <Clock className="h-5 w-5 text-slate-400" />
        )}
        <span className="text-sm">Watch Transplant Education Video (~80 min)</span>
      </div>
      
      <div className={`flex items-center gap-2 p-2 rounded-lg ${currentCase.educationProgress?.confirmationFormComplete ? 'bg-emerald-50' : 'bg-slate-50'}`}>
        {currentCase.educationProgress?.confirmationFormComplete ? (
          <CheckCircle className="h-5 w-5 text-emerald-600" />
        ) : (
          <Clock className="h-5 w-5 text-slate-400" />
        )}
        <span className="text-sm">Complete Education Confirmation Form</span>
      </div>
      
      <div className={`flex items-center gap-2 p-2 rounded-lg ${currentCase.educationProgress?.healthcareGuidanceReviewed ? 'bg-emerald-50' : 'bg-slate-50'}`}>
        {currentCase.educationProgress?.healthcareGuidanceReviewed ? (
          <CheckCircle className="h-5 w-5 text-emerald-600" />
        ) : (
          <Clock className="h-5 w-5 text-slate-400" />
        )}
        <span className="text-sm">Review Age-Appropriate Healthcare Guidance</span>
      </div>
    </div>
    
    {/* Demo helper buttons */}
    <div className="mt-4 pt-4 border-t border-slate-200">
      <p className="text-xs text-slate-500 mb-2">Demo: Simulate patient completing education</p>
      <Button 
        size="sm" 
        variant="outline"
        onClick={() => {
          // This would need a function in CaseContext to update educationProgress
          onSimulateEducationComplete?.();
        }}
      >
        Mark All Education Complete
      </Button>
    </div>
  </section>
)}
```

---

### Fix 2.3: Care Partner Consent Check in Messaging

#### Modify: `components/modals/SendMessageModal.tsx`

Add consent checking:

```tsx
// At the top of the component, calculate consent status:
const canMessageCarePartner = currentCase.carePartner && currentCase.consent.carePartnerConsent;
const carePartnerLabel = currentCase.carePartner 
  ? `${currentCase.carePartner.name} (Care Partner)${!canMessageCarePartner ? ' - No consent' : ''}`
  : null;

// In the checkbox for care partner:
{currentCase.carePartner && (
  <div className="flex items-center space-x-2">
    <Checkbox 
      id="care-partner"
      checked={selectedRecipients.includes('care-partner')}
      onCheckedChange={(checked) => {
        if (checked) {
          setSelectedRecipients([...selectedRecipients, 'care-partner']);
        } else {
          setSelectedRecipients(selectedRecipients.filter(r => r !== 'care-partner'));
        }
      }}
      disabled={!canMessageCarePartner}
    />
    <label 
      htmlFor="care-partner" 
      className={`text-sm ${!canMessageCarePartner ? 'text-slate-400' : ''}`}
    >
      {carePartnerLabel}
      {!canMessageCarePartner && (
        <span className="text-xs text-amber-600 ml-2">(Patient has not consented)</span>
      )}
    </label>
  </div>
)}
```

---

### Fix 2.4: Show Attempt Number in Contact Logging

#### Modify: `components/modals/LogExternalStepModal.tsx`

Add attempt number display:

```tsx
// Add currentCase prop to the modal:
interface LogExternalStepModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentCase?: Case;  // ADD THIS
  onSubmit: (data: { title: string; externalSystem: string; notes: string; markAsContactAttempt: boolean }) => void;
}

// In the checkbox section:
<div className="flex items-center space-x-2">
  <Checkbox 
    id="contact-attempt"
    checked={markAsContactAttempt}
    onCheckedChange={(checked) => setMarkAsContactAttempt(checked as boolean)}
  />
  <label htmlFor="contact-attempt" className="text-sm">
    Mark as contact attempt
    {currentCase && markAsContactAttempt && (
      <span className="text-amber-600 font-medium ml-2">
        (This will be attempt #{currentCase.contactAttempts + 1})
      </span>
    )}
  </label>
</div>

{currentCase && currentCase.contactAttempts >= 2 && markAsContactAttempt && (
  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 mt-2">
    <p className="text-sm text-amber-800">
      <strong>Warning:</strong> This will be attempt #{currentCase.contactAttempts + 1}. 
      {currentCase.contactAttempts + 1 >= 3 && ' This will trigger an automatic decision escalation to Senior Coordinator.'}
    </p>
  </div>
)}
```

---

### Fix 2.5: View End Letter After Creation

#### Modify: `components/case-cockpit/EndReferralTab.tsx`

Add letter viewing capability for ended cases:

```tsx
// In the "ended" state section, update the "View End Letter" button:
<Button 
  variant='secondary'
  onClick={() => {
    // Find the end-referral decision
    const endDecision = decisions?.find(d => d.caseId === currentCase.id && d.type === 'end-referral' && d.letterDraft);
    if (endDecision?.letterDraft) {
      setViewingLetter(endDecision.letterDraft);
      setLetterModalOpen(true);
    } else {
      // Generate from stored reason
      const letter = buildEndLetter(currentCase.endReason || '', currentCase.patient.lastName);
      setViewingLetter(letter);
      setLetterModalOpen(true);
    }
  }}
>
  View End Letter
</Button>

// Add state and modal:
const [letterModalOpen, setLetterModalOpen] = useState(false);
const [viewingLetter, setViewingLetter] = useState('');

// Add Dialog at the end:
<Dialog open={letterModalOpen} onOpenChange={setLetterModalOpen}>
  <DialogContent className="max-w-2xl">
    <DialogHeader>
      <DialogTitle>End Referral Letter</DialogTitle>
    </DialogHeader>
    <div className="bg-slate-50 rounded-lg p-4 font-mono text-sm whitespace-pre-wrap max-h-[60vh] overflow-auto">
      {viewingLetter}
    </div>
    <div className="flex justify-end gap-2">
      <Button variant="secondary" onClick={() => setLetterModalOpen(false)}>Close</Button>
      <Button onClick={() => {
        navigator.clipboard.writeText(viewingLetter);
        // Show toast
      }}>Copy to Clipboard</Button>
    </div>
  </DialogContent>
</Dialog>
```

---

### Fix 2.6: Re-Referral Prerequisites Check

#### Modify: `lib/context/CaseContext.tsx`

Update the `startReReferral` function to check prerequisites:

```typescript
const startReReferral = (originalCaseId: string) => {
  if (!actor) return;

  setData((current) => {
    const next = structuredClone(current);
    const original = next.cases.find((item) => item.id === originalCaseId);
    if (!original) return current;

    // Check document ages
    const originalDocs = next.documents.filter(d => d.caseId === originalCaseId);
    const documentCatalog = require('@/lib/data/documentCatalog').documentCatalog;
    
    const expiredDocs: string[] = [];
    const reusableDocs: string[] = [];
    
    originalDocs.forEach(doc => {
      if (doc.status !== 'validated') return;
      
      const catalogItem = documentCatalog.find((c: any) => c.type === doc.type);
      if (!catalogItem?.maxAgeDays || !doc.uploadedAt) {
        reusableDocs.push(doc.name);
        return;
      }
      
      const ageInDays = (Date.now() - new Date(doc.uploadedAt).getTime()) / (1000 * 60 * 60 * 24);
      if (ageInDays > catalogItem.maxAgeDays) {
        expiredDocs.push(doc.name);
      } else {
        reusableDocs.push(doc.name);
      }
    });

    // Build re-referral requirements based on original end reason
    const endReason = endReasons.find(r => r.code === original.endReason);
    const returnRequirements = endReason?.reReferralRequirements || ['Contact transplant center'];

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
      schedulingDecision: undefined,
      schedulingWindows: undefined,
      schedulingState: undefined,
      appointmentConfirmed: false,
      appointmentDate: undefined,
      assignedPTC: undefined,
      ptcAssignedAt: undefined
    };

    next.cases.unshift(linkedCase);
    original.linkedToCaseId = linkedCaseId;

    // Create re-referral review task
    next.tasks.unshift({
      id: buildId('task'),
      caseId: linkedCaseId,
      type: 're-referral-review',
      title: 'Re-Referral Eligibility Review',
      description: `Prior end reason: ${endReason?.label || original.endReason}.\n\nReturn requirements:\n${returnRequirements.map(r => '• ' + r).join('\n')}\n\nExpired documents (need re-collection): ${expiredDocs.join(', ') || 'None'}\nReusable documents: ${reusableDocs.join(', ') || 'None'}`,
      assignedToRole: 'senior-coordinator',
      status: 'pending',
      priority: 'high',
      dueDate: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString(),
      slaStatus: 'on-track',
      isExternalStep: false,
      createdAt: nowIso()
    });

    next.decisions.unshift({
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
    });

    withAudit(next, original.id, 'RE_REFERRAL_STARTED', `Re-referral case created: ${linkedCase.caseNumber}`, {
      linkedCaseId,
      expiredDocs,
      reusableDocs,
      returnRequirements
    });

    return next;
  });
};
```

---

### Fix 2.7: Update RequestRecordsModal for External vs Clinic

#### Modify: `components/modals/RequestRecordsModal.tsx`

```tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface RequestRecordsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDocumentName?: string;
  onSubmit: (data: { documentName: string; notes: string; isExternal: boolean; assignTo: 'clinic' | 'front-desk' }) => void;
}

export function RequestRecordsModal({ open, onOpenChange, defaultDocumentName, onSubmit }: RequestRecordsModalProps) {
  const [documentName, setDocumentName] = useState(defaultDocumentName || '');
  const [notes, setNotes] = useState('');
  const [requestType, setRequestType] = useState<'clinic' | 'external'>('clinic');

  const handleSubmit = () => {
    if (!documentName.trim()) return;
    onSubmit({
      documentName,
      notes,
      isExternal: requestType === 'external',
      assignTo: requestType === 'external' ? 'front-desk' : 'clinic'
    });
    setDocumentName('');
    setNotes('');
    setRequestType('clinic');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request Records</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Document Name</Label>
            <Input 
              value={documentName} 
              onChange={(e) => setDocumentName(e.target.value)}
              placeholder="e.g., Hepatitis Panel, PCP Records"
            />
          </div>

          <div>
            <Label className="mb-2 block">Request Type</Label>
            <RadioGroup value={requestType} onValueChange={(v) => setRequestType(v as 'clinic' | 'external')}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="clinic" id="clinic" />
                <label htmlFor="clinic" className="text-sm">
                  Request from Dialysis Clinic (routes to Clinic Portal)
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="external" id="external" />
                <label htmlFor="external" className="text-sm">
                  External Retrieval - EXTERNAL STEP (routes to Front Desk)
                </label>
              </div>
            </RadioGroup>
          </div>

          {requestType === 'external' && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
              <p className="text-sm text-amber-800">
                This will create an EXTERNAL STEP task for Front Desk to retrieve records via phone, fax, or other external methods.
              </p>
            </div>
          )}

          <div>
            <Label>Notes / Instructions</Label>
            <Textarea 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any specific instructions for retrieval..."
            />
          </div>

          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleSubmit} disabled={!documentName.trim()}>
              Create Request
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

---

### Fix 2.8: Specialist Conflict Detection

#### Add to CaseContext.tsx:

In the `completeTask` function, after completing a specialist-review task, check for conflicts:

```typescript
if (targetTask.type === 'specialist-review') {
  // Check if all specialist reviews for this case are complete
  const specialistTasks = next.tasks.filter(
    t => t.caseId === currentCase.id && t.type === 'specialist-review'
  );
  const completedSpecialistTasks = specialistTasks.filter(t => t.status === 'completed');
  
  if (completedSpecialistTasks.length === specialistTasks.length && specialistTasks.length >= 3) {
    // Check for conflicts (any escalation notes)
    const hasEscalation = completedSpecialistTasks.some(
      t => t.completionNotes?.toLowerCase().includes('escalat')
    );
    
    if (hasEscalation) {
      // Create specialist conflict decision
      const existingConflict = next.decisions.find(
        d => d.caseId === currentCase.id && d.type === 'specialist-conflict' && d.status === 'pending'
      );
      
      if (!existingConflict) {
        currentCase.flags.push('Specialist Conflict');
        
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
        
        withAudit(next, currentCase.id, 'SPECIALIST_CONFLICT_DETECTED', 
          'Conflicting specialist outcomes require Senior Coordinator review.');
      }
    }
  }
}
```

---

## 3. UI/UX ENHANCEMENTS

### Fix 3.1: Add Reset Demo Button to Header

#### Modify: `components/layout/Header.tsx`

```tsx
'use client';

import { Bell, RefreshCw, User, LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCases } from '@/lib/context/CaseContext';
import { useAuth } from '@/lib/context/AuthContext';
import { useNotification } from '@/lib/context/NotificationContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Header() {
  const { resetDemoData } = useCases();
  const { currentUser, logout } = useAuth();
  const { notify } = useNotification();

  const unreadCount = 4; // Mock

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      {/* Search */}
      <div className="flex items-center gap-4">
        <input 
          type="search"
          placeholder="Search cases, patients..."
          className="w-64 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Reset Demo Button */}
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => {
            if (confirm('Reset all demo data to initial state? This cannot be undone.')) {
              resetDemoData();
              notify('Demo data reset successfully');
              window.location.reload();
            }
          }}
          className="text-amber-600 border-amber-300 hover:bg-amber-50"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Reset Demo
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
              {unreadCount}
            </span>
          )}
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                <User className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium">{currentUser?.name || 'User'}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-red-600">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
```

---

### Fix 3.2: Improve Login Page Styling

#### Modify: `app/login/page.tsx`

Make it more visually appealing:

```tsx
'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { UserRole } from '@/types';
import { 
  User, 
  Stethoscope, 
  ClipboardList, 
  DollarSign, 
  Apple, 
  Users,
  Activity,
  Shield
} from 'lucide-react';

const roles: { role: UserRole; label: string; description: string; icon: React.ElementType; color: string }[] = [
  { role: 'front-desk', label: 'Front Desk / Navigator', description: 'Intake, document validation, scheduling', icon: ClipboardList, color: 'bg-blue-500' },
  { role: 'ptc', label: 'Pre-Transplant Coordinator', description: 'Case management, patient follow-up', icon: User, color: 'bg-purple-500' },
  { role: 'senior-coordinator', label: 'Senior Coordinator', description: 'Decisions, oversight, configuration', icon: Shield, color: 'bg-indigo-500' },
  { role: 'financial', label: 'Financial Coordinator', description: 'Insurance verification, financial screening', icon: DollarSign, color: 'bg-green-500' },
  { role: 'dietitian', label: 'Dietitian', description: 'Nutrition review and assessment', icon: Apple, color: 'bg-orange-500' },
  { role: 'social-work', label: 'Social Worker', description: 'Psychosocial assessment and support', icon: Users, color: 'bg-pink-500' },
  { role: 'nephrology', label: 'Nephrology', description: 'Medical review and recommendations', icon: Stethoscope, color: 'bg-red-500' },
];

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const handleRoleSelect = (role: UserRole) => {
    login(role);
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 mb-4">
            <Activity className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">TransplantFlow</h1>
          <p className="text-slate-600 mt-2">Kidney Transplant Referral Management</p>
        </div>

        {/* Role Selection Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
          <div className="text-center mb-6">
            <h2 className="text-lg font-semibold text-slate-900">Select Your Role</h2>
            <p className="text-sm text-slate-500 mt-1">Choose a role to explore the portal</p>
          </div>

          <div className="grid gap-3">
            {roles.map(({ role, label, description, icon: Icon, color }) => (
              <button
                key={role}
                onClick={() => handleRoleSelect(role)}
                className="flex items-center gap-4 p-4 rounded-xl border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-left group"
              >
                <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${color} text-white group-hover:scale-110 transition-transform`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">{label}</p>
                  <p className="text-sm text-slate-500">{description}</p>
                </div>
                <div className="text-slate-400 group-hover:text-blue-500 transition-colors">
                  →
                </div>
              </button>
            ))}
          </div>

          {/* Demo Mode Badge */}
          <div className="mt-6 pt-6 border-t border-slate-200 text-center">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              Demo Mode - ChristianaCare Prototype
            </span>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-slate-400 mt-6">
          Built for ChristianaCare Kidney Transplant Program
        </p>
      </div>
    </div>
  );
}
```

---

### Fix 3.3: Add Loading Skeleton States

#### Create: `components/shared/LoadingSkeleton.tsx`

```tsx
export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* KPI Strip */}
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-24 rounded-xl bg-slate-200" />
        ))}
      </div>
      
      {/* Tabs */}
      <div className="flex gap-2">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-10 w-24 rounded-lg bg-slate-200" />
        ))}
      </div>
      
      {/* Queue Items */}
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-20 rounded-xl bg-slate-200" />
        ))}
      </div>
    </div>
  );
}

export function CaseCockpitSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-32 rounded-xl bg-slate-200" />
      <div className="h-12 rounded-xl bg-slate-200" />
      <div className="h-8 rounded-lg bg-slate-200 w-3/4" />
      <div className="grid grid-cols-2 gap-4">
        <div className="h-64 rounded-xl bg-slate-200" />
        <div className="h-64 rounded-xl bg-slate-200" />
      </div>
    </div>
  );
}
```

#### Use in dashboards:

```tsx
// At the top of each dashboard, after useRequireAuth():
const { hydrated } = useCases();

if (!hydrated) {
  return <DashboardSkeleton />;
}
```

---

### Fix 3.4: Improve Sidebar Active State

#### Modify: `components/layout/Sidebar.tsx`

Use `usePathname()` for proper active state:

```tsx
import { usePathname } from 'next/navigation';

// In the component:
const pathname = usePathname();

// For each nav item:
const isActive = pathname.startsWith(item.href);

// Apply styling:
className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
  isActive 
    ? 'bg-blue-50 text-blue-700 font-medium border-l-4 border-blue-600' 
    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
}`}
```

---

### Fix 3.5-3.10: Additional UI Improvements

I'll provide these as brief instructions:

**3.5: Add tooltips to action buttons**
- Install @radix-ui/react-tooltip
- Wrap action buttons with Tooltip component

**3.6: Add confirmation dialogs for destructive actions**
- End Referral: Already has confirmation in modal
- Reset Demo: Added confirmation above

**3.7: Improve mobile responsiveness**
- Test on tablet viewport (768px)
- Use responsive Tailwind classes (md:, lg:)
- Collapse sidebar on mobile

**3.8: Add keyboard shortcuts**
- Escape to close modals
- Enter to submit forms

**3.9: Add empty states with helpful messages**
- When queues are empty, show friendly message with next action

**3.10: Add date formatting consistency**
- Use date-fns throughout
- Show relative dates ("2 days ago") where appropriate

---

## 4. DATA & STATE FIXES

### Fix 4.1: Add Missing Mock Cases for Demo Coverage

#### Modify: `lib/data/seed.ts`

Ensure you have cases in EVERY stage for demo. Add these if missing:

```typescript
// Add a case in 'initial-todos' stage (patient completing TODOs)
baseCase('case-021', 'TC-2026-0002', 20, 'initial-todos', {
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

// Add a case in 'follow-through' with I/E pending confirmation
baseCase('case-022', 'TC-2026-0003', 21, 'follow-through', {
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

// Add a case ready for scheduling huddle (in 'education' stage, complete)
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
```

### Fix 4.2: Add document maxAgeDays to catalog

#### Modify: `lib/data/documentCatalog.ts`

```typescript
export const documentCatalog: DocumentCatalogItem[] = [
  { type: 'government-id', name: 'Government ID', ownership: 'patient', isRequired: true, isHardBlock: false, maxAgeDays: 365 },
  { type: 'insurance-card', name: 'Insurance Card', ownership: 'patient', isRequired: true, isHardBlock: false, maxAgeDays: 180 },
  { type: 'inclusion-exclusion-form', name: 'Inclusion/Exclusion Form', ownership: 'patient', isRequired: true, isHardBlock: false },
  { type: 'medicare-2728', name: 'Medicare 2728 Form', ownership: 'dusw', isRequired: true, isHardBlock: true, maxAgeDays: 365 },
  { type: 'dialysis-summary', name: 'Dialysis Treatment Summary', ownership: 'dusw', isRequired: true, isHardBlock: false, maxAgeDays: 90 },
  { type: 'lab-results', name: 'Lab Results (last 3 mo)', ownership: 'nephrologist', isRequired: true, isHardBlock: false, maxAgeDays: 90 },
  { type: 'hepatitis-panel', name: 'Hepatitis Panel', ownership: 'nephrologist', isRequired: true, isHardBlock: false, maxAgeDays: 365 },
  { type: 'cardiology-clearance', name: 'Cardiology Clearance', ownership: 'shared', isRequired: false, isHardBlock: false, maxAgeDays: 180 },
  { type: 'pcp-records', name: 'PCP Records', ownership: 'shared', isRequired: false, isHardBlock: false, maxAgeDays: 365 },
  { type: 'outside-cardiology-records', name: 'Outside Cardiology Records', ownership: 'shared', isRequired: false, isHardBlock: false, maxAgeDays: 180 },
];
```

### Fix 4.3: Add educationProgress to existing mock cases

Update seed.ts to include educationProgress for cases in education/scheduling stages.

### Fix 4.4: Ensure all decision types are represented in mock data

Verify mockDecisions includes examples of all decision types for demo.

### Fix 4.5: Add timestamps to all mock data for realistic timeline

Ensure all dates are internally consistent (stageEnteredAt < dueDate, etc.)

---

## 5. DEMO POLISH ITEMS

### Fix 5.1: Add Demo Mode Banner

#### Modify: `app/layout.tsx` or create a DemoBanner component:

```tsx
// Add at the very top of the page, above Header:
<div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-1.5 text-center text-sm font-medium">
  <span className="inline-flex items-center gap-2">
    <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
    Demo Mode - ChristianaCare Kidney Transplant Portal Prototype
  </span>
</div>
```

### Fix 5.2: Add Toast Styling Improvements

The notifications should be more visible. Update NotificationContext styling.

### Fix 5.3: Add Print Styles for End Letter

```css
@media print {
  .no-print { display: none !important; }
  body { font-size: 12pt; }
}
```

### Fix 5.4: Add Help Tooltips for Complex Fields

Add (i) icons with tooltips explaining what each field means.

### Fix 5.5: Fix Any Console Errors

Run the app and fix all console warnings/errors.

### Fix 5.6: Test All Navigation Paths

Ensure every link works, back buttons work, etc.

### Fix 5.7: Verify Audit Trail Completeness

Every action should create an audit event.

### Fix 5.8: Add Favicon and Title

```tsx
// In app/layout.tsx metadata:
export const metadata = {
  title: 'TransplantFlow - ChristianaCare',
  description: 'Kidney Transplant Referral Management Portal',
};
```

---

## 6. NEW MOCK DATA REQUIREMENTS

Ensure the seed data includes:

1. **At least 2 cases per stage** for demo flexibility
2. **One case with 3x contact attempts** to demo auto-escalation
3. **One case with missing 2728** (hard-block scenario)
4. **One case with specialist conflict** (different outcomes)
5. **One ended case** ready for re-referral
6. **One re-referral case** in review
7. **Cases assigned to different PTCs** for PTC dashboard demo
8. **Mix of SLA statuses** (on-track, at-risk, overdue)
9. **Cases with and without care partners**
10. **Various consent combinations** (SMS yes/no, email yes/no)

---

## 7. TESTING CHECKLIST

Before the demo, verify:

### Front Desk Flow
- [ ] Can see I/E Review queue
- [ ] Can confirm I/E review
- [ ] Can route to Financial
- [ ] Can route to Senior (with required notes)
- [ ] Can validate documents
- [ ] Can log EXTERNAL STEP
- [ ] Can send end referral letter

### PTC Flow
- [ ] Can see My Cases
- [ ] Can "Take Patient" from unassigned queue
- [ ] Case moves off queue after taking
- [ ] Can see At Risk cases
- [ ] Mini pipeline chart shows correct distribution

### Senior Coordinator Flow
- [ ] Can see all decision types in queue
- [ ] Decision panel shows case context
- [ ] Can submit decision with rationale
- [ ] Decision completion updates case stage
- [ ] 3x no response appears in queue
- [ ] Specialist conflicts appear in queue

### Financial Flow
- [ ] Can see pending screening queue
- [ ] Can "Clear" a patient
- [ ] Can send clarification request
- [ ] Can end referral with financial reason

### Specialist Flow
- [ ] Can see assigned reviews
- [ ] Can complete review (Clear)
- [ ] Can escalate with notes
- [ ] Escalation creates decision for Senior

### Case Cockpit
- [ ] All 8 tabs render correctly
- [ ] Summary shows pending tasks
- [ ] Documents show hard-block warning
- [ ] Messages show consent status
- [ ] Decisions show full history
- [ ] Scheduling shows correct state
- [ ] End Referral flow works completely
- [ ] Audit shows all events

### Pipeline View
- [ ] Filters work correctly
- [ ] Sorting works
- [ ] Pagination works
- [ ] Click to open case works
- [ ] SLA summary accurate

### Re-Referral Flow
- [ ] Can start re-referral from ended case
- [ ] New case created with link
- [ ] Re-referral review appears in Senior queue

### Global
- [ ] Role switcher works
- [ ] Reset demo button works
- [ ] No console errors
- [ ] Loading states show
- [ ] Toast notifications appear
- [ ] All buttons have hover states

---

## FINAL NOTES FOR AI AGENT

1. **Make ALL changes** - Don't skip anything marked as "nice to have"
2. **Test after each major change** - Run `npm run dev` and verify
3. **Fix TypeScript errors** - Don't leave any red squiggles
4. **Keep code clean** - Use consistent formatting
5. **Add comments** - Especially for complex logic
6. **Update imports** - When adding new components/functions

The Senior Coordinator at ChristianaCare will be testing this extensively. Every workflow path must work. This is a critical demo that could lead to a real engagement.

---

## 8. ADDITIONAL CRITICAL FIXES FOR DEMO PERFECTION

### Fix 8.1: Improve StageProgressBar Visual Design

The stage progress bar should be more visually impressive. Replace `components/case-cockpit/StageProgressBar.tsx`:

```tsx
'use client';

import { Case } from '@/types';
import { getVisibleProgressIndex } from '@/lib/utils/stageTransitions';
import { CheckCircle, Circle, AlertCircle } from 'lucide-react';

const stages = [
  { key: 'new-referral', label: 'Referral', short: '1' },
  { key: 'patient-onboarding', label: 'Onboarding', short: '2' },
  { key: 'initial-todos', label: 'Patient TODOs', short: '3' },
  { key: 'follow-through', label: 'Follow-through', short: '4' },
  { key: 'initial-screening', label: 'Screening', short: '5' },
  { key: 'financial-screening', label: 'Financial', short: '6' },
  { key: 'records-collection', label: 'Records', short: '7' },
  { key: 'medical-records-review', label: 'Med Review', short: '8' },
  { key: 'specialist-review', label: 'Specialists', short: '9' },
  { key: 'final-decision', label: 'Decision', short: '10' },
  { key: 'education', label: 'Education', short: '11' },
  { key: 'scheduling', label: 'Scheduling', short: '12' },
];

interface StageProgressBarProps {
  currentCase: Case;
}

export function StageProgressBar({ currentCase }: StageProgressBarProps) {
  const currentIndex = getVisibleProgressIndex(currentCase.stage);
  const isEnded = currentCase.stage === 'ended';
  const isScheduled = currentCase.stage === 'scheduled';

  if (isEnded) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-6 w-6 text-red-600" />
          <div>
            <p className="font-semibold text-red-800">Referral Ended</p>
            <p className="text-sm text-red-600">
              Reason: {currentCase.endReason} • Ended {currentCase.endedAt ? new Date(currentCase.endedAt).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isScheduled) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
        <div className="flex items-center gap-3">
          <CheckCircle className="h-6 w-6 text-emerald-600" />
          <div>
            <p className="font-semibold text-emerald-800">Appointment Scheduled</p>
            <p className="text-sm text-emerald-600">
              {currentCase.appointmentDate ? new Date(currentCase.appointmentDate).toLocaleString() : 'Date pending confirmation'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold text-slate-700">Workflow Progress</p>
        <p className="text-sm text-slate-500">Stage {currentIndex + 1} of {stages.length}</p>
      </div>
      
      {/* Progress Bar */}
      <div className="relative">
        {/* Background track */}
        <div className="h-2 bg-slate-100 rounded-full" />
        
        {/* Progress fill */}
        <div 
          className="absolute top-0 left-0 h-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
          style={{ width: `${((currentIndex + 1) / stages.length) * 100}%` }}
        />
      </div>

      {/* Stage Labels */}
      <div className="flex justify-between mt-3 overflow-x-auto pb-2">
        {stages.map((stage, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isFuture = index > currentIndex;

          return (
            <div 
              key={stage.key}
              className={`flex flex-col items-center min-w-[60px] ${isFuture ? 'opacity-40' : ''}`}
            >
              <div className={`
                flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold
                ${isCompleted ? 'bg-blue-600 text-white' : ''}
                ${isCurrent ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-600 ring-offset-2' : ''}
                ${isFuture ? 'bg-slate-100 text-slate-400' : ''}
              `}>
                {isCompleted ? <CheckCircle className="h-4 w-4" /> : stage.short}
              </div>
              <span className={`
                text-xs mt-1 text-center whitespace-nowrap
                ${isCurrent ? 'font-semibold text-blue-700' : 'text-slate-500'}
              `}>
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

---

### Fix 8.2: Improve CaseHeader with More Patient Context

Replace `components/case-cockpit/CaseHeader.tsx`:

```tsx
'use client';

import { Case } from '@/types';
import { SLAIndicator } from '@/components/shared/SLAIndicator';
import { ConsentIndicator } from '@/components/shared/ConsentIndicator';
import { 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  Building2, 
  Clock, 
  Users, 
  Globe,
  AlertTriangle,
  Link2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CaseHeaderProps {
  currentCase: Case;
}

export function CaseHeader({ currentCase }: CaseHeaderProps) {
  const dusw = currentCase.clinicContacts.find(c => c.role === 'dusw');
  const neph = currentCase.clinicContacts.find(c => c.role === 'nephrologist');

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      {/* Top Row - Patient Name and SLA */}
      <div className="bg-gradient-to-r from-slate-50 to-white px-6 py-4 border-b border-slate-100">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-700">
                <User className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {currentCase.patient.lastName}, {currentCase.patient.firstName}
                </h1>
                <div className="flex items-center gap-3 text-sm text-slate-600 mt-1">
                  <span className="font-mono">{currentCase.caseNumber}</span>
                  <span>•</span>
                  <span>DOB: {currentCase.patient.dateOfBirth}</span>
                  {currentCase.patient.mrn && (
                    <>
                      <span>•</span>
                      <span>MRN: {currentCase.patient.mrn}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <SLAIndicator status={currentCase.slaStatus} size="lg" />
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-700">
                {currentCase.daysInStage} days in stage
              </p>
              <p className="text-xs text-slate-500">
                Due {new Date(currentCase.slaDueDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="px-6 py-4 grid md:grid-cols-3 gap-6">
        {/* Patient Contact Info */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Patient Contact</h3>
          
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-slate-400" />
            <span>{currentCase.patient.phone}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-slate-400" />
            <span className="truncate">{currentCase.patient.email}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Globe className="h-4 w-4 text-slate-400" />
            <span>Preferred: {currentCase.patient.preferredLanguage}</span>
          </div>

          {/* Care Partner */}
          {currentCase.carePartner && (
            <div className="mt-3 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-purple-500" />
                <span className="font-medium">Care Partner: {currentCase.carePartner.name}</span>
              </div>
              <p className="text-xs text-slate-500 ml-6">{currentCase.carePartner.phone}</p>
            </div>
          )}
        </div>

        {/* Clinic Info */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Referring Clinic</h3>
          
          <div className="flex items-center gap-2 text-sm font-medium">
            <Building2 className="h-4 w-4 text-slate-400" />
            <span>{currentCase.referringClinic}</span>
          </div>
          
          {dusw && (
            <div className="text-sm">
              <span className="text-slate-500">DUSW:</span>{' '}
              <span>{dusw.name}</span>
            </div>
          )}
          
          {neph && (
            <div className="text-sm">
              <span className="text-slate-500">Nephrologist:</span>{' '}
              <span>{neph.name}</span>
            </div>
          )}

          {/* Assigned PTC */}
          {currentCase.assignedPTC && (
            <div className="mt-3 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-blue-500" />
                <span>
                  <span className="text-slate-500">PTC:</span>{' '}
                  <span className="font-medium">{currentCase.assignedPTC.name}</span>
                </span>
              </div>
              {currentCase.ptcAssignedAt && (
                <p className="text-xs text-slate-500 ml-6">
                  Assigned {formatDistanceToNow(new Date(currentCase.ptcAssignedAt), { addSuffix: true })}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Status & Consents */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Status & Consents</h3>
          
          <ConsentIndicator consent={currentCase.consent} />

          {/* Flags */}
          {currentCase.flags.length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-100">
              <div className="flex flex-wrap gap-1">
                {currentCase.flags.map(flag => (
                  <span 
                    key={flag}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800"
                  >
                    <AlertTriangle className="h-3 w-3" />
                    {flag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Linked Cases */}
          {(currentCase.linkedFromCaseId || currentCase.linkedToCaseId) && (
            <div className="mt-3 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <Link2 className="h-4 w-4" />
                {currentCase.linkedFromCaseId && <span>Re-referral from prior case</span>}
                {currentCase.linkedToCaseId && <span>Has active re-referral</span>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

### Fix 8.3: Add ConsentIndicator Component

Create `components/shared/ConsentIndicator.tsx`:

```tsx
'use client';

import { Consent } from '@/types';
import { CheckCircle, XCircle, FileCheck, MessageSquare, Mail, Users } from 'lucide-react';

interface ConsentIndicatorProps {
  consent: Consent;
}

export function ConsentIndicator({ consent }: ConsentIndicatorProps) {
  const items = [
    { 
      label: 'ROI Signed', 
      value: consent.roiSigned, 
      icon: FileCheck,
      detail: consent.roiSignedAt ? new Date(consent.roiSignedAt).toLocaleDateString() : null
    },
    { label: 'SMS Consent', value: consent.smsConsent, icon: MessageSquare },
    { label: 'Email Consent', value: consent.emailConsent, icon: Mail },
    { label: 'Care Partner Consent', value: consent.carePartnerConsent, icon: Users },
  ];

  return (
    <div className="space-y-2">
      {items.map(item => (
        <div key={item.label} className="flex items-center gap-2 text-sm">
          {item.value ? (
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          ) : (
            <XCircle className="h-4 w-4 text-slate-300" />
          )}
          <span className={item.value ? 'text-slate-700' : 'text-slate-400'}>
            {item.label}
          </span>
          {item.detail && (
            <span className="text-xs text-slate-400">({item.detail})</span>
          )}
        </div>
      ))}
    </div>
  );
}
```

---

### Fix 8.4: Improve SLAIndicator with Size Variants

Update `components/shared/SLAIndicator.tsx`:

```tsx
'use client';

import { SLAStatus } from '@/types';
import { Clock, AlertTriangle, AlertOctagon, CheckCircle } from 'lucide-react';

interface SLAIndicatorProps {
  status: SLAStatus;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const config = {
  'on-track': {
    icon: CheckCircle,
    label: 'On Track',
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    border: 'border-emerald-200'
  },
  'at-risk': {
    icon: AlertTriangle,
    label: 'At Risk',
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    border: 'border-amber-200'
  },
  'overdue': {
    icon: AlertOctagon,
    label: 'Overdue',
    bg: 'bg-red-100',
    text: 'text-red-700',
    border: 'border-red-200'
  }
};

const sizes = {
  sm: { badge: 'px-2 py-0.5 text-xs', icon: 'h-3 w-3' },
  md: { badge: 'px-2.5 py-1 text-sm', icon: 'h-4 w-4' },
  lg: { badge: 'px-3 py-1.5 text-sm', icon: 'h-5 w-5' }
};

export function SLAIndicator({ status, size = 'md', showLabel = true }: SLAIndicatorProps) {
  const { icon: Icon, label, bg, text, border } = config[status];
  const { badge, icon } = sizes[size];

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${bg} ${text} ${border} ${badge}`}>
      <Icon className={icon} />
      {showLabel && <span>{label}</span>}
    </span>
  );
}
```

---

### Fix 8.5: Add Inbox Page Functionality

Replace `app/inbox/page.tsx`:

```tsx
'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRequireAuth } from '@/lib/context/AuthContext';
import { useCases } from '@/lib/context/CaseContext';
import { Button } from '@/components/ui/button';
import { Mail, MailOpen, User, Clock, Filter } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function InboxPage() {
  useRequireAuth();
  
  const { messages, cases } = useCases();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const sortedMessages = useMemo(() => {
    return [...messages]
      .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())
      .filter(msg => filter === 'all' || !msg.readAt);
  }, [messages, filter]);

  const getCaseForMessage = (caseId: string) => {
    return cases.find(c => c.id === caseId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Message Inbox</h1>
          <p className="text-sm text-slate-600">{sortedMessages.length} messages</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant={filter === 'all' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button 
            variant={filter === 'unread' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilter('unread')}
          >
            Unread
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100">
        {sortedMessages.map(message => {
          const relatedCase = getCaseForMessage(message.caseId);
          const isUnread = !message.readAt;

          return (
            <Link 
              key={message.id} 
              href={`/cases/${message.caseId}?tab=messages`}
              className={`block p-4 hover:bg-slate-50 transition-colors ${isUnread ? 'bg-blue-50/50' : ''}`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-full ${isUnread ? 'bg-blue-100' : 'bg-slate-100'}`}>
                  {isUnread ? (
                    <Mail className={`h-5 w-5 ${isUnread ? 'text-blue-600' : 'text-slate-400'}`} />
                  ) : (
                    <MailOpen className="h-5 w-5 text-slate-400" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`font-medium truncate ${isUnread ? 'text-slate-900' : 'text-slate-600'}`}>
                      {relatedCase ? `${relatedCase.patient.lastName}, ${relatedCase.patient.firstName}` : 'Unknown Patient'}
                    </p>
                    <span className="text-xs text-slate-500 whitespace-nowrap">
                      {formatDistanceToNow(new Date(message.sentAt), { addSuffix: true })}
                    </span>
                  </div>
                  
                  <p className="text-sm text-slate-500 mt-0.5">
                    From: {message.fromUser.name} → {message.toRecipients.map(r => r.name).join(', ')}
                  </p>
                  
                  <p className={`text-sm mt-1 line-clamp-2 ${isUnread ? 'text-slate-700' : 'text-slate-500'}`}>
                    {message.body}
                  </p>

                  {message.isContactAttempt && (
                    <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                      Contact Attempt #{message.attemptNumber}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}

        {sortedMessages.length === 0 && (
          <div className="p-8 text-center text-slate-500">
            <Mail className="h-12 w-12 mx-auto mb-3 text-slate-300" />
            <p>No messages to display</p>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

### Fix 8.6: Add Admin Configuration Pages (Functional)

These pages should show the configurable items even if they're read-only for demo.

Replace `app/admin/stages/page.tsx`:

```tsx
'use client';

import { useRequireAuth } from '@/lib/context/AuthContext';
import { stageDefinitions } from '@/lib/data/stages';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Settings, Lock } from 'lucide-react';

export default function AdminStagesPage() {
  useRequireAuth();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Stage Configuration</h1>
          <p className="text-sm text-slate-600">Configure workflow stages and SLA timers</p>
        </div>
        <Button variant="outline" disabled>
          <Lock className="h-4 w-4 mr-2" />
          Locked in Demo
        </Button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Order</TableHead>
              <TableHead>Stage Name</TableHead>
              <TableHead>Short Name</TableHead>
              <TableHead>SLA (Days)</TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stageDefinitions.map(stage => (
              <TableRow key={stage.id}>
                <TableCell className="font-mono text-sm">{stage.order}</TableCell>
                <TableCell className="font-medium">{stage.name}</TableCell>
                <TableCell>{stage.shortName}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
                    {stage.slaDays} days
                  </span>
                </TableCell>
                <TableCell className="text-sm text-slate-600 max-w-md truncate">
                  {stage.description}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm text-amber-800">
          <strong>Demo Note:</strong> In production, administrators can customize stage names, SLA timers, and add/remove stages specific to their transplant center's workflow.
        </p>
      </div>
    </div>
  );
}
```

---

### Fix 8.7: Final Mock Data Additions

Add to `lib/data/seed.ts` to ensure complete demo coverage:

```typescript
// Add these additional mock cases at the end of mockCases array:

// Case ready for I/E review confirmation
baseCase('case-024', 'TC-2026-0005', 23, 'initial-screening', {
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

// Case in education with all items complete (ready for scheduling huddle)
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

// Case with exactly 2 contact attempts (will trigger 3x on next attempt)
baseCase('case-026', 'TC-2026-0007', 25, 'education', {
  assignedPTC: userById('ptc-2'),
  stageEnteredAt: iso(-10),
  slaDueDate: iso(-3),
  daysInStage: 10,
  contactAttempts: 2,
  lastContactAttempt: iso(-2),
  flags: ['No Response x2']
}),
```

Also add corresponding tasks for these cases.

---

### Fix 8.8: Ensure Pipeline Summary Shows Accurate Data

Update `components/pipeline/PipelineSummary.tsx`:

```tsx
'use client';

import { useMemo } from 'react';
import { Case } from '@/types';
import { 
  Users, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  Calendar
} from 'lucide-react';

interface PipelineSummaryProps {
  cases: Case[];
}

export function PipelineSummary({ cases }: PipelineSummaryProps) {
  const stats = useMemo(() => {
    const activeCases = cases.filter(c => c.stage !== 'ended');
    const scheduledCases = cases.filter(c => c.stage === 'scheduled');
    const endedCases = cases.filter(c => c.stage === 'ended');
    
    const overdueCases = activeCases.filter(c => c.slaStatus === 'overdue');
    const atRiskCases = activeCases.filter(c => c.slaStatus === 'at-risk');
    const onTrackCases = activeCases.filter(c => c.slaStatus === 'on-track');
    
    const avgDaysInStage = activeCases.length > 0
      ? Math.round(activeCases.reduce((sum, c) => sum + c.daysInStage, 0) / activeCases.length)
      : 0;

    const stageDistribution = activeCases.reduce((acc, c) => {
      acc[c.stage] = (acc[c.stage] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topStages = Object.entries(stageDistribution)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    return {
      total: cases.length,
      active: activeCases.length,
      scheduled: scheduledCases.length,
      ended: endedCases.length,
      overdue: overdueCases.length,
      atRisk: atRiskCases.length,
      onTrack: onTrackCases.length,
      avgDaysInStage,
      topStages
    };
  }, [cases]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-4">Pipeline Summary</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="p-3 rounded-lg bg-slate-50">
          <div className="flex items-center gap-2 text-slate-600 mb-1">
            <Users className="h-4 w-4" />
            <span className="text-xs font-medium">Total Cases</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
        </div>

        <div className="p-3 rounded-lg bg-blue-50">
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs font-medium">Active</span>
          </div>
          <p className="text-2xl font-bold text-blue-700">{stats.active}</p>
        </div>

        <div className="p-3 rounded-lg bg-emerald-50">
          <div className="flex items-center gap-2 text-emerald-600 mb-1">
            <CheckCircle className="h-4 w-4" />
            <span className="text-xs font-medium">On Track</span>
          </div>
          <p className="text-2xl font-bold text-emerald-700">{stats.onTrack}</p>
        </div>

        <div className="p-3 rounded-lg bg-amber-50">
          <div className="flex items-center gap-2 text-amber-600 mb-1">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-xs font-medium">At Risk</span>
          </div>
          <p className="text-2xl font-bold text-amber-700">{stats.atRisk}</p>
        </div>

        <div className="p-3 rounded-lg bg-red-50">
          <div className="flex items-center gap-2 text-red-600 mb-1">
            <Clock className="h-4 w-4" />
            <span className="text-xs font-medium">Overdue</span>
          </div>
          <p className="text-2xl font-bold text-red-700">{stats.overdue}</p>
        </div>

        <div className="p-3 rounded-lg bg-slate-50">
          <div className="flex items-center gap-2 text-slate-600 mb-1">
            <Calendar className="h-4 w-4" />
            <span className="text-xs font-medium">Avg Days</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.avgDaysInStage}</p>
        </div>
      </div>

      {/* Stage Distribution */}
      <div className="mt-4 pt-4 border-t border-slate-100">
        <p className="text-xs font-medium text-slate-500 mb-2">Top Stages by Volume:</p>
        <div className="flex flex-wrap gap-2">
          {stats.topStages.map(([stage, count]) => (
            <span key={stage} className="inline-flex items-center px-2 py-1 rounded-full bg-slate-100 text-slate-700 text-xs">
              {stage.replace(/-/g, ' ')}: <strong className="ml-1">{count}</strong>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

## 9. DEMO WALKTHROUGH SCRIPT

Use this script to demonstrate the complete workflow:

### Opening (2 min)
1. Show Login page - explain role-based access
2. Login as **Front Desk**
3. Briefly show the dashboard layout

### Front Desk Flow (5 min)
4. Show KPI strip - explain metrics
5. Click **I/E Review** tab - show cases needing confirmation
6. **Confirm** an I/E review - show toast notification
7. Click **Route Screening** tab - show cases ready to route
8. Open **Routing Modal** - show flagged case with concerns
9. Route one case to Financial, one to Senior Coordinator

### Senior Coordinator Flow (5 min)
10. Switch role to **Senior Coordinator**
11. Show Decision Queue with categories
12. Select a **Screening Override** decision
13. Point out the case context panel (patient info, flags, documents)
14. Enter rationale and submit decision
15. Show case advances to next stage

### Financial Flow (3 min)
16. Switch to **Financial Coordinator**
17. Show pending screening queue
18. **Clear** a patient - show stage advancement
19. Show "Needs Info" sends clarification request

### PTC Flow (4 min)
20. Switch to **PTC**
21. Show "My Cases" dashboard
22. Show "Take Patient" queue - claim a patient
23. Show Mini Pipeline chart
24. Open a case - show Case Cockpit

### Case Cockpit Deep Dive (5 min)
25. Walk through all 8 tabs:
    - Summary: What needs to happen
    - Tasks: Role-based task list
    - Documents: Hard-block warning (show 2728 missing)
    - Messages: Consent indicators
    - Decisions: Historical decisions
    - Scheduling: 5-state workflow
    - End Referral: 3-step process
    - Audit: Complete timeline

### Specialist Flow (3 min)
26. Switch to **Dietitian**
27. Start a review - show structured outcomes
28. Complete one review as "Clear"
29. Escalate another - show decision created for Senior

### End Referral & Re-Referral (3 min)
30. Open an ended case
31. Show reason and letter
32. Start **Re-Referral** - show linked case created
33. Show re-referral appears in Senior queue

### Pipeline View (2 min)
34. Open Pipeline View
35. Demonstrate filters
36. Show sorting
37. Show summary statistics

### Closing (2 min)
38. Show Reset Demo button
39. Discuss customization capabilities
40. Q&A

**Total Demo Time: ~35 minutes**

---

Good luck with the demo! 🏥

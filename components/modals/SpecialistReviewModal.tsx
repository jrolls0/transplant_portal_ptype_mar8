'use client';

import { useState } from 'react';
import { Case } from '@/types';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface SpecialistReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reviewType: string;
  currentCase: Case;
  onSubmit: (payload: { outcome: 'clear' | 'needs-clarification' | 'escalate'; notes: string }) => void;
}

export function SpecialistReviewModal({
  open,
  onOpenChange,
  reviewType,
  currentCase,
  onSubmit
}: SpecialistReviewModalProps) {
  const [outcome, setOutcome] = useState<'clear' | 'needs-clarification' | 'escalate'>('clear');
  const [notes, setNotes] = useState('');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-xl'>
        <DialogHeader>
          <DialogTitle>Submit Review Outcome</DialogTitle>
        </DialogHeader>

        <div className='space-y-4'>
          <div>
            <p className='text-sm font-semibold text-slate-900'>Review Type: {reviewType}</p>
            <p className='text-xs text-slate-500'>
              Case: {currentCase.caseNumber} ({currentCase.patient.lastName}, {currentCase.patient.firstName})
            </p>
          </div>

          <div className='rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700'>
            <p className='mb-1 font-semibold text-slate-900'>Documents Available</p>
            <ul className='list-disc space-y-1 pl-5'>
              <li>Dialysis Treatment Summary</li>
              <li>Lab Results</li>
              <li>Inclusion/Exclusion Responses</li>
            </ul>
          </div>

          <div className='space-y-2'>
            <p className='text-sm font-semibold text-slate-700'>Your Outcome *</p>
            <label className='flex items-center gap-2 rounded-lg border border-slate-200 p-2 text-sm'>
              <input
                type='radio'
                className='h-4 w-4'
                checked={outcome === 'clear'}
                onChange={() => setOutcome('clear')}
              />
              Clear - No concerns
            </label>
            <label className='flex items-center gap-2 rounded-lg border border-slate-200 p-2 text-sm'>
              <input
                type='radio'
                className='h-4 w-4'
                checked={outcome === 'needs-clarification'}
                onChange={() => setOutcome('needs-clarification')}
              />
              Needs Clarification - Will message patient
            </label>
            <label className='flex items-center gap-2 rounded-lg border border-slate-200 p-2 text-sm'>
              <input
                type='radio'
                className='h-4 w-4'
                checked={outcome === 'escalate'}
                onChange={() => setOutcome('escalate')}
              />
              Concern → Escalate to Senior Coordinator
            </label>
          </div>

          <div>
            <p className='mb-2 text-sm font-semibold text-slate-700'>Notes</p>
            <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} />
          </div>

          <Button variant='secondary' className='w-full'>
            Request Additional Records
          </Button>
        </div>

        <DialogFooter>
          <Button variant='secondary' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onSubmit({ outcome, notes });
              onOpenChange(false);
            }}
          >
            Submit Outcome
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

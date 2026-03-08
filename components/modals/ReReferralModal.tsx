'use client';

import { Case } from '@/types';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ReReferralModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentCase: Case;
  onStart: () => void;
}

export function ReReferralModal({ open, onOpenChange, currentCase, onStart }: ReReferralModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-xl'>
        <DialogHeader>
          <DialogTitle>Start Re-Referral</DialogTitle>
        </DialogHeader>

        <div className='space-y-3 text-sm text-slate-700'>
          <p>
            Original Case: {currentCase.caseNumber} ({currentCase.patient.lastName}, {currentCase.patient.firstName})
          </p>
          <p>Ended: {currentCase.endedAt ? new Date(currentCase.endedAt).toLocaleDateString() : 'N/A'}</p>
          <p>End Reason: {currentCase.endReason ?? 'N/A'}</p>

          <div className='rounded-lg border border-slate-200 bg-slate-50 p-3'>
            <p className='mb-2 font-semibold text-slate-900'>This will:</p>
            <ul className='list-disc space-y-1 pl-5'>
              <li>Create a new linked case record.</li>
              <li>Copy forward patient demographics and contact data.</li>
              <li>Require new clinical/doc review workflows.</li>
              <li>Create a Re-Referral Review task for Senior Coordinator.</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant='secondary' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onStart();
              onOpenChange(false);
            }}
          >
            Start Re-Referral
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

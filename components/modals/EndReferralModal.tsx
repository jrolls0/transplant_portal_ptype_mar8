'use client';

import { useMemo, useState } from 'react';
import { Case } from '@/types';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { endReasons } from '@/lib/data/endReasons';
import { buildEndLetter } from '@/lib/context/CaseContext';

interface EndReferralModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentCase: Case;
  preselectedReason?: string;
  onApprove: (payload: { reasonCode: string; rationale: string; letterDraft: string }) => void;
}

export function EndReferralModal({ open, onOpenChange, currentCase, preselectedReason, onApprove }: EndReferralModalProps) {
  const [reasonCode, setReasonCode] = useState(preselectedReason ?? endReasons[0].code);
  const [rationale, setRationale] = useState('');
  const [letterDraft, setLetterDraft] = useState('');

  const effectiveLetter = useMemo(
    () => letterDraft || buildEndLetter(reasonCode, currentCase.patient.lastName),
    [letterDraft, reasonCode, currentCase.patient.lastName]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] max-w-3xl overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>End Referral</DialogTitle>
        </DialogHeader>

        <div className='space-y-5'>
          <div className='rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800'>
            This will permanently end the referral and trigger a front desk letter-send workflow.
          </div>

          <div>
            <p className='mb-2 text-sm font-semibold text-slate-700'>Step 1: Select End Reason *</p>
            <div className='space-y-2 rounded-lg border border-slate-200 p-3'>
              {endReasons.map((reason) => (
                <label key={reason.code} className='flex items-start gap-2 text-sm'>
                  <input
                    type='radio'
                    className='mt-1 h-4 w-4'
                    checked={reasonCode === reason.code}
                    onChange={() => setReasonCode(reason.code)}
                  />
                  {reason.label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <p className='mb-2 text-sm font-semibold text-slate-700'>Step 2: Rationale (required) *</p>
            <Textarea value={rationale} onChange={(event) => setRationale(event.target.value)} />
          </div>

          <div>
            <p className='mb-2 text-sm font-semibold text-slate-700'>Step 3: Review & Approve Letter</p>
            <Textarea value={effectiveLetter} onChange={(event) => setLetterDraft(event.target.value)} className='min-h-[220px] font-mono text-xs' />
          </div>
        </div>

        <DialogFooter>
          <Button variant='secondary' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (!rationale.trim()) return;
              onApprove({ reasonCode, rationale, letterDraft: effectiveLetter });
              onOpenChange(false);
            }}
          >
            Approve & End Referral
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

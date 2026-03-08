'use client';

import { useState } from 'react';
import { Case, Decision } from '@/types';
import { Button } from '@/components/ui/button';
import { EndReferralModal } from '@/components/modals/EndReferralModal';
import { ReReferralModal } from '@/components/modals/ReReferralModal';
import { endReasons } from '@/lib/data/endReasons';
import { buildEndLetter } from '@/lib/context/CaseContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface EndReferralTabProps {
  currentCase: Case;
  decisions?: Decision[];
  onEndReferral: (payload: { reasonCode: string; rationale: string; letterDraft: string }) => void;
  onStartReReferral: () => void;
}

export function EndReferralTab({ currentCase, decisions, onEndReferral, onStartReReferral }: EndReferralTabProps) {
  const [endOpen, setEndOpen] = useState(false);
  const [reReferralOpen, setReReferralOpen] = useState(false);
  const [letterModalOpen, setLetterModalOpen] = useState(false);
  const [viewingLetter, setViewingLetter] = useState('');

  if (currentCase.stage === 'ended') {
    const reason = endReasons.find((item) => item.code === currentCase.endReason);

    return (
      <div className='space-y-4'>
        <section className='rounded-xl border border-slate-200 bg-white p-4'>
          <h3 className='mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500'>Referral Ended</h3>
          <p className='text-sm text-slate-700'>Reason: {reason?.label ?? currentCase.endReason}</p>
          <p className='mt-1 text-sm text-slate-700'>Rationale: {currentCase.endRationale}</p>
          <p className='mt-1 text-sm text-slate-700'>Ended by: {currentCase.endedBy}</p>

          <div className='mt-4 flex flex-wrap gap-2'>
            <Button onClick={() => setReReferralOpen(true)}>Start Re-Referral</Button>
            <Button
              variant='secondary'
              onClick={() => {
                const endDecision = decisions?.find(
                  (decision) => decision.caseId === currentCase.id && decision.type === 'end-referral' && decision.letterDraft
                );
                const letter = endDecision?.letterDraft ?? buildEndLetter(currentCase.endReason || '', currentCase.patient.lastName);
                setViewingLetter(letter);
                setLetterModalOpen(true);
              }}
            >
              View End Letter
            </Button>
          </div>
        </section>

        <ReReferralModal open={reReferralOpen} onOpenChange={setReReferralOpen} currentCase={currentCase} onStart={onStartReReferral} />

        <Dialog open={letterModalOpen} onOpenChange={setLetterModalOpen}>
          <DialogContent className='max-w-2xl'>
            <DialogHeader>
              <DialogTitle>End Referral Letter</DialogTitle>
            </DialogHeader>
            <div className='max-h-[60vh] overflow-auto whitespace-pre-wrap rounded-lg bg-slate-50 p-4 font-mono text-sm'>{viewingLetter}</div>
            <div className='flex justify-end gap-2'>
              <Button variant='secondary' onClick={() => setLetterModalOpen(false)}>
                Close
              </Button>
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(viewingLetter);
                }}
              >
                Copy to Clipboard
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <section className='rounded-xl border border-slate-200 bg-white p-4'>
        <h3 className='mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500'>End Referral</h3>
        <p className='mb-3 text-sm text-slate-700'>
          This will permanently end the referral and trigger a front-desk letter send task.
        </p>
        <Button variant='destructive' onClick={() => setEndOpen(true)}>
          Start End Referral
        </Button>
      </section>

      <EndReferralModal
        open={endOpen}
        onOpenChange={setEndOpen}
        currentCase={currentCase}
        onApprove={({ reasonCode, rationale, letterDraft }) => onEndReferral({ reasonCode, rationale, letterDraft })}
      />
    </div>
  );
}

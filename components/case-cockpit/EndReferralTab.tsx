'use client';

import { useState } from 'react';
import { Case } from '@/types';
import { Button } from '@/components/ui/button';
import { EndReferralModal } from '@/components/modals/EndReferralModal';
import { ReReferralModal } from '@/components/modals/ReReferralModal';
import { endReasons } from '@/lib/data/endReasons';

interface EndReferralTabProps {
  currentCase: Case;
  onEndReferral: (payload: { reasonCode: string; rationale: string; letterDraft: string }) => void;
  onStartReReferral: () => void;
}

export function EndReferralTab({ currentCase, onEndReferral, onStartReReferral }: EndReferralTabProps) {
  const [endOpen, setEndOpen] = useState(false);
  const [reReferralOpen, setReReferralOpen] = useState(false);

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
            <Button variant='secondary'>View End Letter</Button>
          </div>
        </section>

        <ReReferralModal open={reReferralOpen} onOpenChange={setReReferralOpen} currentCase={currentCase} onStart={onStartReReferral} />
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

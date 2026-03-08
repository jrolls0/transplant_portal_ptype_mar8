'use client';

import { useMemo, useState } from 'react';
import { Decision } from '@/types';
import { Button } from '@/components/ui/button';
import { DecisionModal } from '@/components/modals/DecisionModal';
import { PartialPacketModal } from '@/components/modals/PartialPacketModal';

interface DecisionsTabProps {
  decisions: Decision[];
  onSubmitDecision: (decisionId: string, option: string, rationale: string) => void;
}

export function DecisionsTab({ decisions, onSubmitDecision }: DecisionsTabProps) {
  const [selectedDecisionId, setSelectedDecisionId] = useState<string | null>(null);

  const selected = useMemo(() => decisions.find((decision) => decision.id === selectedDecisionId), [decisions, selectedDecisionId]);

  const pending = decisions.filter((decision) => decision.status === 'pending');

  return (
    <div className='space-y-3'>
      {decisions.map((decision) => (
        <div key={decision.id} className='rounded-xl border border-slate-200 bg-white p-4'>
          <div className='mb-2 flex flex-wrap items-center justify-between gap-2'>
            <div>
              <p className='text-sm font-semibold text-slate-900'>{decision.title}</p>
              <p className='text-xs text-slate-500'>Type: {decision.type}</p>
            </div>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                decision.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
              }`}
            >
              {decision.status}
            </span>
          </div>

          {decision.selectedOption ? <p className='text-sm text-slate-700'>Outcome: {decision.selectedOption}</p> : null}
          {decision.rationale ? <p className='mt-1 text-sm text-slate-600'>Rationale: {decision.rationale}</p> : null}

          {decision.status === 'pending' ? (
            <Button size='sm' className='mt-3' onClick={() => setSelectedDecisionId(decision.id)}>
              Record Decision
            </Button>
          ) : null}
        </div>
      ))}

      {decisions.length === 0 ? <p className='text-sm text-slate-500'>No decisions for this case.</p> : null}

      {selected ? (
        selected.type === 'partial-packet' ? (
          <PartialPacketModal
            open={Boolean(selected)}
            onOpenChange={(open) => {
              if (!open) setSelectedDecisionId(null);
            }}
            decision={selected}
            onSubmit={(option, rationale) => {
              onSubmitDecision(selected.id, option, rationale);
              setSelectedDecisionId(null);
            }}
          />
        ) : (
          <DecisionModal
            open={Boolean(selected)}
            onOpenChange={(open) => {
              if (!open) setSelectedDecisionId(null);
            }}
            decision={selected}
            contextLines={selected.type === 'hard-block-override' ? ['2728 form missing (hard-block)'] : []}
            onSubmit={(option, rationale) => {
              onSubmitDecision(selected.id, option, rationale);
              setSelectedDecisionId(null);
            }}
          />
        )
      ) : null}

      {pending.length > 0 ? <p className='text-xs text-slate-500'>{pending.length} pending decisions require rationale.</p> : null}
    </div>
  );
}

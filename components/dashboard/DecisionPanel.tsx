'use client';

import { Decision } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';

interface DecisionPanelProps {
  decision?: Decision;
  onSubmit: (option: string, rationale: string) => void;
}

export function DecisionPanel({ decision, onSubmit }: DecisionPanelProps) {
  const [selected, setSelected] = useState('');
  const [rationale, setRationale] = useState('');

  if (!decision) {
    return <div className='rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500'>Select a decision to review.</div>;
  }

  return (
    <div className='rounded-xl border border-slate-200 bg-white p-4 shadow-sm'>
      <p className='text-sm font-semibold text-slate-900'>{decision.title}</p>
      <p className='mb-3 text-xs text-slate-500'>Decision Type: {decision.type}</p>

      <div className='space-y-2'>
        {decision.options.map((option) => (
          <label key={option} className='flex items-start gap-2 rounded-lg border border-slate-200 p-2 text-sm'>
            <input
              type='radio'
              checked={selected === option}
              onChange={() => setSelected(option)}
              className='mt-1 h-4 w-4'
            />
            <span>{option}</span>
          </label>
        ))}
      </div>

      <div className='mt-3'>
        <p className='mb-1 text-xs font-semibold text-slate-600'>Rationale (required)</p>
        <Textarea value={rationale} onChange={(event) => setRationale(event.target.value)} />
      </div>

      <Button
        className='mt-3 w-full'
        onClick={() => {
          if (!selected || !rationale.trim()) return;
          onSubmit(selected, rationale);
          setSelected('');
          setRationale('');
        }}
      >
        Submit Decision
      </Button>
    </div>
  );
}

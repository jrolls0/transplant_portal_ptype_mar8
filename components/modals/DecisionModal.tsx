'use client';

import { useState } from 'react';
import { Decision } from '@/types';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface DecisionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  decision: Decision;
  contextLines?: string[];
  onSubmit: (option: string, rationale: string) => void;
}

export function DecisionModal({ open, onOpenChange, decision, contextLines = [], onSubmit }: DecisionModalProps) {
  const [selected, setSelected] = useState('');
  const [rationale, setRationale] = useState('');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-xl'>
        <DialogHeader>
          <DialogTitle>Record Decision</DialogTitle>
        </DialogHeader>

        <div className='space-y-4'>
          <div>
            <p className='text-sm font-semibold text-slate-900'>{decision.title}</p>
            <p className='text-xs text-slate-500'>Decision Type: {decision.type}</p>
          </div>

          {contextLines.length > 0 ? (
            <div className='rounded-lg border border-slate-200 bg-slate-50 p-3'>
              <p className='mb-2 text-xs font-semibold uppercase text-slate-500'>Context</p>
              <ul className='list-disc space-y-1 pl-5 text-sm text-slate-700'>
                {contextLines.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className='space-y-2'>
            <p className='text-sm font-semibold text-slate-700'>Your Decision *</p>
            {decision.options.map((option) => (
              <label key={option} className='flex items-start gap-2 rounded-lg border border-slate-200 p-2 text-sm'>
                <input
                  type='radio'
                  className='mt-1 h-4 w-4'
                  checked={selected === option}
                  onChange={() => setSelected(option)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>

          <div>
            <p className='mb-2 text-sm font-semibold text-slate-700'>Rationale (required) *</p>
            <Textarea value={rationale} onChange={(event) => setRationale(event.target.value)} />
          </div>
        </div>

        <DialogFooter>
          <Button variant='secondary' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (!selected || !rationale.trim()) return;
              onSubmit(selected, rationale);
              onOpenChange(false);
            }}
          >
            Submit Decision
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

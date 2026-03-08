'use client';

import { useState } from 'react';
import { Case } from '@/types';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Info } from 'lucide-react';

interface SchedulingHuddleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentCase: Case;
  onRecord: (payload: {
    type: 'direct-evaluation' | 'testing-first';
    carePartnerRequired: boolean;
    appointmentTypes: string[];
    notes: string;
  }) => void;
}

const testOptions = ['Cardiac stress test', 'Colonoscopy', 'Mammogram'];

export function SchedulingHuddleModal({ open, onOpenChange, currentCase, onRecord }: SchedulingHuddleModalProps) {
  const [type, setType] = useState<'direct-evaluation' | 'testing-first'>('direct-evaluation');
  const [carePartnerRequired, setCarePartnerRequired] = useState(true);
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [other, setOther] = useState('');
  const [notes, setNotes] = useState('');

  const toggle = (value: string) => {
    setSelectedTests((current) => (current.includes(value) ? current.filter((item) => item !== value) : [...current, value]));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-xl'>
        <DialogHeader>
          <DialogTitle>Record Scheduling Huddle Decision</DialogTitle>
        </DialogHeader>

        <div className='space-y-4'>
          <p className='text-sm text-slate-700'>
            Case: {currentCase.caseNumber} ({currentCase.patient.lastName}, {currentCase.patient.firstName})
          </p>

          <div className='space-y-2'>
            <p className='text-sm font-semibold text-slate-700'>Appointment Type *</p>
            <label className='flex items-center gap-2 text-sm'>
              <input
                type='radio'
                className='h-4 w-4'
                checked={type === 'direct-evaluation'}
                onChange={() => setType('direct-evaluation')}
              />
              Direct Evaluation
            </label>
            <label className='flex items-center gap-2 text-sm'>
              <input
                type='radio'
                className='h-4 w-4'
                checked={type === 'testing-first'}
                onChange={() => setType('testing-first')}
              />
              Testing First
            </label>
          </div>

          {type === 'testing-first' ? (
            <div className='space-y-2 rounded-lg border border-slate-200 p-3'>
              <p className='text-sm font-semibold text-slate-700'>Required tests</p>
              {testOptions.map((test) => (
                <label key={test} className='flex items-center gap-2 text-sm'>
                  <Checkbox checked={selectedTests.includes(test)} onChange={() => toggle(test)} />
                  {test}
                </label>
              ))}
              <input
                className='w-full rounded-lg border border-slate-300 px-3 py-2 text-sm'
                placeholder='Other'
                value={other}
                onChange={(event) => setOther(event.target.value)}
              />
            </div>
          ) : null}

          <div className='space-y-2'>
            <p className='flex items-center gap-1 text-sm font-semibold text-slate-700'>
              Emergency Contact Must Attend *
              <span title='If required, staff should include the emergency contact in scheduling communications and day-of logistics.'>
                <Info className='h-3.5 w-3.5 text-slate-400' />
              </span>
            </p>
            <label className='flex items-center gap-2 text-sm'>
              <input
                type='radio'
                className='h-4 w-4'
                checked={carePartnerRequired}
                onChange={() => setCarePartnerRequired(true)}
              />
              Yes (default)
            </label>
            <label className='flex items-center gap-2 text-sm'>
              <input
                type='radio'
                className='h-4 w-4'
                checked={!carePartnerRequired}
                onChange={() => setCarePartnerRequired(false)}
              />
              No
            </label>
          </div>

          <div>
            <p className='mb-2 text-sm font-semibold text-slate-700'>Notes</p>
            <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} />
          </div>
        </div>

        <DialogFooter>
          <Button variant='secondary' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onRecord({
                type,
                carePartnerRequired,
                appointmentTypes:
                  type === 'direct-evaluation'
                    ? ['Direct Evaluation']
                    : [...selectedTests, ...(other.trim() ? [other.trim()] : [])],
                notes
              });
              onOpenChange(false);
            }}
          >
            Record Decision
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

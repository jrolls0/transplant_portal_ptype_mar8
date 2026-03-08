'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Case } from '@/types';

interface LogExternalStepModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentCase?: Case;
  onSubmit: (payload: { title: string; externalSystem: string; notes: string; markAsContactAttempt: boolean }) => void;
}

export function LogExternalStepModal({ open, onOpenChange, currentCase, onSubmit }: LogExternalStepModalProps) {
  const [actionType, setActionType] = useState('');
  const [externalSystem, setExternalSystem] = useState('');
  const [notes, setNotes] = useState('');
  const [contactAttempt, setContactAttempt] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-xl'>
        <DialogHeader>
          <DialogTitle>Log EXTERNAL STEP</DialogTitle>
        </DialogHeader>

        <div className='space-y-4'>
          <div>
            <p className='mb-2 text-sm font-semibold'>Action Type *</p>
            <Select value={actionType} onChange={(event) => setActionType(event.target.value)}>
              <option value=''>Select...</option>
              <option value='Phone call to patient'>Phone call to patient</option>
              <option value='Phone call to clinic'>Phone call to clinic</option>
              <option value='Phone call to outside provider'>Phone call to outside provider</option>
              <option value='Fax sent'>Fax sent</option>
              <option value='Fax received'>Fax received</option>
              <option value='Confirmed in Surginet'>Confirmed in Surginet</option>
              <option value='Confirmed in Cerner'>Confirmed in Cerner</option>
              <option value='Mailed letter'>Mailed letter</option>
              <option value='Other'>Other</option>
            </Select>
          </div>

          <div>
            <p className='mb-2 text-sm font-semibold'>External System *</p>
            <Select value={externalSystem} onChange={(event) => setExternalSystem(event.target.value)}>
              <option value=''>Select...</option>
              <option value='Surginet'>Surginet</option>
              <option value='Cerner'>Cerner</option>
              <option value='Phone'>Phone</option>
              <option value='Fax'>Fax</option>
              <option value='Mail'>Mail</option>
              <option value='Other'>Other</option>
            </Select>
          </div>

          <div>
            <p className='mb-2 text-sm font-semibold'>Outcome/Notes *</p>
            <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} />
          </div>

          <label className='flex items-center gap-2 text-sm'>
            <Checkbox checked={contactAttempt} onChange={(event) => setContactAttempt(event.target.checked)} />
            <span>
              Mark as contact attempt
              {currentCase && contactAttempt ? (
                <span className='ml-2 font-medium text-amber-600'>(This will be attempt #{currentCase.contactAttempts + 1})</span>
              ) : null}
            </span>
          </label>

          {currentCase && currentCase.contactAttempts >= 2 && contactAttempt ? (
            <div className='mt-2 rounded-lg border border-amber-200 bg-amber-50 p-3'>
              <p className='text-sm text-amber-800'>
                <strong>Warning:</strong> This will be attempt #{currentCase.contactAttempts + 1}.
                {currentCase.contactAttempts + 1 >= 3
                  ? ' This will trigger an automatic decision escalation to Senior Coordinator.'
                  : ''}
              </p>
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant='secondary' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (!actionType || !externalSystem || !notes.trim()) return;
              onSubmit({
                title: actionType,
                externalSystem,
                notes,
                markAsContactAttempt: contactAttempt
              });
              onOpenChange(false);
            }}
          >
            Log EXTERNAL STEP
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

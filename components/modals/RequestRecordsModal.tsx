'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Info } from 'lucide-react';

interface RequestRecordsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDocumentName?: string;
  onSubmit: (payload: { documentName: string; notes: string; isExternal: boolean; assignTo: 'clinic' | 'front-desk' }) => void;
}

export function RequestRecordsModal({ open, onOpenChange, defaultDocumentName, onSubmit }: RequestRecordsModalProps) {
  const [documentName, setDocumentName] = useState(defaultDocumentName || '');
  const [notes, setNotes] = useState('');
  const [requestType, setRequestType] = useState<'clinic' | 'external'>('clinic');

  useEffect(() => {
    if (!open) return;
    setDocumentName(defaultDocumentName || '');
  }, [defaultDocumentName, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>Request Records</DialogTitle>
        </DialogHeader>

        <div className='space-y-4'>
          <div>
            <Label>Document Name</Label>
            <Input
              value={documentName}
              onChange={(event) => setDocumentName(event.target.value)}
              placeholder='e.g., Hepatitis Panel, PCP Records'
            />
          </div>

          <div>
            <Label className='mb-2 flex items-center gap-1'>
              Request Type
              <span title='Clinic requests route to portal users; External retrieval creates a front-desk external-step workflow.'>
                <Info className='h-3.5 w-3.5 text-slate-400' />
              </span>
            </Label>
            <RadioGroup value={requestType} onValueChange={(value) => setRequestType(value as 'clinic' | 'external')}>
              <div className='flex items-center space-x-2'>
                <RadioGroupItem value='clinic' id='request-clinic' />
                <label htmlFor='request-clinic' className='text-sm'>
                  Request from Dialysis Clinic (routes to Clinic Portal)
                </label>
              </div>
              <div className='flex items-center space-x-2'>
                <RadioGroupItem value='external' id='request-external' />
                <label htmlFor='request-external' className='text-sm'>
                  External Retrieval - EXTERNAL STEP (routes to Front Desk)
                </label>
              </div>
            </RadioGroup>
          </div>

          {requestType === 'external' ? (
            <div className='rounded-lg border border-amber-200 bg-amber-50 p-3'>
              <p className='text-sm text-amber-800'>
                This creates an EXTERNAL STEP task for Front Desk to retrieve records via phone, fax, or external systems.
              </p>
            </div>
          ) : null}

          <div>
            <Label>Notes / Instructions</Label>
            <Textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder='Any specific instructions for retrieval...'
            />
          </div>
        </div>

        <DialogFooter className='flex-row gap-2'>
          <Button variant='secondary' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (!documentName.trim()) return;
              onSubmit({
                documentName: documentName.trim(),
                notes: notes.trim(),
                isExternal: requestType === 'external',
                assignTo: requestType === 'external' ? 'front-desk' : 'clinic'
              });
              setDocumentName('');
              setNotes('');
              setRequestType('clinic');
              onOpenChange(false);
            }}
          >
            Create Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

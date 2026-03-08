'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface RequestRecordsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: { documentName: string; notes: string }) => void;
}

export function RequestRecordsModal({ open, onOpenChange, onSubmit }: RequestRecordsModalProps) {
  const [documentName, setDocumentName] = useState('');
  const [notes, setNotes] = useState('');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>Create Retrieval Task</DialogTitle>
        </DialogHeader>

        <div className='space-y-3'>
          <div>
            <p className='mb-2 text-sm font-semibold'>Document *</p>
            <Input value={documentName} onChange={(event) => setDocumentName(event.target.value)} placeholder='e.g. Hepatitis Panel' />
          </div>

          <div>
            <p className='mb-2 text-sm font-semibold'>Notes</p>
            <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} />
          </div>
        </div>

        <DialogFooter>
          <Button variant='secondary' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (!documentName.trim()) return;
              onSubmit({ documentName, notes });
              onOpenChange(false);
            }}
          >
            Create Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

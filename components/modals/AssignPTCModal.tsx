'use client';

import { useState } from 'react';
import { Case } from '@/types';
import { mockUsers } from '@/lib/data/mockUsers';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';

interface AssignPTCModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentCase: Case;
  onAssign: (ptcUserId: string) => void;
}

export function AssignPTCModal({ open, onOpenChange, currentCase, onAssign }: AssignPTCModalProps) {
  const ptcUsers = mockUsers.filter((user) => user.role === 'ptc');
  const [selected, setSelected] = useState(ptcUsers[0]?.id ?? '');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>Assign PTC</DialogTitle>
        </DialogHeader>

        <div className='space-y-3'>
          <p className='text-sm text-slate-600'>
            Case {currentCase.caseNumber} ({currentCase.patient.lastName}, {currentCase.patient.firstName})
          </p>

          <div>
            <p className='mb-2 text-sm font-semibold'>Select PTC *</p>
            <Select value={selected} onChange={(event) => setSelected(event.target.value)}>
              {ptcUsers.map((ptc) => (
                <option key={ptc.id} value={ptc.id}>
                  {ptc.name}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant='secondary' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onAssign(selected);
              onOpenChange(false);
            }}
          >
            Assign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

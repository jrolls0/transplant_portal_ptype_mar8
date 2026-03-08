'use client';

import { useState } from 'react';
import { formatISO, addDays } from 'date-fns';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Task, UserRole } from '@/types';

interface CreateTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (payload: {
    title: string;
    type: Task['type'];
    assignedToRole: UserRole;
    dueDate: string;
    description: string;
    isExternalStep: boolean;
    externalSystem?: string;
  }) => void;
}

export function CreateTaskModal({ open, onOpenChange, onCreate }: CreateTaskModalProps) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<Task['type']>('send-message');
  const [assignedToRole, setAssignedToRole] = useState<UserRole>('front-desk');
  const [dueDate, setDueDate] = useState(formatISO(addDays(new Date(), 2)));
  const [description, setDescription] = useState('');
  const [external, setExternal] = useState(false);
  const [externalSystem, setExternalSystem] = useState('');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-xl'>
        <DialogHeader>
          <DialogTitle>Create Task</DialogTitle>
        </DialogHeader>

        <div className='space-y-4'>
          <div>
            <p className='mb-2 text-sm font-semibold'>Title *</p>
            <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder='Task title' />
          </div>

          <div className='grid gap-3 md:grid-cols-2'>
            <div>
              <p className='mb-2 text-sm font-semibold'>Type *</p>
              <Select value={type} onChange={(event) => setType(event.target.value as Task['type'])}>
                <option value='send-message'>Send Message</option>
                <option value='review-document'>Review Document</option>
                <option value='request-records'>Request Records</option>
                <option value='specialist-review'>Specialist Review</option>
                <option value='log-external-step'>Log External Step</option>
                <option value='education-follow-up'>Education Follow-up</option>
              </Select>
            </div>

            <div>
              <p className='mb-2 text-sm font-semibold'>Assign To Role *</p>
              <Select value={assignedToRole} onChange={(event) => setAssignedToRole(event.target.value as UserRole)}>
                <option value='front-desk'>Front Desk</option>
                <option value='ptc'>PTC</option>
                <option value='senior-coordinator'>Senior Coordinator</option>
                <option value='financial'>Financial</option>
                <option value='dietitian'>Dietitian</option>
                <option value='social-work'>Social Work</option>
                <option value='nephrology'>Nephrology</option>
              </Select>
            </div>
          </div>

          <div>
            <p className='mb-2 text-sm font-semibold'>Due Date *</p>
            <Input type='datetime-local' value={new Date(dueDate).toISOString().slice(0, 16)} onChange={(event) => setDueDate(new Date(event.target.value).toISOString())} />
          </div>

          <div>
            <p className='mb-2 text-sm font-semibold'>Description</p>
            <Textarea value={description} onChange={(event) => setDescription(event.target.value)} />
          </div>

          <label className='flex items-center gap-2 text-sm'>
            <input type='checkbox' checked={external} onChange={(event) => setExternal(event.target.checked)} className='h-4 w-4' />
            Mark as EXTERNAL STEP
          </label>

          {external ? (
            <div>
              <p className='mb-2 text-sm font-semibold'>External System</p>
              <Input value={externalSystem} onChange={(event) => setExternalSystem(event.target.value)} placeholder='Surginet, Cerner, Phone, Fax...' />
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant='secondary' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (!title.trim()) return;
              onCreate({
                title,
                type,
                assignedToRole,
                dueDate,
                description,
                isExternalStep: external,
                externalSystem: external ? externalSystem : undefined
              });
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

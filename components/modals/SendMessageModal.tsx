'use client';

import { useEffect, useState } from 'react';
import { Case } from '@/types';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Info } from 'lucide-react';

interface SendMessageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentCase: Case;
  onSend: (payload: {
    recipients: { type: 'patient' | 'care-partner' | 'clinic-dusw' | 'clinic-nephrologist' | 'staff'; name: string }[];
    body: string;
    markAsContactAttempt: boolean;
  }) => void;
}

export function SendMessageModal({ open, onOpenChange, currentCase, onSend }: SendMessageModalProps) {
  const canMessageCarePartner = Boolean(currentCase.carePartner && currentCase.consent.carePartnerConsent);
  const options = [
    { key: 'patient', label: `${currentCase.patient.firstName} ${currentCase.patient.lastName} (Patient)` as const },
    ...(currentCase.carePartner
      ? [
          {
            key: 'care-partner',
            label: `${currentCase.carePartner.name} (Emergency Contact)${!canMessageCarePartner ? ' - No consent' : ''}` as const
          }
        ]
      : []),
    { key: 'clinic-dusw', label: `${currentCase.referringClinic} - DUSW Contact` as const },
    { key: 'clinic-nephrologist', label: `${currentCase.referringClinic} - Nephrologist Contact` as const }
  ];

  const [selected, setSelected] = useState<string[]>(['patient']);
  const [template, setTemplate] = useState('');
  const [body, setBody] = useState(`Hi ${currentCase.patient.firstName},\n\n`);
  const [contactAttempt, setContactAttempt] = useState(false);

  useEffect(() => {
    setSelected((current) => {
      const base = current.filter((value) => value !== 'care-partner');
      if (canMessageCarePartner && current.includes('care-partner')) {
        return [...base, 'care-partner'];
      }
      return base;
    });
  }, [canMessageCarePartner, currentCase.id]);

  const toggle = (value: string) => {
    if (value === 'care-partner' && !canMessageCarePartner) return;
    setSelected((current) => (current.includes(value) ? current.filter((item) => item !== value) : [...current, value]));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-xl'>
        <DialogHeader>
          <DialogTitle>Send Message</DialogTitle>
        </DialogHeader>

        <div className='space-y-4'>
          <div>
            <p className='mb-2 text-sm font-semibold text-slate-700'>To *</p>
            <div className='space-y-2 rounded-lg border border-slate-200 p-3'>
              {options.map((option) => (
                <label key={option.key} className='flex items-center gap-2 text-sm'>
                  <Checkbox
                    checked={selected.includes(option.key)}
                    disabled={option.key === 'care-partner' && !canMessageCarePartner}
                    onChange={() => toggle(option.key)}
                  />
                  <span className={option.key === 'care-partner' && !canMessageCarePartner ? 'text-slate-400' : ''}>
                    {option.label}
                    {option.key === 'care-partner' && !canMessageCarePartner ? (
                      <span className='ml-2 text-xs text-amber-600'>(Patient has not consented)</span>
                    ) : null}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <p className='mb-2 text-sm font-semibold text-slate-700'>Template (optional)</p>
            <Select value={template} onChange={(event) => setTemplate(event.target.value)}>
              <option value=''>Select template...</option>
              <option value='records-request'>Request Missing Records</option>
              <option value='education-reminder'>Education Reminder</option>
              <option value='scheduling-reminder'>Scheduling Reminder</option>
            </Select>
          </div>

          <div>
            <p className='mb-2 text-sm font-semibold text-slate-700'>Message *</p>
            <Textarea value={body} onChange={(event) => setBody(event.target.value)} />
          </div>

          <label className='flex items-center gap-2 text-sm text-slate-700'>
            <Checkbox checked={contactAttempt} onChange={(event) => setContactAttempt(event.target.checked)} />
            Mark as contact attempt
            <span title='Contact attempts increment outreach counters and can trigger an automatic Senior Coordinator decision at 3 attempts.'>
              <Info className='h-3.5 w-3.5 text-slate-400' />
            </span>
          </label>

          <p className='text-xs text-slate-500'>
            Messages are sent in-app. If SMS/email consent exists, only notification alerts are sent (no PHI).
          </p>
        </div>

        <DialogFooter>
          <Button variant='secondary' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (!body.trim() || selected.length === 0) return;

              onSend({
                recipients: selected.map((item) => ({
                  type: item as 'patient' | 'care-partner' | 'clinic-dusw' | 'clinic-nephrologist' | 'staff',
                  name:
                    item === 'patient'
                      ? `${currentCase.patient.firstName} ${currentCase.patient.lastName}`
                      : item === 'care-partner'
                        ? currentCase.carePartner?.name ?? 'Emergency Contact'
                        : item === 'clinic-dusw'
                          ? `${currentCase.referringClinic} DUSW`
                          : `${currentCase.referringClinic} Nephrologist`
                })),
                body,
                markAsContactAttempt: contactAttempt
              });
              onOpenChange(false);
            }}
          >
            Send Message
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

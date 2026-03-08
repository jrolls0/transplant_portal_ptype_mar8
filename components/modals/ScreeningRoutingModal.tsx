'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, AlertTriangle, CheckCircle } from 'lucide-react';
import { Case } from '@/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ScreeningRoutingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentCase: Case;
  onRoute: (destination: 'financial' | 'senior', notes: string) => void;
}

export function ScreeningRoutingModal({ open, onOpenChange, currentCase, onRoute }: ScreeningRoutingModalProps) {
  const [notes, setNotes] = useState('');
  const [destination, setDestination] = useState<'financial' | 'senior' | null>(null);

  useEffect(() => {
    if (!open) {
      setNotes('');
      setDestination(null);
    }
  }, [open]);

  const flagsExcludingAssignPTC = currentCase.flags.filter((flag) => flag !== 'Assign PTC');

  const handleSubmit = () => {
    if (!destination) return;
    if (destination === 'senior' && !notes.trim()) return;
    onRoute(destination, notes.trim());
    setNotes('');
    setDestination(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-lg'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <ArrowRight className='h-5 w-5' />
            Route Initial Screening
          </DialogTitle>
          <DialogDescription>
            Review Inclusion/Exclusion responses and route to Financial Screening or Senior Coordinator review.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='rounded-lg bg-slate-50 p-3'>
            <p className='text-lg font-semibold text-slate-900'>
              {currentCase.patient.lastName}, {currentCase.patient.firstName}
            </p>
            <p className='text-sm text-slate-600'>
              Case: {currentCase.caseNumber} • DOB: {currentCase.patient.dateOfBirth}
            </p>
            <p className='text-sm text-slate-600'>Clinic: {currentCase.referringClinic}</p>
          </div>

          <div
            className={`flex items-center gap-2 rounded-lg border p-3 ${
              currentCase.ieConfirmReviewComplete ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'
            }`}
          >
            {currentCase.ieConfirmReviewComplete ? (
              <>
                <CheckCircle className='h-5 w-5 text-emerald-600' />
                <span className='text-sm font-medium text-emerald-800'>I/E Review Confirmed</span>
              </>
            ) : (
              <>
                <AlertTriangle className='h-5 w-5 text-amber-600' />
                <span className='text-sm font-medium text-amber-800'>I/E Review Not Yet Confirmed</span>
              </>
            )}
          </div>

          {flagsExcludingAssignPTC.length > 0 ? (
            <div className='rounded-lg border border-amber-200 bg-amber-50 p-3'>
              <p className='mb-1 flex items-center gap-2 text-sm font-semibold text-amber-800'>
                <AlertTriangle className='h-4 w-4' />
                System Flags Detected
              </p>
              <ul className='list-disc pl-5 text-sm text-amber-700'>
                {flagsExcludingAssignPTC.map((flag) => (
                  <li key={flag}>{flag}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className='space-y-2'>
            <Label className='text-sm font-semibold'>Select Routing Destination</Label>

            <button
              type='button'
              onClick={() => setDestination('financial')}
              className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
                destination === 'financial'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <p className='font-semibold text-slate-900'>Route to Financial Screening</p>
              <p className='text-sm text-slate-600'>Proceed with insurance verification and financial eligibility review.</p>
            </button>

            <button
              type='button'
              onClick={() => setDestination('senior')}
              className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
                destination === 'senior'
                  ? 'border-amber-500 bg-amber-50'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <p className='font-semibold text-slate-900'>Route to Senior Coordinator Review</p>
              <p className='text-sm text-slate-600'>Use when responses are unclear or indicate potential concerns.</p>
            </button>
          </div>

          <div className='space-y-2'>
            <Label className='text-sm font-semibold'>
              Notes {destination === 'senior' ? <span className='text-red-500'>*</span> : <span className='text-slate-400'>(optional)</span>}
            </Label>
            <Textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className={destination === 'senior' ? 'min-h-[100px]' : 'min-h-[72px]'}
              placeholder={
                destination === 'senior'
                  ? 'Describe why Senior Coordinator review is required...'
                  : 'Any notes for the next team...'
              }
            />
          </div>

          <div className='flex gap-3'>
            <Button variant='secondary' className='flex-1' onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button className='flex-1' onClick={handleSubmit} disabled={!destination || (destination === 'senior' && !notes.trim())}>
              {destination === 'financial'
                ? 'Route to Financial →'
                : destination === 'senior'
                  ? 'Route to Senior →'
                  : 'Select Destination'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  ExternalLink,
  FileText,
  Flag,
  User,
  XCircle
} from 'lucide-react';
import { Case, Decision, Document } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface DecisionPanelProps {
  decision?: Decision;
  currentCase?: Case;
  documents?: Document[];
  onSubmit: (option: string, rationale: string) => void;
}

export function DecisionPanel({ decision, currentCase, documents, onSubmit }: DecisionPanelProps) {
  const [selected, setSelected] = useState('');
  const [rationale, setRationale] = useState('');

  if (!decision) {
    return (
      <div className='rounded-xl border border-slate-200 bg-white p-6 text-center'>
        <FileText className='mx-auto mb-3 h-12 w-12 text-slate-300' />
        <p className='text-sm text-slate-500'>Select a decision from the queue to review.</p>
      </div>
    );
  }

  const caseDocuments = documents?.filter((document) => document.caseId === decision.caseId) ?? [];
  const missingDocs = caseDocuments.filter((document) => document.status === 'required');
  const pendingDocs = caseDocuments.filter((document) => document.status === 'received' || document.status === 'needs-review');
  const hardBlockMissing = caseDocuments.filter((document) => document.isHardBlock && document.status !== 'validated');

  const handleSubmit = () => {
    if (!selected || !rationale.trim()) return;
    onSubmit(selected, rationale.trim());
    setSelected('');
    setRationale('');
  };

  return (
    <div className='overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm'>
      {currentCase ? (
        <div className='border-b border-slate-200 bg-slate-50 p-4'>
          <div className='flex items-start justify-between'>
            <div>
              <p className='text-xl font-bold text-slate-900'>
                {currentCase.patient.lastName}, {currentCase.patient.firstName}
              </p>
              <p className='mt-1 text-sm text-slate-600'>
                Case: {currentCase.caseNumber} • DOB: {currentCase.patient.dateOfBirth}
              </p>
              <p className='text-sm text-slate-600'>Clinic: {currentCase.referringClinic}</p>
            </div>
            <Link href={`/cases/${currentCase.id}`}>
              <Button variant='outline' size='sm'>
                <ExternalLink className='mr-1 h-4 w-4' />
                Full Case
              </Button>
            </Link>
          </div>

          <div className='mt-3 flex flex-wrap gap-4 text-sm'>
            <div className='flex items-center gap-1 text-slate-600'>
              <Clock className='h-4 w-4' />
              <span>
                Stage: <strong>{currentCase.stage.replace(/-/g, ' ')}</strong>
              </span>
            </div>
            <div className='flex items-center gap-1 text-slate-600'>
              <Calendar className='h-4 w-4' />
              <span>
                <strong>{currentCase.daysInStage}</strong> days in stage
              </span>
            </div>
            {currentCase.assignedPTC ? (
              <div className='flex items-center gap-1 text-slate-600'>
                <User className='h-4 w-4' />
                <span>
                  PTC: <strong>{currentCase.assignedPTC.name}</strong>
                </span>
              </div>
            ) : null}
          </div>

          {currentCase.flags.length > 0 ? (
            <div className='mt-3 flex flex-wrap gap-1'>
              {currentCase.flags.map((flag) => (
                <span
                  key={flag}
                  className='inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800'
                >
                  <Flag className='h-3 w-3' />
                  {flag}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className='space-y-4 p-4'>
        <div>
          <p className='text-lg font-semibold text-slate-900'>{decision.title}</p>
          <p className='mt-1 text-xs uppercase tracking-wide text-slate-500'>Decision Type: {decision.type.replace(/-/g, ' ')}</p>
        </div>

        {hardBlockMissing.length > 0 ? (
          <div className='rounded-lg border border-red-200 bg-red-50 p-3'>
            <p className='flex items-center gap-2 text-sm font-semibold text-red-800'>
              <AlertOctagon className='h-4 w-4' />
              Hard-Block Documents Missing
            </p>
            <ul className='mt-1 list-disc pl-5 text-sm text-red-700'>
              {hardBlockMissing.map((document) => (
                <li key={document.id}>{document.name}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {(decision.type === 'partial-packet' || decision.type === 'hard-block-override') && (
          <div className='rounded-lg border border-slate-200 bg-slate-50 p-3'>
            <p className='mb-2 text-sm font-semibold text-slate-700'>Document Status</p>

            {missingDocs.length > 0 ? (
              <div className='mb-2'>
                <p className='flex items-center gap-1 text-xs font-medium text-red-600'>
                  <XCircle className='h-3 w-3' />
                  Not Received ({missingDocs.length})
                </p>
                <ul className='list-disc pl-5 text-xs text-slate-600'>
                  {missingDocs.slice(0, 5).map((document) => (
                    <li key={document.id}>
                      {document.name}
                      {document.isHardBlock ? <span className='font-semibold text-red-600'> (HARD-BLOCK)</span> : null}
                    </li>
                  ))}
                  {missingDocs.length > 5 ? <li>+{missingDocs.length - 5} more...</li> : null}
                </ul>
              </div>
            ) : null}

            {pendingDocs.length > 0 ? (
              <div>
                <p className='flex items-center gap-1 text-xs font-medium text-amber-600'>
                  <Clock className='h-3 w-3' />
                  Pending Review ({pendingDocs.length})
                </p>
                <ul className='list-disc pl-5 text-xs text-slate-600'>
                  {pendingDocs.slice(0, 3).map((document) => (
                    <li key={document.id}>{document.name}</li>
                  ))}
                  {pendingDocs.length > 3 ? <li>+{pendingDocs.length - 3} more...</li> : null}
                </ul>
              </div>
            ) : null}
          </div>
        )}

        {decision.type === 'no-response-3x' && currentCase ? (
          <div className='rounded-lg border border-amber-200 bg-amber-50 p-3'>
            <p className='flex items-center gap-2 text-sm font-semibold text-amber-800'>
              <AlertTriangle className='h-4 w-4' />
              Contact Attempts: {currentCase.contactAttempts}
            </p>
            {currentCase.lastContactAttempt ? (
              <p className='mt-1 text-xs text-amber-700'>
                Last attempt: {new Date(currentCase.lastContactAttempt).toLocaleString()}
              </p>
            ) : null}
            <p className='mt-2 text-xs text-amber-600'>
              Patient has not responded to {currentCase.contactAttempts} documented outreach attempts.
            </p>
          </div>
        ) : null}

        <div className='space-y-2'>
          <p className='text-sm font-semibold text-slate-700'>Your Decision</p>
          {decision.options.map((option) => (
            <label
              key={option}
              className={`flex cursor-pointer items-start gap-3 rounded-lg border-2 p-3 transition-all ${
                selected === option ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <input
                type='radio'
                checked={selected === option}
                onChange={() => setSelected(option)}
                className='mt-0.5 h-4 w-4'
              />
              <span className='text-sm text-slate-900'>{option}</span>
            </label>
          ))}
        </div>

        <div>
          <p className='mb-1 text-sm font-semibold text-slate-700'>
            Rationale <span className='text-red-500'>*</span>
          </p>
          <Textarea
            value={rationale}
            onChange={(event) => setRationale(event.target.value)}
            className='min-h-[100px]'
            placeholder='Document your reasoning for this decision...'
          />
          <p className='mt-1 text-xs text-slate-500'>Required: this rationale is stored in the audit trail.</p>
        </div>

        <Button className='w-full' disabled={!selected || !rationale.trim()} onClick={handleSubmit}>
          <CheckCircle className='mr-2 h-4 w-4' />
          Submit Decision
        </Button>
      </div>
    </div>
  );
}

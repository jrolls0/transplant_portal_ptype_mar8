'use client';

import { CheckCircle, Download, File, XCircle } from 'lucide-react';
import { Document } from '@/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface DocumentViewerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: Document | null;
  onValidate?: () => void;
  onReject?: () => void;
}

const getPlaceholderContent = (doc: Document): { title: string; lines: string[] } => {
  const type = doc.type.toLowerCase();

  if (type.includes('government-id') || type.includes('gov-id-front') || type.includes('id-front')) {
    return {
      title: 'Government-Issued ID (Front)',
      lines: [
        'STATE OF DELAWARE',
        'DRIVER LICENSE',
        '-------------------------',
        'DL: D12345678',
        'CLASS: D',
        'DOB: [PATIENT DOB]',
        'EXP: 12/2028',
        '-------------------------',
        '[PHOTO PLACEHOLDER]',
        '-------------------------',
        '[PATIENT NAME]',
        '[ADDRESS LINE 1]',
        '[CITY, STATE ZIP]'
      ]
    };
  }

  if (type.includes('gov-id-back') || type.includes('id-back')) {
    return {
      title: 'Government-Issued ID (Back)',
      lines: [
        '-------------------------',
        'BARCODE PLACEHOLDER',
        '|||||||||||||||||||||||||',
        '-------------------------',
        'ORGAN DONOR: YES',
        'RESTRICTIONS: NONE',
        '-------------------------',
        'Signature: _______________'
      ]
    };
  }

  if ((type.includes('insurance') && type.includes('front')) || type === 'insurance-card') {
    return {
      title: 'Insurance Card (Front)',
      lines: [
        '+-------------------------------+',
        '|   BLUE CROSS BLUE SHIELD      |',
        '|   of Delaware                 |',
        '+-------------------------------+',
        '| Member: [PATIENT NAME]        |',
        '| ID: XYZ123456789              |',
        '| Group: 987654                 |',
        '| Plan: PPO                     |',
        '+-------------------------------+',
        '| PCP Copay: $25                |',
        '| Specialist: $50               |',
        '| ER: $150                      |',
        '+-------------------------------+'
      ]
    };
  }

  if (type.includes('insurance') && type.includes('back')) {
    return {
      title: 'Insurance Card (Back)',
      lines: [
        '+-------------------------------+',
        '| CLAIMS ADDRESS:               |',
        '| PO Box 12345                  |',
        '| Wilmington, DE 19801          |',
        '+-------------------------------+',
        '| Member Services: 1-800-XXX    |',
        '| Pre-Auth: 1-800-XXX-XXXX      |',
        '| Pharmacy: 1-800-XXX-XXXX      |',
        '+-------------------------------+',
        '| IN EMERGENCY: Present card    |',
        '| to nearest ER                 |',
        '+-------------------------------+'
      ]
    };
  }

  if (type.includes('2728') || type.includes('cms-2728')) {
    return {
      title: 'CMS-2728 (ESRD Medical Evidence Report)',
      lines: [
        '===================================',
        'DEPARTMENT OF HEALTH AND HUMAN SERVICES',
        'CENTERS FOR MEDICARE & MEDICAID SERVICES',
        'ESRD MEDICAL EVIDENCE REPORT',
        'MEDICARE ENTITLEMENT AND/OR',
        'PATIENT REGISTRATION',
        '===================================',
        'Form Approved OMB No. 0938-0046',
        '',
        'SECTION I - PATIENT IDENTIFICATION',
        '[Patient identifying information]',
        '',
        'SECTION II - PRIMARY CAUSE OF RENAL FAILURE',
        '[Diagnosis codes and information]',
        '',
        'SECTION III - COMORBID CONDITIONS',
        '[Checkbox selections for conditions]',
        '',
        'PHYSICIAN SIGNATURE: _______________',
        'DATE: ___/___/______'
      ]
    };
  }

  if (type.includes('roi') || type.includes('release')) {
    return {
      title: 'Release of Information (ROI)',
      lines: [
        '===================================',
        'AUTHORIZATION FOR RELEASE OF',
        'PROTECTED HEALTH INFORMATION',
        '===================================',
        '',
        'I, [PATIENT NAME], authorize the',
        'release of my medical records to:',
        '',
        'ChristianaCare Transplant Center',
        '4755 Ogletown-Stanton Road',
        'Newark, DE 19718',
        '',
        'Purpose: Kidney transplant evaluation',
        '',
        'Records requested:',
        '[x] Complete medical history',
        '[x] Lab results',
        '[x] Dialysis records',
        '[x] Imaging studies',
        '',
        'Signature: _______________',
        'Date: ___/___/______'
      ]
    };
  }

  if (type.includes('lab') || type.includes('bloodwork')) {
    return {
      title: 'Laboratory Results',
      lines: [
        '===================================',
        'LABORATORY REPORT',
        '===================================',
        'Patient: [PATIENT NAME]',
        'DOB: [DATE]',
        'Collection Date: [DATE]',
        '',
        'COMPREHENSIVE METABOLIC PANEL',
        '---------------------------------',
        'BUN:        45 mg/dL      (H)',
        'Creatinine: 8.2 mg/dL     (H)',
        'eGFR:       12 mL/min',
        'Glucose:    102 mg/dL',
        'Sodium:     138 mEq/L',
        'Potassium:  4.8 mEq/L'
      ]
    };
  }

  if (type.includes('dialysis')) {
    return {
      title: 'Dialysis Treatment Records',
      lines: [
        '===================================',
        'DIALYSIS TREATMENT SUMMARY',
        '===================================',
        'Patient: [PATIENT NAME]',
        'Facility: DaVita Dialysis Center',
        'Period: Last 30 Days',
        '',
        'Modality: Hemodialysis',
        'Schedule: MWF',
        'Duration: 4 hours per session',
        'Access: AV Fistula (Left arm)',
        '',
        'Pre-dialysis weight: 185 lbs',
        'Post-dialysis weight: 181 lbs'
      ]
    };
  }

  return {
    title: doc.name,
    lines: [
      '===================================',
      'DOCUMENT PLACEHOLDER',
      '===================================',
      '',
      `Document Type: ${doc.type}`,
      `Source: ${doc.source}`,
      `Ownership: ${doc.ownership}`,
      '',
      '[Document content would appear here]'
    ]
  };
};

export function DocumentViewerModal({ open, onOpenChange, document, onValidate, onReject }: DocumentViewerModalProps) {
  if (!document) return null;

  const placeholder = getPlaceholderContent(document);
  const canReview = document.status === 'received' || document.status === 'needs-review';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[85vh] max-w-2xl overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <File className='h-5 w-5' />
            {placeholder.title}
          </DialogTitle>
        </DialogHeader>

        <div className='flex flex-wrap gap-4 border-b pb-3 text-sm text-slate-600'>
          <span>
            Status: <strong className='text-slate-900'>{document.status}</strong>
          </span>
          <span>
            Source: <strong className='text-slate-900'>{document.source}</strong>
          </span>
          {document.uploadedAt ? (
            <span>
              Uploaded: <strong className='text-slate-900'>{new Date(document.uploadedAt).toLocaleDateString()}</strong>
            </span>
          ) : null}
          {document.isHardBlock ? <span className='font-semibold text-red-600'>Hard-block document</span> : null}
        </div>

        <div className='rounded-lg bg-slate-100 p-4 font-mono text-sm'>
          <div className='min-h-[300px] rounded border border-slate-300 bg-white p-6 shadow-sm'>
            {placeholder.lines.map((line, index) => (
              <div key={`${document.id}-${index}`} className='whitespace-pre text-slate-700'>
                {line || '\u00A0'}
              </div>
            ))}
          </div>
        </div>

        {document.reviewNotes ? (
          <div className='rounded-lg border border-amber-200 bg-amber-50 p-3'>
            <p className='text-sm font-semibold text-amber-800'>Review Notes</p>
            <p className='text-sm text-amber-700'>{document.reviewNotes}</p>
          </div>
        ) : null}

        <div className='flex items-center justify-between border-t pt-2'>
          <Button variant='outline' size='sm'>
            <Download className='mr-1 h-4 w-4' />
            Download Original
          </Button>

          {canReview ? (
            <div className='flex gap-2'>
              {onReject ? (
                <Button
                  variant='outline'
                  size='sm'
                  className='text-red-600 hover:bg-red-50 hover:text-red-700'
                  onClick={() => {
                    onReject();
                    onOpenChange(false);
                  }}
                >
                  <XCircle className='mr-1 h-4 w-4' />
                  Reject
                </Button>
              ) : null}
              {onValidate ? (
                <Button
                  size='sm'
                  className='bg-emerald-600 hover:bg-emerald-700'
                  onClick={() => {
                    onValidate();
                    onOpenChange(false);
                  }}
                >
                  <CheckCircle className='mr-1 h-4 w-4' />
                  Approve Document
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

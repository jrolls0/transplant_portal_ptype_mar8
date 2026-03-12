'use client';

import { useState } from 'react';
import { AlertOctagon, AlertTriangle, CheckCircle, Clock, Eye, File, FileX } from 'lucide-react';
import { Document } from '@/types';
import { Button } from '@/components/ui/button';
import { DocumentViewerModal } from '@/components/modals/DocumentViewerModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface DocumentRowProps {
  document: Document;
  onValidate?: () => void;
  onReject?: (reviewNotes: string) => void;
  onRequest?: () => void;
  highlighted?: boolean;
}

const statusConfig = {
  required: { icon: Clock, color: 'text-slate-400', bg: 'bg-slate-100', label: 'Not Received' },
  received: { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Received' },
  'needs-review': { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-100', label: 'Needs Review' },
  validated: { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100', label: 'Validated' },
  rejected: { icon: FileX, color: 'text-red-600', bg: 'bg-red-100', label: 'Rejected' },
  expired: { icon: AlertOctagon, color: 'text-orange-600', bg: 'bg-orange-100', label: 'Expired' }
};

const ownershipLabels: Record<Document['ownership'], string> = {
  dusw: 'DUSW',
  nephrologist: 'Nephrologist',
  shared: 'Shared',
  patient: 'Patient'
};

export function DocumentRow({ document, onValidate, onReject, onRequest, highlighted = false }: DocumentRowProps) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectNotes, setRejectNotes] = useState('');
  const config = statusConfig[document.status];
  const Icon = config.icon;
  const canView = document.status !== 'required';

  return (
    <>
      <div
        data-doc-focus-target={highlighted ? 'true' : undefined}
        className={`flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3 ${
          document.isHardBlock && document.status !== 'validated'
            ? 'border-red-300 bg-red-50'
            : highlighted
              ? 'border-blue-300 bg-blue-50'
              : 'border-slate-200 bg-white'
        }`}
      >
        <div className='flex items-center gap-3'>
          <File className='h-5 w-5 text-slate-400' />
          <div>
            <div className='flex items-center gap-2'>
              <p className='text-sm font-medium text-slate-900'>{document.name}</p>
              {document.isHardBlock ? (
                <span className='rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700'>HARD-BLOCK</span>
              ) : null}
            </div>
            <p className='text-xs text-slate-500'>
              {ownershipLabels[document.ownership]} • {document.source === 'external-retrieval' ? 'External' : document.source}
            </p>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${config.bg} ${config.color}`}>
            <Icon className='h-3 w-3' />
            {config.label}
          </span>

          {canView ? (
            <Button size='sm' variant='outline' onClick={() => setViewerOpen(true)}>
              <Eye className='mr-1 h-4 w-4' />
              View
            </Button>
          ) : null}

          {(document.status === 'received' || document.status === 'needs-review') && onValidate ? (
            <Button size='sm' variant='secondary' onClick={onValidate}>
              Approve
            </Button>
          ) : null}
          {(document.status === 'received' || document.status === 'needs-review') && onReject ? (
            <Button size='sm' variant='ghost' onClick={() => setRejectOpen(true)}>
              Reject
            </Button>
          ) : null}
          {document.status === 'required' && onRequest ? (
            <Button size='sm' variant='secondary' onClick={onRequest}>
              Request
            </Button>
          ) : null}
          {document.status === 'validated' && document.reviewedAt ? (
            <span className='text-xs text-slate-500'>{new Date(document.reviewedAt).toLocaleDateString()}</span>
          ) : null}
        </div>
      </div>

      <DocumentViewerModal
        open={viewerOpen}
        onOpenChange={setViewerOpen}
        document={document}
        onValidate={onValidate}
        onReject={onReject ? () => setRejectOpen(true) : undefined}
      />

      <Dialog
        open={rejectOpen}
        onOpenChange={(open) => {
          setRejectOpen(open);
          if (!open) setRejectNotes('');
        }}
      >
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>Reject {document.name}</DialogTitle>
          </DialogHeader>
          <div className='space-y-3'>
            <p className='text-sm text-slate-600'>Add a rationale before rejecting this document.</p>
            <Textarea
              value={rejectNotes}
              onChange={(event) => setRejectNotes(event.target.value)}
              placeholder='Enter rejection rationale...'
              className='min-h-[120px]'
            />
            <div className='flex justify-end gap-2'>
              <Button variant='outline' onClick={() => setRejectOpen(false)}>
                Cancel
              </Button>
              <Button
                variant='secondary'
                disabled={!rejectNotes.trim()}
                onClick={() => {
                  if (!onReject || !rejectNotes.trim()) return;
                  onReject(rejectNotes.trim());
                  setRejectOpen(false);
                  setRejectNotes('');
                }}
              >
                Reject Document
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

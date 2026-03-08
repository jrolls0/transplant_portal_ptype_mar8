'use client';

import { useMemo, useState } from 'react';
import { Case, Document, Task } from '@/types';
import { Button } from '@/components/ui/button';
import { DocumentRow } from '@/components/shared/DocumentRow';
import { RequestRecordsModal } from '@/components/modals/RequestRecordsModal';

interface DocumentsTabProps {
  currentCase: Case;
  documents: Document[];
  onValidateDocument: (documentId: string, status?: 'validated' | 'rejected') => void;
  onCreateTask: (payload: {
    title: string;
    type: Task['type'];
    assignedToRole: Task['assignedToRole'];
    dueDate: string;
    description: string;
    isExternalStep: boolean;
    externalSystem?: string;
  }) => void;
}

export function DocumentsTab({ currentCase, documents, onValidateDocument, onCreateTask }: DocumentsTabProps) {
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [requestTarget, setRequestTarget] = useState<Document | null>(null);

  const patientDocs = useMemo(() => documents.filter((document) => document.ownership === 'patient'), [documents]);
  const clinicDocs = useMemo(() => documents.filter((document) => ['dusw', 'nephrologist'].includes(document.ownership)), [documents]);
  const externalDocs = useMemo(() => documents.filter((document) => document.source === 'external-retrieval'), [documents]);

  const requiredTotal = documents.filter((document) => document.status !== 'expired').length;
  const receivedTotal = documents.filter((document) => ['received', 'validated', 'needs-review'].includes(document.status)).length;
  const hardBlocksOpen = documents.filter((document) => document.isHardBlock && document.status !== 'validated').length;

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h3 className='text-sm font-semibold uppercase tracking-wide text-slate-500'>Document Checklist</h3>
        <Button variant='secondary'>+ Upload Document</Button>
      </div>

      <section className='space-y-2 rounded-xl border border-slate-200 bg-white p-4'>
        <h4 className='text-sm font-semibold text-slate-800'>Patient-Provided</h4>
        {patientDocs.map((document) => (
          <DocumentRow
            key={document.id}
            document={document}
            onValidate={() => onValidateDocument(document.id, 'validated')}
            onReject={() => onValidateDocument(document.id, 'rejected')}
          />
        ))}
      </section>

      <section className='space-y-2 rounded-xl border border-slate-200 bg-white p-4'>
        <h4 className='text-sm font-semibold text-slate-800'>Dialysis Clinic Packet</h4>
        {clinicDocs.map((document) => (
          <DocumentRow
            key={document.id}
            document={document}
            onValidate={() => onValidateDocument(document.id, 'validated')}
            onReject={() => onValidateDocument(document.id, 'rejected')}
            onRequest={
              document.status === 'required'
                ? () => {
                    setRequestTarget(document);
                    setRequestModalOpen(true);
                  }
                : undefined
            }
          />
        ))}
      </section>

      <section className='space-y-2 rounded-xl border border-slate-200 bg-white p-4'>
        <h4 className='text-sm font-semibold text-slate-800'>Externally Retrieved</h4>
        {externalDocs.map((document) => (
          <DocumentRow
            key={document.id}
            document={document}
            onValidate={() => onValidateDocument(document.id, 'validated')}
            onRequest={
              document.status === 'required'
                ? () => {
                    setRequestTarget(document);
                    setRequestModalOpen(true);
                  }
                : undefined
            }
          />
        ))}
      </section>

      <div className='rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700'>
        Summary: {receivedTotal} of {requiredTotal} required documents received. Hard-blocks:{' '}
        <span className={hardBlocksOpen > 0 ? 'font-semibold text-red-700' : 'font-semibold text-emerald-700'}>
          {hardBlocksOpen > 0 ? `${hardBlocksOpen} pending` : 'All cleared'}
        </span>
      </div>

      <RequestRecordsModal
        open={requestModalOpen}
        onOpenChange={setRequestModalOpen}
        onSubmit={({ documentName, notes }) => {
          onCreateTask({
            title: `Request from clinic: ${requestTarget?.name ?? documentName}`,
            type: 'request-records',
            assignedToRole: 'ptc',
            dueDate: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString(),
            description: notes,
            isExternalStep: false
          });
        }}
      />
    </div>
  );
}

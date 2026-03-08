'use client';

import { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, FileWarning, Upload } from 'lucide-react';
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
  const duswDocs = useMemo(() => documents.filter((document) => document.ownership === 'dusw'), [documents]);
  const nephDocs = useMemo(() => documents.filter((document) => document.ownership === 'nephrologist'), [documents]);
  const sharedDocs = useMemo(() => documents.filter((document) => document.ownership === 'shared'), [documents]);
  const externalDocs = useMemo(() => documents.filter((document) => document.source === 'external-retrieval'), [documents]);

  const requiredTotal = documents.filter((document) => document.status !== 'expired').length;
  const receivedTotal = documents.filter((document) => ['received', 'validated', 'needs-review'].includes(document.status)).length;
  const hardBlockDocs = documents.filter((document) => document.isHardBlock);
  const hardBlocksMissing = hardBlockDocs.filter((document) => document.status !== 'validated');
  const hardBlocksCleared = hardBlocksMissing.length === 0;
  const isRecordsStage = currentCase.stage === 'records-collection';

  return (
    <div className='space-y-4'>
      {isRecordsStage && hardBlocksMissing.length > 0 ? (
        <div className='rounded-xl border-2 border-red-300 bg-red-50 p-4'>
          <div className='flex items-start gap-3'>
            <FileWarning className='mt-0.5 h-6 w-6 flex-shrink-0 text-red-600' />
            <div className='flex-1'>
              <h3 className='text-lg font-semibold text-red-800'>Hard-Block: Case Cannot Advance</h3>
              <p className='mt-1 text-sm text-red-700'>
                The following required documents must be received and validated before this case can proceed:
              </p>
              <ul className='mt-2 space-y-1'>
                {hardBlocksMissing.map((document) => (
                  <li key={document.id} className='flex items-center gap-2 text-sm font-medium text-red-800'>
                    <AlertTriangle className='h-4 w-4' />
                    {document.name}
                    <span className='font-normal text-red-600'>
                      (
                      {document.status === 'required'
                        ? 'Not received'
                        : document.status === 'received'
                          ? 'Awaiting validation'
                          : document.status}
                      )
                    </span>
                  </li>
                ))}
              </ul>
              <p className='mt-3 text-xs text-red-600'>
                Senior Coordinator can override this block with documented rationale if necessary.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {isRecordsStage && hardBlocksCleared && hardBlockDocs.length > 0 ? (
        <div className='rounded-xl border border-emerald-200 bg-emerald-50 p-4'>
          <div className='flex items-center gap-3'>
            <CheckCircle2 className='h-6 w-6 text-emerald-600' />
            <div>
              <h3 className='font-semibold text-emerald-800'>Hard-Block Documents Cleared</h3>
              <p className='text-sm text-emerald-700'>All required blocking documents have been validated.</p>
            </div>
          </div>
        </div>
      ) : null}

      <div className='flex items-center justify-between'>
        <h3 className='text-sm font-semibold uppercase tracking-wide text-slate-500'>Document Checklist</h3>
        <Button variant='secondary'>
          <Upload className='mr-2 h-4 w-4' />
          Upload Document
        </Button>
      </div>

      <section className='space-y-2 rounded-xl border border-slate-200 bg-white p-4'>
        <h4 className='text-sm font-semibold text-slate-800'>Patient-Provided</h4>
        {patientDocs.length === 0 ? (
          <p className='text-sm text-slate-500'>No patient documents tracked.</p>
        ) : (
          patientDocs.map((document) => (
            <DocumentRow
              key={document.id}
              document={document}
              onValidate={() => onValidateDocument(document.id, 'validated')}
              onReject={() => onValidateDocument(document.id, 'rejected')}
            />
          ))
        )}
      </section>

      <section className='space-y-2 rounded-xl border border-slate-200 bg-white p-4'>
        <h4 className='text-sm font-semibold text-slate-800'>Dialysis Clinic Packet - DUSW Owned</h4>
        {duswDocs.length === 0 ? (
          <p className='text-sm text-slate-500'>No DUSW documents tracked.</p>
        ) : (
          duswDocs.map((document) => (
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
          ))
        )}
      </section>

      <section className='space-y-2 rounded-xl border border-slate-200 bg-white p-4'>
        <h4 className='text-sm font-semibold text-slate-800'>Dialysis Clinic Packet - Nephrologist Owned</h4>
        {nephDocs.length === 0 ? (
          <p className='text-sm text-slate-500'>No nephrologist documents tracked.</p>
        ) : (
          nephDocs.map((document) => (
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
          ))
        )}
      </section>

      {sharedDocs.length > 0 ? (
        <section className='space-y-2 rounded-xl border border-slate-200 bg-white p-4'>
          <h4 className='text-sm font-semibold text-slate-800'>Shared / Either Role</h4>
          {sharedDocs.map((document) => (
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
      ) : null}

      <section className='space-y-2 rounded-xl border border-slate-200 bg-white p-4'>
        <h4 className='text-sm font-semibold text-slate-800'>Externally Retrieved (EXTERNAL STEP)</h4>
        {externalDocs.length === 0 ? (
          <p className='text-sm text-slate-500'>No external records retrieved yet.</p>
        ) : (
          externalDocs.map((document) => (
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
          ))
        )}
        <Button
          variant='outline'
          size='sm'
          onClick={() => {
            setRequestTarget(null);
            setRequestModalOpen(true);
          }}
        >
          + Request External Records
        </Button>
      </section>

      <div className='rounded-xl border border-slate-200 bg-white p-4'>
        <div className='flex flex-wrap gap-4 text-sm'>
          <div>
            <span className='text-slate-600'>Documents:</span> <span className='font-semibold'>{receivedTotal} of {requiredTotal} received</span>
          </div>
          <div>
            <span className='text-slate-600'>Hard-blocks:</span>{' '}
            <span className={`font-semibold ${hardBlocksCleared ? 'text-emerald-700' : 'text-red-700'}`}>
              {hardBlocksCleared ? '✓ All cleared' : `${hardBlocksMissing.length} pending`}
            </span>
          </div>
        </div>
      </div>

      <RequestRecordsModal
        open={requestModalOpen}
        onOpenChange={setRequestModalOpen}
        defaultDocumentName={requestTarget?.name}
        onSubmit={({ documentName, notes, isExternal, assignTo }) => {
          onCreateTask({
            title: isExternal ? `EXTERNAL STEP: Retrieve ${documentName}` : `Request from clinic: ${documentName}`,
            type: isExternal ? 'log-external-step' : 'request-records',
            assignedToRole: assignTo === 'front-desk' ? 'front-desk' : 'ptc',
            dueDate: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString(),
            description: notes,
            isExternalStep: isExternal,
            externalSystem: isExternal ? 'Phone/Fax' : undefined
          });
        }}
      />
    </div>
  );
}

import { Document } from '@/types';
import { Button } from '@/components/ui/button';
import { AlertOctagon, AlertTriangle, CheckCircle, Clock, File, FileX } from 'lucide-react';

interface DocumentRowProps {
  document: Document;
  onValidate?: () => void;
  onReject?: () => void;
  onRequest?: () => void;
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

export function DocumentRow({ document, onValidate, onReject, onRequest }: DocumentRowProps) {
  const config = statusConfig[document.status];
  const Icon = config.icon;

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3 ${
        document.isHardBlock && document.status !== 'validated' ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'
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

        {(document.status === 'received' || document.status === 'needs-review') && onValidate ? (
          <Button size='sm' variant='secondary' onClick={onValidate}>
            Validate
          </Button>
        ) : null}
        {(document.status === 'received' || document.status === 'needs-review') && onReject ? (
          <Button size='sm' variant='ghost' onClick={onReject}>
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
  );
}

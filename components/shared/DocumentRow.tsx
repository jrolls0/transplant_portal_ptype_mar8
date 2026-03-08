import { Document } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface DocumentRowProps {
  document: Document;
  onValidate?: () => void;
  onReject?: () => void;
  onRequest?: () => void;
}

const statusVariant: Record<Document['status'], 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline'> = {
  required: 'outline',
  received: 'info',
  'needs-review': 'warning',
  validated: 'success',
  rejected: 'danger',
  expired: 'danger'
};

export function DocumentRow({ document, onValidate, onReject, onRequest }: DocumentRowProps) {
  return (
    <div className='flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 p-3'>
      <div>
        <p className='text-sm font-medium text-slate-900'>
          {document.name} {document.isHardBlock ? <span className='text-red-600'>(Hard-block)</span> : null}
        </p>
        <p className='text-xs text-slate-500'>Ownership: {document.ownership}</p>
      </div>

      <div className='flex items-center gap-2'>
        <Badge variant={statusVariant[document.status]}>{document.status}</Badge>
        {onRequest && document.status === 'required' ? (
          <Button size='sm' variant='secondary' onClick={onRequest}>
            Request
          </Button>
        ) : null}
        {onValidate ? (
          <Button size='sm' variant='secondary' onClick={onValidate}>
            Validate
          </Button>
        ) : null}
        {onReject ? (
          <Button size='sm' variant='secondary' onClick={onReject}>
            Reject
          </Button>
        ) : null}
      </div>
    </div>
  );
}

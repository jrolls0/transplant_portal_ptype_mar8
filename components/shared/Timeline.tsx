import { AuditEvent } from '@/types';
import { formatDateTime } from '@/lib/utils/formatters';

export function Timeline({ events }: { events: AuditEvent[] }) {
  return (
    <div className='space-y-3'>
      {events.map((event) => (
        <div key={event.id} className='rounded-lg border border-slate-200 p-3'>
          <div className='mb-1 flex items-center justify-between gap-2'>
            <p className='text-sm font-semibold text-slate-900'>{event.eventType.replace(/_/g, ' ')}</p>
            <p className='text-xs text-slate-500'>{formatDateTime(event.performedAt)}</p>
          </div>
          <p className='text-sm text-slate-700'>{event.description}</p>
          <p className='mt-1 text-xs text-slate-500'>{event.performedBy.name}</p>
        </div>
      ))}
    </div>
  );
}

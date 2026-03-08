import { AlertTriangle, CheckCircle2, Clock3 } from 'lucide-react';
import { SLAStatus } from '@/types';
import { cn } from '@/lib/utils';

export function SLAIndicator({ status, label }: { status: SLAStatus; label?: string }) {
  const style =
    status === 'on-track'
      ? 'sla-on-track'
      : status === 'at-risk'
        ? 'sla-at-risk'
        : 'sla-overdue';

  const Icon = status === 'on-track' ? CheckCircle2 : status === 'at-risk' ? Clock3 : AlertTriangle;

  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium', style)}>
      <Icon className='h-3 w-3' />
      {label ?? (status === 'on-track' ? 'On Track' : status === 'at-risk' ? 'At Risk' : 'Overdue')}
    </span>
  );
}

import { AlertOctagon, AlertTriangle, CheckCircle } from 'lucide-react';
import { SLAStatus } from '@/types';
import { cn } from '@/lib/utils';

interface SLAIndicatorProps {
  status: SLAStatus;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
}

const config = {
  'on-track': {
    icon: CheckCircle,
    label: 'On Track',
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    border: 'border-emerald-200'
  },
  'at-risk': {
    icon: AlertTriangle,
    label: 'At Risk',
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    border: 'border-amber-200'
  },
  overdue: {
    icon: AlertOctagon,
    label: 'Overdue',
    bg: 'bg-red-100',
    text: 'text-red-700',
    border: 'border-red-200'
  }
} as const;

const sizes = {
  sm: { badge: 'px-2 py-0.5 text-xs', icon: 'h-3 w-3' },
  md: { badge: 'px-2.5 py-1 text-sm', icon: 'h-4 w-4' },
  lg: { badge: 'px-3 py-1.5 text-sm', icon: 'h-5 w-5' }
} as const;

export function SLAIndicator({ status, size = 'md', showLabel = true, label }: SLAIndicatorProps) {
  const { icon: Icon, label: defaultLabel, bg, text, border } = config[status];
  const { badge, icon } = sizes[size];

  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border font-medium', bg, text, border, badge)}>
      <Icon className={icon} />
      {showLabel ? <span>{label ?? defaultLabel}</span> : null}
    </span>
  );
}

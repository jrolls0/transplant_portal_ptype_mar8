import { differenceInCalendarDays, parseISO } from 'date-fns';
import { SLAStatus } from '@/types';

export function daysRemaining(dueDate: string) {
  return differenceInCalendarDays(parseISO(dueDate), new Date());
}

export function calculateSLAStatus(dueDate: string): SLAStatus {
  const remaining = daysRemaining(dueDate);
  if (remaining <= 0) return 'overdue';
  if (remaining <= 2) return 'at-risk';
  return 'on-track';
}

export function slaStatusLabel(status: SLAStatus) {
  if (status === 'on-track') return 'On Track';
  if (status === 'at-risk') return 'At Risk';
  return 'Overdue';
}

export function slaClass(status: SLAStatus) {
  if (status === 'on-track') return 'sla-on-track';
  if (status === 'at-risk') return 'sla-at-risk';
  return 'sla-overdue';
}

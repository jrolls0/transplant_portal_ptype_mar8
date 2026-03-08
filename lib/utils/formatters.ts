import { format, parseISO } from 'date-fns';
import { Case, UserRole } from '@/types';
import { roleLabels } from '@/lib/data/mockUsers';

export function formatDate(dateString: string, pattern = 'MMM d, yyyy') {
  return format(parseISO(dateString), pattern);
}

export function formatDateTime(dateString: string) {
  return format(parseISO(dateString), 'MMM d, yyyy h:mm a');
}

export function formatPatientName(patient: Case['patient']) {
  return `${patient.lastName}, ${patient.firstName}`;
}

export function formatCaseLabel(currentCase: Case) {
  return `${currentCase.caseNumber} (${currentCase.patient.lastName}, ${currentCase.patient.firstName})`;
}

export function roleLabel(role: UserRole) {
  return roleLabels[role] ?? role;
}

export function initials(name: string) {
  const parts = name.split(' ').filter(Boolean);
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
}

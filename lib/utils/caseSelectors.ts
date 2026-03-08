import { AuditEvent, Case, Decision, Document, Message, Task, UserRole } from '@/types';

export function caseTasks(tasks: Task[], caseId: string) {
  return tasks.filter((task) => task.caseId === caseId);
}

export function caseDocuments(documents: Document[], caseId: string) {
  return documents.filter((document) => document.caseId === caseId);
}

export function caseMessages(messages: Message[], caseId: string) {
  return messages.filter((message) => message.caseId === caseId).sort((a, b) => +new Date(b.sentAt) - +new Date(a.sentAt));
}

export function caseDecisions(decisions: Decision[], caseId: string) {
  return decisions.filter((decision) => decision.caseId === caseId).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

export function pendingRoleTasks(tasks: Task[], role: UserRole) {
  return tasks.filter((task) => task.assignedToRole === role && task.status !== 'completed');
}

export function caseAudit(caseId: string, audit: AuditEvent[]) {
  return audit.filter((event) => event.caseId === caseId);
}

export function stageCases(cases: Case[], stage: Case['stage']) {
  return cases.filter((currentCase) => currentCase.stage === stage);
}

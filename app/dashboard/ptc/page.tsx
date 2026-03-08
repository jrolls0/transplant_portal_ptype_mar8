'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useRequireAuth } from '@/lib/context/AuthContext';
import { useCases } from '@/lib/context/CaseContext';
import { useNotification } from '@/lib/context/NotificationContext';
import { MiniPipeline } from '@/components/dashboard/MiniPipeline';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SLAIndicator } from '@/components/shared/SLAIndicator';
import { DashboardSkeleton } from '@/components/shared/LoadingSkeleton';

export default function PTCDashboardPage() {
  const { currentUser } = useRequireAuth();
  const { hydrated, cases, tasks, takePatient } = useCases();
  const { notify } = useNotification();

  const myCases = useMemo(
    () => cases.filter((currentCase) => currentCase.assignedPTC?.id === currentUser?.id && currentCase.stage !== 'ended'),
    [cases, currentUser?.id]
  );

  const atRisk = myCases.filter((currentCase) => currentCase.slaStatus !== 'on-track');
  const stalled = myCases.filter((currentCase) => currentCase.flags.some((flag) => flag.toLowerCase().includes('stalled')));
  const awaitingReviews = myCases.filter((currentCase) => ['specialist-review', 'medical-records-review', 'final-decision'].includes(currentCase.stage));

  const unassigned = useMemo(() => cases.filter((currentCase) => !currentCase.assignedPTC && currentCase.stage === 'initial-screening'), [cases]);

  const pipelineData = useMemo(() => {
    const stageGroups = {
      Screening: ['initial-screening'],
      Financial: ['financial-screening'],
      Records: ['records-collection', 'medical-records-review'],
      Review: ['specialist-review'],
      Decision: ['final-decision'],
      Education: ['education'],
      Sched: ['scheduling', 'scheduled']
    } as const;
    return Object.entries(stageGroups).map(([label, stageList]) => ({
      stage: label,
      count: myCases.filter((currentCase) => (stageList as readonly string[]).includes(currentCase.stage)).length
    }));
  }, [myCases]);

  const blockersByCase = useMemo(
    () =>
      tasks.reduce<Record<string, string>>((acc, task) => {
        if (task.status !== 'completed' && task.priority !== 'low') {
          if (!acc[task.caseId]) acc[task.caseId] = task.title;
        }
        return acc;
      }, {}),
    [tasks]
  );

  if (!hydrated) {
    return <DashboardSkeleton />;
  }

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-semibold text-slate-900'>Pre-Transplant Coordinator Dashboard</h1>
        <p className='text-sm text-slate-600'>Track assigned caseload, at-risk blockers, and claimable patients.</p>
      </div>

      <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-5'>
        {[
          ['My Cases', myCases.length],
          ['At Risk', atRisk.length],
          ['Stalled', stalled.length],
          ['Awaiting Reviews', awaitingReviews.length],
          ['Unassigned', unassigned.length]
        ].map(([label, value]) => (
          <div key={label} className='rounded-xl border border-slate-200 bg-white p-4'>
            <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>{label}</p>
            <p className='mt-2 text-2xl font-semibold text-slate-900'>{value}</p>
          </div>
        ))}
      </div>

      <section className='rounded-xl border border-slate-200 bg-white p-4'>
        <h2 className='mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500'>At Risk Cases</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead>Days</TableHead>
              <TableHead>SLA</TableHead>
              <TableHead>Blocker</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {atRisk.map((currentCase) => (
              <TableRow key={currentCase.id}>
                <TableCell>
                  {currentCase.patient.lastName}, {currentCase.patient.firstName}
                </TableCell>
                <TableCell>{currentCase.stage}</TableCell>
                <TableCell>{currentCase.daysInStage}</TableCell>
                <TableCell>
                  <SLAIndicator status={currentCase.slaStatus} />
                </TableCell>
                <TableCell>{blockersByCase[currentCase.id] ?? (currentCase.flags.join(', ') || '—')}</TableCell>
                <TableCell>
                  <div className='flex flex-wrap gap-2'>
                    <Link href={`/cases/${currentCase.id}`}>
                      <Button size='sm' variant='secondary'>
                        View
                      </Button>
                    </Link>
                    <Button size='sm' variant='secondary'>
                      Message Clinic
                    </Button>
                    <Button size='sm' variant='secondary'>
                      Escalate
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      <section>
        <h2 className='mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500'>My Pipeline</h2>
        <MiniPipeline data={pipelineData} />
      </section>

      <section className='rounded-xl border border-slate-200 bg-white p-4'>
        <h2 className='mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500'>Patients Needing PTC (Claim Queue)</h2>
        <div className='space-y-2'>
          {unassigned.map((currentCase) => (
            <div key={currentCase.id} className='flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 p-3'>
              <div>
                <p className='text-sm font-semibold text-slate-900'>
                  {currentCase.patient.lastName}, {currentCase.patient.firstName}
                </p>
                <p className='text-xs text-slate-500'>
                  {currentCase.stage} • {currentCase.daysInStage}d in queue
                </p>
              </div>
              <Button
                onClick={() => {
                  takePatient(currentCase.id);
                  notify('Case assigned to you');
                }}
              >
                Take Patient
              </Button>
            </div>
          ))}

          {unassigned.length === 0 ? <p className='text-sm text-slate-500'>No unassigned cases currently.</p> : null}
        </div>
      </section>
    </div>
  );
}

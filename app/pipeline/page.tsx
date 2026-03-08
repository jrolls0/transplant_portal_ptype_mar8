'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Download } from 'lucide-react';
import { useRequireAuth } from '@/lib/context/AuthContext';
import { useCases } from '@/lib/context/CaseContext';
import { useNotification } from '@/lib/context/NotificationContext';
import { Button } from '@/components/ui/button';
import { PipelineFilters } from '@/components/pipeline/PipelineFilters';
import { PipelineTable, SortKey } from '@/components/pipeline/PipelineTable';
import { PipelineSummary } from '@/components/pipeline/PipelineSummary';
import { DashboardSkeleton } from '@/components/shared/LoadingSkeleton';

const PAGE_SIZE = 20;

export default function PipelinePage() {
  useRequireAuth();

  const router = useRouter();
  const { hydrated, cases } = useCases();
  const { notify } = useNotification();

  const [filters, setFilters] = useState({ stage: 'all', ptc: 'all', sla: 'all', clinic: 'all', dateRange: 'all' });
  const [sortKey, setSortKey] = useState<SortKey>('patient');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return cases.filter((currentCase) => {
      if (filters.stage !== 'all' && currentCase.stage !== filters.stage) return false;
      if (filters.ptc !== 'all' && currentCase.assignedPTC?.name !== filters.ptc) return false;
      if (filters.sla !== 'all' && currentCase.slaStatus !== filters.sla) return false;
      if (filters.clinic !== 'all' && currentCase.referringClinic !== filters.clinic) return false;
      if (filters.dateRange !== 'all') {
        const days = filters.dateRange === '7d' ? 7 : filters.dateRange === '30d' ? 30 : 90;
        const threshold = Date.now() - days * 24 * 3600 * 1000;
        if (new Date(currentCase.createdAt).getTime() < threshold) return false;
      }
      return true;
    });
  }, [cases, filters]);

  const sorted = useMemo(() => {
    const direction = sortDirection === 'asc' ? 1 : -1;

    const sortedCases = [...filtered].sort((a, b) => {
      if (sortKey === 'patient') {
        return direction * a.patient.lastName.localeCompare(b.patient.lastName);
      }
      if (sortKey === 'stage') {
        return direction * a.stage.localeCompare(b.stage);
      }
      if (sortKey === 'ptc') {
        return direction * (a.assignedPTC?.name ?? '').localeCompare(b.assignedPTC?.name ?? '');
      }
      if (sortKey === 'days') {
        return direction * (a.daysInStage - b.daysInStage);
      }
      return direction * a.slaStatus.localeCompare(b.slaStatus);
    });

    return sortedCases;
  }, [filtered, sortDirection, sortKey]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const paged = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  if (!hydrated) {
    return <DashboardSkeleton />;
  }

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <div>
          <h1 className='text-2xl font-semibold text-slate-900'>Pipeline View</h1>
          <p className='text-sm text-slate-600'>{filtered.length} active cases</p>
        </div>

        <Button
          variant='secondary'
          onClick={() => {
            notify('CSV export simulated');
          }}
        >
          <Download className='mr-2 h-4 w-4' />
          Export CSV
        </Button>
      </div>

      <PipelineFilters
        filters={filters}
        onChange={(next) => {
          setFilters(next);
          setPage(1);
        }}
        cases={cases}
      />

      <PipelineTable
        cases={paged}
        sortKey={sortKey}
        sortDirection={sortDirection}
        onSortChange={(nextKey) => {
          if (nextKey === sortKey) {
            setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
          } else {
            setSortKey(nextKey);
            setSortDirection('asc');
          }
        }}
        onOpenCase={(caseId) => router.push(`/cases/${caseId}`)}
      />

      <div className='flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700'>
        <p>
          Showing {(safePage - 1) * PAGE_SIZE + 1}-{Math.min(safePage * PAGE_SIZE, sorted.length)} of {sorted.length}
        </p>
        <div className='flex items-center gap-2'>
          <Button variant='secondary' size='sm' onClick={() => setPage((current) => Math.max(1, current - 1))}>
            ◀ Prev
          </Button>
          <p>
            Page {safePage} / {pageCount}
          </p>
          <Button variant='secondary' size='sm' onClick={() => setPage((current) => Math.min(pageCount, current + 1))}>
            Next ▶
          </Button>
        </div>
      </div>

      <PipelineSummary cases={filtered} />
    </div>
  );
}

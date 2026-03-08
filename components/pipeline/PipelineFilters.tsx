'use client';

import { Case, SLAStatus } from '@/types';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface PipelineFiltersState {
  stage: string;
  ptc: string;
  sla: string;
  clinic: string;
  dateRange: string;
}

interface PipelineFiltersProps {
  filters: PipelineFiltersState;
  onChange: (next: PipelineFiltersState) => void;
  cases: Case[];
}

export function PipelineFilters({ filters, onChange, cases }: PipelineFiltersProps) {
  const uniqueStages = Array.from(new Set(cases.map((currentCase) => currentCase.stage))).sort();
  const uniquePTC = Array.from(new Set(cases.map((currentCase) => currentCase.assignedPTC?.name).filter(Boolean) as string[])).sort();
  const uniqueClinics = Array.from(new Set(cases.map((currentCase) => currentCase.referringClinic))).sort();

  return (
    <div className='grid gap-2 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-6'>
      <Select value={filters.stage} onChange={(event) => onChange({ ...filters, stage: event.target.value })}>
        <option value='all'>Stage</option>
        {uniqueStages.map((stage) => (
          <option key={stage} value={stage}>
            {stage}
          </option>
        ))}
      </Select>

      <Select value={filters.ptc} onChange={(event) => onChange({ ...filters, ptc: event.target.value })}>
        <option value='all'>PTC</option>
        {uniquePTC.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </Select>

      <Select value={filters.sla} onChange={(event) => onChange({ ...filters, sla: event.target.value as SLAStatus | 'all' })}>
        <option value='all'>SLA Status</option>
        <option value='on-track'>On Track</option>
        <option value='at-risk'>At Risk</option>
        <option value='overdue'>Overdue</option>
      </Select>

      <Select value={filters.clinic} onChange={(event) => onChange({ ...filters, clinic: event.target.value })}>
        <option value='all'>Clinic</option>
        {uniqueClinics.map((clinic) => (
          <option key={clinic} value={clinic}>
            {clinic}
          </option>
        ))}
      </Select>

      <Select value={filters.dateRange} onChange={(event) => onChange({ ...filters, dateRange: event.target.value })}>
        <option value='all'>Date Range</option>
        <option value='7d'>Last 7 days</option>
        <option value='30d'>Last 30 days</option>
        <option value='90d'>Last 90 days</option>
      </Select>

      <Button
        variant='secondary'
        onClick={() => onChange({ stage: 'all', ptc: 'all', sla: 'all', clinic: 'all', dateRange: 'all' })}
      >
        Clear Filters
      </Button>
    </div>
  );
}

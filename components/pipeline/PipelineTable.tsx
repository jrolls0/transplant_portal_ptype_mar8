'use client';

import { ArrowUpDown } from 'lucide-react';
import { Case } from '@/types';
import { SLAIndicator } from '@/components/shared/SLAIndicator';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export type SortKey = 'patient' | 'stage' | 'ptc' | 'days' | 'sla';

interface PipelineTableProps {
  cases: Case[];
  sortKey: SortKey;
  sortDirection: 'asc' | 'desc';
  onSortChange: (key: SortKey) => void;
  onOpenCase: (caseId: string) => void;
}

function SortButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <Button variant='ghost' size='sm' className={active ? 'text-blue-700' : ''} onClick={onClick}>
      {label}
      <ArrowUpDown className='ml-1 h-3.5 w-3.5' />
    </Button>
  );
}

export function PipelineTable({ cases, sortKey, sortDirection, onSortChange, onOpenCase }: PipelineTableProps) {
  return (
    <div className='rounded-xl border border-slate-200 bg-white'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <SortButton label='Patient' active={sortKey === 'patient'} onClick={() => onSortChange('patient')} />
            </TableHead>
            <TableHead>
              <SortButton label='Stage' active={sortKey === 'stage'} onClick={() => onSortChange('stage')} />
            </TableHead>
            <TableHead>
              <SortButton label='PTC' active={sortKey === 'ptc'} onClick={() => onSortChange('ptc')} />
            </TableHead>
            <TableHead>
              <SortButton label='Days' active={sortKey === 'days'} onClick={() => onSortChange('days')} />
            </TableHead>
            <TableHead>
              <SortButton label='SLA' active={sortKey === 'sla'} onClick={() => onSortChange('sla')} />
            </TableHead>
            <TableHead>Flags</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cases.map((currentCase) => (
            <TableRow key={currentCase.id} className='cursor-pointer' onClick={() => onOpenCase(currentCase.id)}>
              <TableCell className='font-medium'>
                {currentCase.patient.lastName}, {currentCase.patient.firstName}
              </TableCell>
              <TableCell>{currentCase.stage}</TableCell>
              <TableCell>{currentCase.assignedPTC?.name ?? '—'}</TableCell>
              <TableCell>{currentCase.daysInStage}</TableCell>
              <TableCell>
                <SLAIndicator status={currentCase.slaStatus} />
              </TableCell>
              <TableCell className='max-w-[240px] truncate'>{currentCase.flags.join(', ') || '—'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {cases.length === 0 ? <p className='p-4 text-sm text-slate-500'>No matching cases.</p> : null}

      <div className='border-t border-slate-200 px-4 py-3 text-xs text-slate-500'>
        Sort: {sortKey} ({sortDirection})
      </div>
    </div>
  );
}

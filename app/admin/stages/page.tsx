'use client';

import { useRequireAuth } from '@/lib/context/AuthContext';
import { stageDefinitions } from '@/lib/data/stages';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Lock } from 'lucide-react';

export default function AdminStagesPage() {
  const auth = useRequireAuth();

  if (auth.currentRole !== 'senior-coordinator') {
    return <p className='text-sm text-slate-600'>Admin pages are available to Senior Coordinator role only.</p>;
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-semibold text-slate-900'>Stage Configuration</h1>
          <p className='text-sm text-slate-600'>Configure workflow stages and SLA timers</p>
        </div>
        <Button variant='outline' disabled>
          <Lock className='mr-2 h-4 w-4' />
          Locked in Demo
        </Button>
      </div>

      <div className='overflow-hidden rounded-xl border border-slate-200 bg-white'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-12'>Order</TableHead>
              <TableHead>Stage Name</TableHead>
              <TableHead>Short Name</TableHead>
              <TableHead>SLA (Days)</TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stageDefinitions.map((stage) => (
              <TableRow key={stage.id}>
                <TableCell className='font-mono text-sm'>{stage.order}</TableCell>
                <TableCell className='font-medium'>{stage.name}</TableCell>
                <TableCell>{stage.shortName}</TableCell>
                <TableCell>
                  <span className='inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-sm font-medium text-blue-700'>
                    {stage.slaDays} days
                  </span>
                </TableCell>
                <TableCell className='max-w-md truncate text-sm text-slate-600'>{stage.description}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className='rounded-lg border border-amber-200 bg-amber-50 p-4'>
        <p className='text-sm text-amber-800'>
          <strong>Demo Note:</strong> In production, administrators can customize stage names, SLA timers, and
          workflow transitions.
        </p>
      </div>
    </div>
  );
}

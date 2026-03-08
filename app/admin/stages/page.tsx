'use client';

import { useState } from 'react';
import { useRequireAuth } from '@/lib/context/AuthContext';
import { stageDefinitions } from '@/lib/data/stages';
import { useNotification } from '@/lib/context/NotificationContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function AdminStagesPage() {
  const auth = useRequireAuth();
  const { notify } = useNotification();
  const [rows, setRows] = useState(stageDefinitions.map((stage) => ({ ...stage })));

  if (auth.currentRole !== 'senior-coordinator') {
    return <p className='text-sm text-slate-600'>Admin pages are available to Senior Coordinator role only.</p>;
  }

  return (
    <div className='space-y-4'>
      <h1 className='text-2xl font-semibold text-slate-900'>Stage Configuration</h1>

      <div className='rounded-xl border border-slate-200 bg-white p-4'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>SLA Days</TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={row.id}>
                <TableCell>{row.order}</TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell>
                  <Input
                    type='number'
                    value={row.slaDays}
                    onChange={(event) => {
                      const next = [...rows];
                      next[index].slaDays = Number(event.target.value);
                      setRows(next);
                    }}
                  />
                </TableCell>
                <TableCell>{row.description}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className='mt-3'>
          <Button onClick={() => notify('Stage configuration saved')}>Save</Button>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRequireAuth } from '@/lib/context/AuthContext';
import { documentCatalog } from '@/lib/data/documentCatalog';
import { useNotification } from '@/lib/context/NotificationContext';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function AdminDocumentsPage() {
  const auth = useRequireAuth();
  const { notify } = useNotification();
  const [rows, setRows] = useState(documentCatalog.map((item) => ({ ...item })));

  if (auth.currentRole !== 'senior-coordinator') {
    return <p className='text-sm text-slate-600'>Admin pages are available to Senior Coordinator role only.</p>;
  }

  return (
    <div className='space-y-4'>
      <h1 className='text-2xl font-semibold text-slate-900'>Document Catalog</h1>

      <div className='rounded-xl border border-slate-200 bg-white p-4'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Ownership</TableHead>
              <TableHead>Required</TableHead>
              <TableHead>Hard-Block</TableHead>
              <TableHead>Max Age</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={row.type}>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.ownership}</TableCell>
                <TableCell>
                  <Checkbox
                    checked={row.isRequired}
                    onChange={(event) => {
                      const next = [...rows];
                      next[index].isRequired = event.target.checked;
                      setRows(next);
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Checkbox
                    checked={row.isHardBlock}
                    onChange={(event) => {
                      const next = [...rows];
                      next[index].isHardBlock = event.target.checked;
                      setRows(next);
                    }}
                  />
                </TableCell>
                <TableCell>{row.maxAgeDays ?? '—'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className='mt-3'>
          <Button onClick={() => notify('Document catalog saved')}>Save</Button>
        </div>
      </div>
    </div>
  );
}

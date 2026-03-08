'use client';

import { useRequireAuth } from '@/lib/context/AuthContext';
import { endReasons } from '@/lib/data/endReasons';
import { useNotification } from '@/lib/context/NotificationContext';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function AdminEndReasonsPage() {
  const auth = useRequireAuth();
  const { notify } = useNotification();

  if (auth.currentRole !== 'senior-coordinator') {
    return <p className='text-sm text-slate-600'>Admin pages are available to Senior Coordinator role only.</p>;
  }

  return (
    <div className='space-y-4'>
      <h1 className='text-2xl font-semibold text-slate-900'>End Reason Codes</h1>

      <div className='rounded-xl border border-slate-200 bg-white p-4'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Label</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Re-Referral Requirements</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {endReasons.map((reason) => (
              <TableRow key={reason.code}>
                <TableCell className='font-mono text-xs'>{reason.code}</TableCell>
                <TableCell>{reason.label}</TableCell>
                <TableCell>{reason.category}</TableCell>
                <TableCell>{reason.reReferralRequirements.join('; ')}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className='mt-3'>
          <Button onClick={() => notify('End reason configuration saved')}>Save</Button>
        </div>
      </div>
    </div>
  );
}

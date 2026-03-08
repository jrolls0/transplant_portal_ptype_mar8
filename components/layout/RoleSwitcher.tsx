'use client';

import { demoRoles, useAuth } from '@/lib/context/AuthContext';
import { roleLabels } from '@/lib/data/mockUsers';
import { Select } from '@/components/ui/select';
import { UserRole } from '@/types';

export function RoleSwitcher() {
  const { currentRole, switchRole } = useAuth();

  return (
    <div className='space-y-1'>
      <p className='text-xs text-slate-500'>Switch Role (Demo)</p>
      <Select value={currentRole ?? ''} onChange={(event) => switchRole(event.target.value as UserRole)}>
        {demoRoles.map((role) => (
          <option key={role} value={role}>
            {roleLabels[role]}
          </option>
        ))}
      </Select>
    </div>
  );
}

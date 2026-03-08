'use client';

import { cn } from '@/lib/utils';

const tabs = [
  { id: 'summary', label: 'Summary' },
  { id: 'tasks', label: 'Tasks' },
  { id: 'documents', label: 'Documents' },
  { id: 'messages', label: 'Messages' },
  { id: 'decisions', label: 'Decisions' },
  { id: 'scheduling', label: 'Scheduling' },
  { id: 'end-referral', label: 'End Referral' },
  { id: 'audit', label: 'Audit' }
] as const;

export type CockpitTabId = (typeof tabs)[number]['id'];

interface TabNavigationProps {
  activeTab: CockpitTabId;
  onChange: (tab: CockpitTabId) => void;
}

export function TabNavigation({ activeTab, onChange }: TabNavigationProps) {
  return (
    <div className='flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-2'>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type='button'
          className={cn(
            'rounded-lg px-3 py-2 text-sm font-medium',
            activeTab === tab.id ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          )}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

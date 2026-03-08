'use client';

import { cn } from '@/lib/utils';

export interface QueueTab {
  id: string;
  label: string;
  count?: number;
}

interface QueueTabsProps {
  tabs: QueueTab[];
  activeTab: string;
  onChange: (tabId: string) => void;
}

export function QueueTabs({ tabs, activeTab, onChange }: QueueTabsProps) {
  return (
    <div className='flex flex-wrap gap-2'>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type='button'
          className={cn(
            'rounded-lg border px-3 py-2 text-sm font-medium',
            activeTab === tab.id
              ? 'border-blue-200 bg-blue-50 text-blue-700'
              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
          )}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
          {typeof tab.count === 'number' ? ` (${tab.count})` : ''}
        </button>
      ))}
    </div>
  );
}

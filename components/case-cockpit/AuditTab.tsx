'use client';

import { useMemo, useState } from 'react';
import { AuditEvent } from '@/types';
import { Button } from '@/components/ui/button';
import { QueueTabs } from '@/components/dashboard/QueueTabs';
import { Timeline } from '@/components/shared/Timeline';

interface AuditTabProps {
  events: AuditEvent[];
}

export function AuditTab({ events }: AuditTabProps) {
  const [filter, setFilter] = useState<'all' | 'stage' | 'decisions' | 'tasks' | 'messages'>('all');

  const filtered = useMemo(() => {
    if (filter === 'all') return events;
    if (filter === 'stage') return events.filter((event) => event.eventType.includes('STAGE'));
    if (filter === 'decisions') return events.filter((event) => event.eventType.includes('DECISION'));
    if (filter === 'tasks') return events.filter((event) => event.eventType.includes('TASK'));
    return events.filter((event) => event.eventType.includes('MESSAGE'));
  }, [events, filter]);

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between gap-2'>
        <QueueTabs
          tabs={[
            { id: 'all', label: 'All Events' },
            { id: 'stage', label: 'Stage Changes' },
            { id: 'decisions', label: 'Decisions' },
            { id: 'tasks', label: 'Tasks' },
            { id: 'messages', label: 'Messages' }
          ]}
          activeTab={filter}
          onChange={(value) => setFilter(value as typeof filter)}
        />

        <Button variant='secondary'>Export</Button>
      </div>

      <Timeline events={filtered} />
    </div>
  );
}

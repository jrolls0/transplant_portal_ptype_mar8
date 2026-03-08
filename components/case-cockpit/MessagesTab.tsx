'use client';

import { useMemo, useState } from 'react';
import { Case, Message } from '@/types';
import { Button } from '@/components/ui/button';
import { QueueTabs } from '@/components/dashboard/QueueTabs';
import { MessageThread } from '@/components/shared/MessageThread';
import { SendMessageModal } from '@/components/modals/SendMessageModal';

interface MessagesTabProps {
  currentCase: Case;
  messages: Message[];
  onSend: (payload: {
    recipients: Message['toRecipients'];
    body: string;
    markAsContactAttempt: boolean;
  }) => void;
}

export function MessagesTab({ currentCase, messages, onSend }: MessagesTabProps) {
  const [filter, setFilter] = useState<'all' | 'patient' | 'care-partner' | 'clinic' | 'internal'>('all');
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    if (filter === 'all') return messages;
    return messages.filter((message) =>
      message.toRecipients.some((recipient) => {
        if (filter === 'patient') return recipient.type === 'patient';
        if (filter === 'care-partner') return recipient.type === 'care-partner';
        if (filter === 'clinic') return ['clinic-dusw', 'clinic-nephrologist'].includes(recipient.type);
        return recipient.type === 'staff';
      })
    );
  }, [filter, messages]);

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between gap-2'>
        <QueueTabs
          tabs={[
            { id: 'all', label: 'All' },
            { id: 'patient', label: 'To Patient' },
            { id: 'care-partner', label: 'To Emergency Contact' },
            { id: 'clinic', label: 'To Clinic' },
            { id: 'internal', label: 'Internal' }
          ]}
          activeTab={filter}
          onChange={(value) => setFilter(value as typeof filter)}
        />
        <Button onClick={() => setOpen(true)}>+ New Message</Button>
      </div>

      <MessageThread messages={filtered} />

      <SendMessageModal
        open={open}
        onOpenChange={setOpen}
        currentCase={currentCase}
        onSend={({ recipients, body, markAsContactAttempt }) => onSend({ recipients, body, markAsContactAttempt })}
      />
    </div>
  );
}

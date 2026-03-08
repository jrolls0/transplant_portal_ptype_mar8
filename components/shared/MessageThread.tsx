import { Message } from '@/types';
import { formatDateTime } from '@/lib/utils/formatters';
import { Badge } from '@/components/ui/badge';

export function MessageThread({ messages }: { messages: Message[] }) {
  return (
    <div className='space-y-3'>
      {messages.map((message) => (
        <div key={message.id} className='rounded-xl border border-slate-200 bg-white p-4'>
          <div className='mb-2 flex flex-wrap items-center justify-between gap-2'>
            <p className='text-sm font-semibold text-slate-900'>
              {message.fromUser.name} → {message.toRecipients.map((recipient) => recipient.name).join(', ')}
            </p>
            <p className='text-xs text-slate-500'>{formatDateTime(message.sentAt)}</p>
          </div>

          <p className='whitespace-pre-wrap text-sm text-slate-700'>{message.body}</p>

          <div className='mt-2 flex flex-wrap gap-2'>
            <Badge variant='outline'>{message.channel}</Badge>
            {message.isContactAttempt ? <Badge variant='warning'>Contact attempt #{message.attemptNumber}</Badge> : null}
            {message.readAt ? <Badge variant='success'>Read</Badge> : <Badge variant='info'>Unread</Badge>}
          </div>
        </div>
      ))}
    </div>
  );
}

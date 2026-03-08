import { CheckCircle, FileCheck, Mail, MessageSquare, Users, XCircle } from 'lucide-react';
import { Consent } from '@/types';

interface ConsentIndicatorProps {
  consent: Consent;
}

export function ConsentIndicator({ consent }: ConsentIndicatorProps) {
  const items = [
    {
      label: 'ROI Signed',
      value: consent.roiSigned,
      icon: FileCheck,
      detail: consent.roiSignedAt ? new Date(consent.roiSignedAt).toLocaleDateString() : null
    },
    { label: 'SMS Consent', value: consent.smsConsent, icon: MessageSquare, detail: null },
    { label: 'Email Consent', value: consent.emailConsent, icon: Mail, detail: null },
    { label: 'Emergency Contact Consent', value: consent.carePartnerConsent, icon: Users, detail: null }
  ];

  return (
    <div className='space-y-2'>
      {items.map((item) => {
        const ItemIcon = item.icon;
        return (
          <div key={item.label} className='flex items-center gap-2 text-sm'>
            <ItemIcon className='h-4 w-4 text-slate-400' />
            {item.value ? <CheckCircle className='h-4 w-4 text-emerald-500' /> : <XCircle className='h-4 w-4 text-slate-300' />}
            <span className={item.value ? 'text-slate-700' : 'text-slate-400'}>{item.label}</span>
            {item.detail ? <span className='text-xs text-slate-400'>({item.detail})</span> : null}
          </div>
        );
      })}
    </div>
  );
}

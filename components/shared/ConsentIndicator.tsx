import { Case } from '@/types';

export function ConsentIndicator({ currentCase }: { currentCase: Case }) {
  return (
    <div className='flex flex-wrap items-center gap-2 text-xs text-slate-600'>
      <span>ROI {currentCase.consent.roiSigned ? '✅' : '❌'}</span>
      <span>SMS {currentCase.consent.smsConsent ? '✅' : '❌'}</span>
      <span>Email {currentCase.consent.emailConsent ? '✅' : '❌'}</span>
      <span>
        Emergency Contact{' '}
        {currentCase.carePartner ? `${currentCase.carePartner.name} ${currentCase.consent.carePartnerConsent ? '✅' : '❌'}` : '—'}
      </span>
    </div>
  );
}

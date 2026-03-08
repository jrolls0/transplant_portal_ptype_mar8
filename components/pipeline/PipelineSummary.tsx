import { Case } from '@/types';

export function PipelineSummary({ cases }: { cases: Case[] }) {
  const onTrack = cases.filter((currentCase) => currentCase.slaStatus === 'on-track').length;
  const atRisk = cases.filter((currentCase) => currentCase.slaStatus === 'at-risk').length;
  const overdue = cases.filter((currentCase) => currentCase.slaStatus === 'overdue').length;

  return (
    <div className='rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700'>
      Summary: <span className='font-semibold text-emerald-700'>On Track: {onTrack}</span> |{' '}
      <span className='font-semibold text-amber-700'>At Risk: {atRisk}</span> |{' '}
      <span className='font-semibold text-red-700'>Overdue: {overdue}</span>
    </div>
  );
}

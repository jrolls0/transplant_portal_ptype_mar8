import { orderedProgressStages, stageDefinitions } from '@/lib/data/stages';
import { Case } from '@/types';

export function StageProgressBar({ currentCase }: { currentCase: Case }) {
  const currentIndex = orderedProgressStages.indexOf(currentCase.stage as (typeof orderedProgressStages)[number]);

  return (
    <div className='rounded-xl border border-slate-200 bg-white p-4'>
      <p className='mb-3 text-sm font-semibold text-slate-800'>Stage Progress</p>
      <div className='overflow-x-auto'>
        <div className='min-w-[760px]'>
          <div className='mb-2 flex items-center gap-1'>
            {orderedProgressStages.map((stage, index) => {
              const completed = index < currentIndex || currentCase.stage === 'scheduled' || currentCase.stage === 'ended';
              const active = index === currentIndex;
              return (
                <div key={stage} className='flex flex-1 items-center gap-1'>
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                      completed
                        ? 'bg-emerald-100 text-emerald-700'
                        : active
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {completed ? '✓' : index + 1}
                  </div>
                  {index < orderedProgressStages.length - 1 ? (
                    <div className={`h-1 flex-1 rounded ${completed ? 'bg-emerald-200' : 'bg-slate-200'}`} />
                  ) : null}
                </div>
              );
            })}
          </div>
          <div
            className='grid gap-1 text-center text-[11px] text-slate-600'
            style={{ gridTemplateColumns: `repeat(${orderedProgressStages.length}, minmax(0, 1fr))` }}
          >
            {orderedProgressStages.map((stage) => {
              const stageInfo = stageDefinitions.find((item) => item.id === stage);
              return <p key={stage}>{stageInfo?.shortName ?? stage}</p>;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

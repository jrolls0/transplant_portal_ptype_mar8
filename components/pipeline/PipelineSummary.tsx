'use client';

import { useMemo } from 'react';
import { AlertTriangle, Calendar, CheckCircle, Clock, TrendingUp, Users } from 'lucide-react';
import { Case } from '@/types';

interface PipelineSummaryProps {
  cases: Case[];
}

export function PipelineSummary({ cases }: PipelineSummaryProps) {
  const stats = useMemo(() => {
    const activeCases = cases.filter((currentCase) => currentCase.stage !== 'ended');
    const scheduledCases = cases.filter((currentCase) => currentCase.stage === 'scheduled');
    const endedCases = cases.filter((currentCase) => currentCase.stage === 'ended');

    const overdueCases = activeCases.filter((currentCase) => currentCase.slaStatus === 'overdue');
    const atRiskCases = activeCases.filter((currentCase) => currentCase.slaStatus === 'at-risk');
    const onTrackCases = activeCases.filter((currentCase) => currentCase.slaStatus === 'on-track');

    const avgDaysInStage =
      activeCases.length > 0
        ? Math.round(activeCases.reduce((sum, currentCase) => sum + currentCase.daysInStage, 0) / activeCases.length)
        : 0;

    const stageDistribution = activeCases.reduce((acc, currentCase) => {
      acc[currentCase.stage] = (acc[currentCase.stage] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topStages = Object.entries(stageDistribution)
      .sort((left, right) => right[1] - left[1])
      .slice(0, 3);

    return {
      total: cases.length,
      active: activeCases.length,
      scheduled: scheduledCases.length,
      ended: endedCases.length,
      overdue: overdueCases.length,
      atRisk: atRiskCases.length,
      onTrack: onTrackCases.length,
      avgDaysInStage,
      topStages
    };
  }, [cases]);

  return (
    <div className='rounded-xl border border-slate-200 bg-white p-4'>
      <h3 className='mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500'>Pipeline Summary</h3>

      <div className='grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6'>
        <div className='rounded-lg bg-slate-50 p-3'>
          <div className='mb-1 flex items-center gap-2 text-slate-600'>
            <Users className='h-4 w-4' />
            <span className='text-xs font-medium'>Total Cases</span>
          </div>
          <p className='text-2xl font-bold text-slate-900'>{stats.total}</p>
        </div>

        <div className='rounded-lg bg-blue-50 p-3'>
          <div className='mb-1 flex items-center gap-2 text-blue-600'>
            <TrendingUp className='h-4 w-4' />
            <span className='text-xs font-medium'>Active</span>
          </div>
          <p className='text-2xl font-bold text-blue-700'>{stats.active}</p>
        </div>

        <div className='rounded-lg bg-emerald-50 p-3'>
          <div className='mb-1 flex items-center gap-2 text-emerald-600'>
            <CheckCircle className='h-4 w-4' />
            <span className='text-xs font-medium'>On Track</span>
          </div>
          <p className='text-2xl font-bold text-emerald-700'>{stats.onTrack}</p>
        </div>

        <div className='rounded-lg bg-amber-50 p-3'>
          <div className='mb-1 flex items-center gap-2 text-amber-600'>
            <AlertTriangle className='h-4 w-4' />
            <span className='text-xs font-medium'>At Risk</span>
          </div>
          <p className='text-2xl font-bold text-amber-700'>{stats.atRisk}</p>
        </div>

        <div className='rounded-lg bg-red-50 p-3'>
          <div className='mb-1 flex items-center gap-2 text-red-600'>
            <Clock className='h-4 w-4' />
            <span className='text-xs font-medium'>Overdue</span>
          </div>
          <p className='text-2xl font-bold text-red-700'>{stats.overdue}</p>
        </div>

        <div className='rounded-lg bg-slate-50 p-3'>
          <div className='mb-1 flex items-center gap-2 text-slate-600'>
            <Calendar className='h-4 w-4' />
            <span className='text-xs font-medium'>Avg Days</span>
          </div>
          <p className='text-2xl font-bold text-slate-900'>{stats.avgDaysInStage}</p>
        </div>
      </div>

      <div className='mt-4 border-t border-slate-100 pt-4'>
        <p className='mb-2 text-xs font-medium text-slate-500'>Top Stages by Volume:</p>
        <div className='flex flex-wrap gap-2'>
          {stats.topStages.map(([stage, count]) => (
            <span key={stage} className='inline-flex items-center rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700'>
              {stage.replace(/-/g, ' ')}: <strong className='ml-1'>{count}</strong>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

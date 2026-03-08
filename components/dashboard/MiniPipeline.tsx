'use client';

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export function MiniPipeline({ data }: { data: { stage: string; count: number }[] }) {
  return (
    <div className='h-56 w-full rounded-xl border border-slate-200 bg-white p-4'>
      <ResponsiveContainer width='100%' height='100%'>
        <BarChart data={data}>
          <XAxis dataKey='stage' fontSize={11} />
          <YAxis allowDecimals={false} fontSize={11} />
          <Tooltip />
          <Bar dataKey='count' fill='#2563eb' radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

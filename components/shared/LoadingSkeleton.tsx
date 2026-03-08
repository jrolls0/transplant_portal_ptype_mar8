export function DashboardSkeleton() {
  return (
    <div className='animate-pulse space-y-6'>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4'>
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className='h-24 rounded-xl bg-slate-200' />
        ))}
      </div>

      <div className='flex gap-2'>
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className='h-10 w-24 rounded-lg bg-slate-200' />
        ))}
      </div>

      <div className='space-y-3'>
        {[1, 2, 3, 4, 5].map((item) => (
          <div key={item} className='h-20 rounded-xl bg-slate-200' />
        ))}
      </div>
    </div>
  );
}

export function CaseCockpitSkeleton() {
  return (
    <div className='animate-pulse space-y-4'>
      <div className='h-32 rounded-xl bg-slate-200' />
      <div className='h-20 rounded-xl bg-slate-200' />
      <div className='h-12 rounded-xl bg-slate-200' />
      <div className='grid grid-cols-1 gap-4 xl:grid-cols-2'>
        <div className='h-64 rounded-xl bg-slate-200' />
        <div className='h-64 rounded-xl bg-slate-200' />
      </div>
    </div>
  );
}

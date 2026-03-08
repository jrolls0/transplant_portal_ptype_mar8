import { Card, CardContent } from '@/components/ui/card';

interface KPIItem {
  label: string;
  value: number;
  tone: 'danger' | 'warning' | 'success' | 'neutral';
}

const toneClasses: Record<KPIItem['tone'], string> = {
  danger: 'text-red-600 bg-red-50 border-red-100',
  warning: 'text-amber-600 bg-amber-50 border-amber-100',
  success: 'text-emerald-600 bg-emerald-50 border-emerald-100',
  neutral: 'text-slate-700 bg-slate-50 border-slate-100'
};

export function KPIStrip({ items }: { items: KPIItem[] }) {
  return (
    <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
      {items.map((item) => (
        <Card key={item.label} className={`border ${toneClasses[item.tone]}`}>
          <CardContent className='p-4'>
            <p className='text-xs font-semibold uppercase tracking-wide'>{item.label}</p>
            <p className='mt-2 text-3xl font-semibold'>{item.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

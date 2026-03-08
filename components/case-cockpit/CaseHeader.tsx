import { differenceInYears } from 'date-fns';
import { Case } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { ConsentIndicator } from '@/components/shared/ConsentIndicator';
import { SLAIndicator } from '@/components/shared/SLAIndicator';
import { formatDate } from '@/lib/utils/formatters';

export function CaseHeader({ currentCase }: { currentCase: Case }) {
  const age = differenceInYears(new Date(), new Date(currentCase.patient.dateOfBirth));

  return (
    <Card>
      <CardContent className='space-y-3 p-5'>
        <div className='flex flex-wrap items-start justify-between gap-3'>
          <div>
            <h2 className='text-2xl font-semibold text-slate-900'>
              {currentCase.patient.lastName}, {currentCase.patient.firstName}
            </h2>
            <p className='font-mono text-xs text-slate-500'>Case #{currentCase.caseNumber}</p>
          </div>

          <SLAIndicator status={currentCase.slaStatus} label={`${currentCase.slaStatus.replace('-', ' ')} SLA`} />
        </div>

        <div className='grid gap-2 text-sm text-slate-700 md:grid-cols-2 xl:grid-cols-4'>
          <p>
            DOB: {formatDate(currentCase.patient.dateOfBirth)} ({age}y)
          </p>
          <p>Stage: {currentCase.stage}</p>
          <p>PTC: {currentCase.assignedPTC?.name ?? 'Unassigned'}</p>
          <p>Clinic: {currentCase.referringClinic}</p>
        </div>

        <ConsentIndicator currentCase={currentCase} />
      </CardContent>
    </Card>
  );
}

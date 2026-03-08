import { formatDistanceToNow } from 'date-fns';
import {
  AlertTriangle,
  Building2,
  Globe,
  Link2,
  Mail,
  Phone,
  User,
  Users
} from 'lucide-react';
import { Case } from '@/types';
import { ConsentIndicator } from '@/components/shared/ConsentIndicator';
import { SLAIndicator } from '@/components/shared/SLAIndicator';
 
interface CaseHeaderProps {
  currentCase: Case;
}

export function CaseHeader({ currentCase }: CaseHeaderProps) {
  const dusw = currentCase.clinicContacts.find((contact) => contact.role === 'dusw');
  const neph = currentCase.clinicContacts.find((contact) => contact.role === 'nephrologist');
  return (
    <div className='overflow-hidden rounded-xl border border-slate-200 bg-white'>
      <div className='border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-6 py-4'>
        <div className='flex flex-wrap items-start justify-between gap-3'>
          <div>
            <div className='flex items-center gap-3'>
              <div className='flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-700'>
                <User className='h-6 w-6' />
              </div>
              <div>
                <h1 className='text-2xl font-bold text-slate-900'>
                  {currentCase.patient.lastName}, {currentCase.patient.firstName}
                </h1>
                <div className='mt-1 flex items-center gap-3 text-sm text-slate-600'>
                  <span className='font-mono'>{currentCase.caseNumber}</span>
                  <span>•</span>
                  <span>DOB: {currentCase.patient.dateOfBirth}</span>
                  {currentCase.patient.mrn ? (
                    <>
                      <span>•</span>
                      <span>MRN: {currentCase.patient.mrn}</span>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div className='flex items-center gap-4'>
            <SLAIndicator status={currentCase.slaStatus} size='lg' />
            <div className='text-right'>
              <p className='text-sm font-semibold text-slate-700'>{currentCase.daysInStage} days in stage</p>
              <p className='text-xs text-slate-500'>Due {new Date(currentCase.slaDueDate).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className='grid gap-6 px-6 py-4 md:grid-cols-3'>
        <div className='space-y-3'>
          <h3 className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Patient Contact</h3>

          <div className='flex items-center gap-2 text-sm'>
            <Phone className='h-4 w-4 text-slate-400' />
            <span>{currentCase.patient.phone}</span>
          </div>
          <div className='flex items-center gap-2 text-sm'>
            <Mail className='h-4 w-4 text-slate-400' />
            <span className='truncate'>{currentCase.patient.email}</span>
          </div>
          <div className='flex items-center gap-2 text-sm'>
            <Globe className='h-4 w-4 text-slate-400' />
            <span>Preferred: {currentCase.patient.preferredLanguage}</span>
          </div>

          {currentCase.carePartner ? (
            <div className='mt-3 border-t border-slate-100 pt-3'>
              <div className='flex items-center gap-2 text-sm'>
                <Users className='h-4 w-4 text-purple-500' />
                <span className='font-medium'>Emergency Contact: {currentCase.carePartner.name}</span>
              </div>
              <p className='ml-6 text-xs text-slate-500'>{currentCase.carePartner.phone}</p>
            </div>
          ) : null}
        </div>

        <div className='space-y-3'>
          <h3 className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Referring Clinic</h3>

          <div className='flex items-center gap-2 text-sm font-medium'>
            <Building2 className='h-4 w-4 text-slate-400' />
            <span>{currentCase.referringClinic}</span>
          </div>
          {dusw ? (
            <div className='text-sm'>
              <span className='text-slate-500'>DUSW:</span> <span>{dusw.name}</span>
            </div>
          ) : null}
          {neph ? (
            <div className='text-sm'>
              <span className='text-slate-500'>Nephrologist:</span> <span>{neph.name}</span>
            </div>
          ) : null}

          {currentCase.assignedPTC ? (
            <div className='mt-3 border-t border-slate-100 pt-3'>
              <div className='flex items-center gap-2 text-sm'>
                <User className='h-4 w-4 text-blue-500' />
                <span>
                  <span className='text-slate-500'>PTC:</span> <span className='font-medium'>{currentCase.assignedPTC.name}</span>
                </span>
              </div>
              {currentCase.ptcAssignedAt ? (
                <p className='ml-6 text-xs text-slate-500'>
                  Assigned {formatDistanceToNow(new Date(currentCase.ptcAssignedAt), { addSuffix: true })}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className='space-y-3'>
          <h3 className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Status & Consents</h3>
          <ConsentIndicator consent={currentCase.consent} />

          {currentCase.flags.length > 0 ? (
            <div className='mt-3 border-t border-slate-100 pt-3'>
              <div className='flex flex-wrap gap-1'>
                {currentCase.flags.map((flag) => (
                  <span
                    key={flag}
                    className='inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800'
                  >
                    <AlertTriangle className='h-3 w-3' />
                    {flag}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {currentCase.linkedFromCaseId || currentCase.linkedToCaseId ? (
            <div className='mt-3 border-t border-slate-100 pt-3'>
              <div className='flex items-center gap-2 text-sm text-blue-600'>
                <Link2 className='h-4 w-4' />
                {currentCase.linkedFromCaseId ? <span>Re-referral from prior case</span> : null}
                {currentCase.linkedToCaseId ? <span>Has active re-referral</span> : null}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

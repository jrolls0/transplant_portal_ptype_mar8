'use client';

import { AlertTriangle, CheckCircle, Clock, HelpCircle, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Case, IEFormResponses } from '@/types';

interface IEResponsesTabProps {
  currentCase: Case;
  onConfirmReview?: () => void;
}

type ResponseSeverity = 'warning' | 'critical' | null;

const severityMap: Partial<Record<keyof IEFormResponses, Record<string, ResponseSeverity>>> = {
  usCitizenOrResident: {
    no: 'warning',
    'not-sure': 'warning'
  },
  needsOtherOrganTransplant: {
    yes: 'critical'
  },
  usesSupplementalOxygen: {
    yes: 'critical'
  },
  heartSurgeryLast6Months: {
    yes: 'warning'
  },
  receivingCancerTreatment: {
    yes: 'critical'
  },
  recreationalDrugUse: {
    yes: 'critical',
    'prefer-not-to-answer': 'warning'
  },
  hasNonHealingWounds: {
    yes: 'critical'
  }
};

const fieldLabels: Record<string, string> = {
  onDialysis: 'Currently on dialysis?',
  eGFR: 'Most recent eGFR (kidney function)',
  heightFeet: 'Height',
  weightLbs: 'Weight',
  bmi: 'Calculated BMI',
  usCitizenOrResident: 'U.S. citizen or legal resident?',
  needsOtherOrganTransplant: 'Needs transplant for other organs (heart, liver, lung)?',
  usesSupplementalOxygen: 'Currently uses supplemental oxygen?',
  heartSurgeryLast6Months: 'Heart surgery in the last 6 months?',
  receivingCancerTreatment: 'Currently receiving cancer treatment?',
  recreationalDrugUse: 'Recreational drug use or active substance use concern?',
  hasNonHealingWounds: 'Open wounds that are not healing?',
  additionalHealthInfo: 'Additional health information'
};

const formatValue = (key: string, value: unknown, responses: IEFormResponses): string => {
  if (value === 'yes') return 'Yes';
  if (value === 'no') return 'No';
  if (value === 'not-sure') return "I'm not sure";
  if (value === 'unknown') return "Patient doesn't know";
  if (value === 'prefer-not-to-answer') return 'Prefer not to answer';

  if (key === 'heightFeet') {
    return `${responses.heightFeet}' ${responses.heightInches}"`;
  }

  if (key === 'weightLbs') return `${value} lbs`;
  if (key === 'eGFR' && typeof value === 'number') return `${value} mL/min/1.73m2`;

  return String(value ?? 'Not provided');
};

const responseSeverity = (key: string, value: unknown): ResponseSeverity => {
  const severityConfig = severityMap[key as keyof IEFormResponses];
  if (!severityConfig) return null;
  return severityConfig[String(value)] ?? null;
};

const calculateBMI = (responses: IEFormResponses) => {
  const totalInches = responses.heightFeet * 12 + responses.heightInches;
  if (!totalInches) return 0;
  return (responses.weightLbs / (totalInches * totalInches)) * 703;
};

export function IEResponsesTab({ currentCase, onConfirmReview }: IEResponsesTabProps) {
  const responses = currentCase.ieFormResponses;

  if (!responses) {
    return (
      <div className='rounded-xl border border-slate-200 bg-white p-6'>
        <div className='flex items-center gap-3 text-slate-500'>
          <Clock className='h-8 w-8' />
          <div>
            <p className='text-lg font-semibold text-slate-700'>I/E Form Not Yet Completed</p>
            <p className='text-sm'>The patient has not yet submitted their Inclusion/Exclusion form responses.</p>
          </div>
        </div>
      </div>
    );
  }

  const bmi = calculateBMI(responses);
  const bmiSeverity: ResponseSeverity = bmi > 42 ? 'critical' : null;
  const flaggedCount =
    Object.entries(responses).filter(([key, value]) => responseSeverity(key, value)).length + (bmiSeverity ? 1 : 0);

  return (
    <div className='space-y-4'>
      <div className='rounded-xl border border-slate-200 bg-white p-4'>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <div className='flex items-center gap-3'>
            <User className='h-6 w-6 text-slate-600' />
            <div>
              <p className='text-lg font-semibold text-slate-900'>Patient I/E Form Responses</p>
              <p className='text-sm text-slate-500'>
                Submitted {new Date(responses.completedAt).toLocaleDateString()} at {new Date(responses.completedAt).toLocaleTimeString()}
              </p>
            </div>
          </div>

          {flaggedCount > 0 ? (
            <div className='flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1.5'>
              <AlertTriangle className='h-4 w-4 text-amber-600' />
              <span className='text-sm font-medium text-amber-800'>
                {flaggedCount} response{flaggedCount > 1 ? 's' : ''} flagged
              </span>
            </div>
          ) : (
            <div className='flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1.5'>
              <CheckCircle className='h-4 w-4 text-emerald-600' />
              <span className='text-sm font-medium text-emerald-800'>No concerns flagged</span>
            </div>
          )}
        </div>
      </div>

      <section className='rounded-xl border border-slate-200 bg-white p-4'>
        <h3 className='mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500'>Basic Information</h3>
        <div className='grid gap-3 md:grid-cols-2'>
          <ResponseRow label={fieldLabels.onDialysis} value={formatValue('onDialysis', responses.onDialysis, responses)} severity={null} />
          <ResponseRow label={fieldLabels.eGFR} value={formatValue('eGFR', responses.eGFR, responses)} severity={null} />
          <ResponseRow label={fieldLabels.heightFeet} value={formatValue('heightFeet', responses.heightFeet, responses)} severity={null} />
          <ResponseRow label={fieldLabels.weightLbs} value={formatValue('weightLbs', responses.weightLbs, responses)} severity={null} />
          <ResponseRow
            label={fieldLabels.bmi}
            value={bmi.toFixed(1)}
            severity={bmiSeverity}
            note={bmiSeverity ? 'BMI exceeds the >42 screening threshold.' : undefined}
          />
          <ResponseRow
            label={fieldLabels.usCitizenOrResident}
            value={formatValue('usCitizenOrResident', responses.usCitizenOrResident, responses)}
            severity={responseSeverity('usCitizenOrResident', responses.usCitizenOrResident)}
          />
        </div>
      </section>

      <section className='rounded-xl border border-slate-200 bg-white p-4'>
        <h3 className='mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500'>Medical Screening Questions</h3>
        <div className='space-y-3'>
          <ResponseRow
            label={fieldLabels.needsOtherOrganTransplant}
            value={formatValue('needsOtherOrganTransplant', responses.needsOtherOrganTransplant, responses)}
            severity={responseSeverity('needsOtherOrganTransplant', responses.needsOtherOrganTransplant)}
          />
          <ResponseRow
            label={fieldLabels.usesSupplementalOxygen}
            value={formatValue('usesSupplementalOxygen', responses.usesSupplementalOxygen, responses)}
            severity={responseSeverity('usesSupplementalOxygen', responses.usesSupplementalOxygen)}
          />
          <ResponseRow
            label={fieldLabels.heartSurgeryLast6Months}
            value={formatValue('heartSurgeryLast6Months', responses.heartSurgeryLast6Months, responses)}
            severity={responseSeverity('heartSurgeryLast6Months', responses.heartSurgeryLast6Months)}
          />
          <ResponseRow
            label={fieldLabels.receivingCancerTreatment}
            value={formatValue('receivingCancerTreatment', responses.receivingCancerTreatment, responses)}
            severity={responseSeverity('receivingCancerTreatment', responses.receivingCancerTreatment)}
          />
          <ResponseRow
            label={fieldLabels.recreationalDrugUse}
            value={formatValue('recreationalDrugUse', responses.recreationalDrugUse, responses)}
            severity={responseSeverity('recreationalDrugUse', responses.recreationalDrugUse)}
            note={
              responses.recreationalDrugUse === 'yes'
                ? 'Patient indicated active substance use concern. Coordinate with social work.'
                : undefined
            }
          />
          <ResponseRow
            label={fieldLabels.hasNonHealingWounds}
            value={formatValue('hasNonHealingWounds', responses.hasNonHealingWounds, responses)}
            severity={responseSeverity('hasNonHealingWounds', responses.hasNonHealingWounds)}
          />
        </div>
      </section>

      {responses.additionalHealthInfo ? (
        <section className='rounded-xl border border-slate-200 bg-white p-4'>
          <h3 className='mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500'>Additional Health Information</h3>
          <div className='rounded-lg bg-slate-50 p-3'>
            <p className='whitespace-pre-wrap text-sm text-slate-700'>{responses.additionalHealthInfo}</p>
          </div>
        </section>
      ) : null}

      <section className='rounded-xl border border-slate-200 bg-white p-4'>
        <div className='flex items-center justify-between'>
          <div>
            <p className='text-sm font-semibold text-slate-700'>I/E Review Status</p>
            <p className='text-xs text-slate-500'>Front desk must confirm review before case can proceed to screening</p>
          </div>
          <div className='flex items-center gap-3'>
            {currentCase.ieConfirmReviewComplete ? (
              <div className='flex items-center gap-2 text-emerald-600'>
                <CheckCircle className='h-5 w-5' />
                <span className='text-sm font-medium'>Review Confirmed</span>
              </div>
            ) : (
              <div className='flex items-center gap-2 text-amber-600'>
                <Clock className='h-5 w-5' />
                <span className='text-sm font-medium'>Pending Review</span>
              </div>
            )}

            {!currentCase.ieConfirmReviewComplete && onConfirmReview ? (
              <Button size='sm' onClick={onConfirmReview}>
                Mark Review Complete
              </Button>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}

function ResponseRow({
  label,
  value,
  severity,
  note
}: {
  label: string;
  value: string;
  severity: ResponseSeverity;
  note?: string;
}) {
  const isCritical = severity === 'critical';
  const isWarning = severity === 'warning';

  return (
    <div
      className={`rounded-lg border p-3 ${
        isCritical
          ? 'border-red-300 bg-red-50'
          : isWarning
            ? 'border-amber-300 bg-amber-50'
            : 'border-slate-200 bg-white'
      }`}
    >
      <div className='flex items-start justify-between gap-2'>
        <p className='text-sm text-slate-600'>{label}</p>
        {severity ? (
          <AlertTriangle className={`h-4 w-4 flex-shrink-0 ${isCritical ? 'text-red-500' : 'text-amber-500'}`} />
        ) : null}
      </div>
      <p className={`mt-1 text-sm font-semibold ${isCritical ? 'text-red-800' : isWarning ? 'text-amber-800' : 'text-slate-900'}`}>{value}</p>
      {note ? (
        <p className={`mt-1 flex items-center gap-1 text-xs ${isCritical ? 'text-red-700' : 'text-amber-700'}`}>
          <HelpCircle className='h-3 w-3' />
          {note}
        </p>
      ) : null}
    </div>
  );
}

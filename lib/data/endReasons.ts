import { EndReasonCode } from '@/types';

export const endReasons: EndReasonCode[] = [
  {
    code: 'FIN-INS-NA',
    label: 'Financial - Insurance not accepted',
    category: 'financial',
    reReferralRequirements: ['Updated accepted insurance coverage verification'],
    letterTemplate: 'financial_not_accepted'
  },
  {
    code: 'FIN-VERIFY',
    label: 'Financial - Unable to verify coverage',
    category: 'financial',
    reReferralRequirements: ['Verified active policy details from payer'],
    letterTemplate: 'financial_unverified'
  },
  {
    code: 'CLN-INCLUSION',
    label: 'Clinical - Does not meet inclusion criteria',
    category: 'clinical',
    reReferralRequirements: ['Documented change in inclusion criteria factors'],
    letterTemplate: 'clinical_inclusion'
  },
  {
    code: 'CLN-EXCLUSION',
    label: 'Clinical - Exclusion criteria present',
    category: 'clinical',
    reReferralRequirements: ['Specialist clearance for prior exclusion criteria'],
    letterTemplate: 'clinical_exclusion'
  },
  {
    code: 'CLN-CONTRA',
    label: 'Clinical - Medical contraindication',
    category: 'clinical',
    reReferralRequirements: ['Updated physician documentation resolving contraindication'],
    letterTemplate: 'clinical_contra'
  },
  {
    code: 'PAT-NORESP',
    label: 'No response after 3 attempts',
    category: 'patient',
    reReferralRequirements: ['Patient direct contact and consent confirmation'],
    letterTemplate: 'patient_no_response'
  },
  {
    code: 'PAT-WITHDRAW',
    label: 'Patient withdrew interest',
    category: 'patient',
    reReferralRequirements: ['Patient written request to restart evaluation'],
    letterTemplate: 'patient_withdraw'
  },
  {
    code: 'ADM-INCOMPLETE',
    label: 'Incomplete packet - unable to proceed',
    category: 'administrative',
    reReferralRequirements: ['Complete required packet including hard-block documents'],
    letterTemplate: 'administrative_incomplete'
  },
  {
    code: 'OTHER',
    label: 'Other (requires detailed explanation)',
    category: 'administrative',
    reReferralRequirements: ['Senior coordinator documented review for re-entry'],
    letterTemplate: 'other'
  }
];

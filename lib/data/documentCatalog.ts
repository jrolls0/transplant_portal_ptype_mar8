import { DocumentCatalogItem } from '@/types';

export const documentCatalog: DocumentCatalogItem[] = [
  {
    type: 'gov-id-front',
    name: 'Government ID (Front)',
    ownership: 'patient',
    isRequired: true,
    isHardBlock: false,
    maxAgeDays: 365
  },
  {
    type: 'gov-id-back',
    name: 'Government ID (Back)',
    ownership: 'patient',
    isRequired: true,
    isHardBlock: false,
    maxAgeDays: 365
  },
  {
    type: 'insurance-front',
    name: 'Insurance Card (Front)',
    ownership: 'patient',
    isRequired: true,
    isHardBlock: false,
    maxAgeDays: 180
  },
  {
    type: 'insurance-back',
    name: 'Insurance Card (Back)',
    ownership: 'patient',
    isRequired: true,
    isHardBlock: false
  },
  {
    type: 'roi-christiana',
    name: 'ROI - ChristianaCare',
    ownership: 'patient',
    isRequired: true,
    isHardBlock: false,
    maxAgeDays: 365
  },
  {
    type: 'roi-dialysis',
    name: 'ROI - Dialysis Records',
    ownership: 'patient',
    isRequired: true,
    isHardBlock: false,
    maxAgeDays: 365
  },
  {
    type: 'cms-2728',
    name: 'CMS-2728 (ESRD Medical Evidence Report)',
    ownership: 'dusw',
    isRequired: true,
    isHardBlock: true,
    maxAgeDays: 365
  },
  {
    type: 'dialysis-records',
    name: 'Dialysis Treatment Records (Last 3 Months)',
    ownership: 'dusw',
    isRequired: true,
    isHardBlock: false,
    maxAgeDays: 90
  },
  {
    type: 'current-labs',
    name: 'Current Laboratory Results',
    ownership: 'dusw',
    isRequired: true,
    isHardBlock: false,
    maxAgeDays: 90
  },
  {
    type: 'sw-assessment',
    name: 'Social Work Assessment',
    ownership: 'dusw',
    isRequired: true,
    isHardBlock: false,
    maxAgeDays: 180
  },
  {
    type: 'neph-notes',
    name: 'Nephrology Progress Notes',
    ownership: 'nephrologist',
    isRequired: true,
    isHardBlock: false,
    maxAgeDays: 180
  },
  {
    type: 'h-and-p',
    name: 'History & Physical',
    ownership: 'nephrologist',
    isRequired: true,
    isHardBlock: false,
    maxAgeDays: 180
  },
  {
    type: 'med-list',
    name: 'Current Medication List',
    ownership: 'nephrologist',
    isRequired: true,
    isHardBlock: false,
    maxAgeDays: 365
  },
  {
    type: 'hepatitis-panel',
    name: 'Hepatitis Panel',
    ownership: 'nephrologist',
    isRequired: true,
    isHardBlock: false,
    maxAgeDays: 365
  },
  {
    type: 'cardiology-clearance',
    name: 'Cardiology Clearance',
    ownership: 'shared',
    isRequired: false,
    isHardBlock: false,
    maxAgeDays: 180
  },
  {
    type: 'outside-cardiology-records',
    name: 'Outside Cardiology Records',
    ownership: 'shared',
    isRequired: false,
    isHardBlock: false,
    maxAgeDays: 180
  },
  {
    type: 'pcp-records',
    name: 'PCP Records',
    ownership: 'shared',
    isRequired: false,
    isHardBlock: false,
    maxAgeDays: 365
  }
];

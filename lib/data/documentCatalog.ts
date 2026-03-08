import { DocumentCatalogItem } from '@/types';

export const documentCatalog: DocumentCatalogItem[] = [
  {
    type: 'government-id',
    name: 'Government ID',
    ownership: 'patient',
    isRequired: true,
    isHardBlock: false,
    maxAgeDays: 365
  },
  {
    type: 'insurance-card',
    name: 'Insurance Card',
    ownership: 'patient',
    isRequired: true,
    isHardBlock: false,
    maxAgeDays: 180
  },
  {
    type: 'inclusion-exclusion-form',
    name: 'Inclusion/Exclusion Form',
    ownership: 'patient',
    isRequired: true,
    isHardBlock: false
  },
  {
    type: 'medicare-2728',
    name: 'Medicare 2728 Form',
    ownership: 'dusw',
    isRequired: true,
    isHardBlock: true,
    maxAgeDays: 365
  },
  {
    type: 'dialysis-summary',
    name: 'Dialysis Treatment Summary',
    ownership: 'dusw',
    isRequired: true,
    isHardBlock: false,
    maxAgeDays: 90
  },
  {
    type: 'lab-results',
    name: 'Lab Results (last 3 mo)',
    ownership: 'nephrologist',
    isRequired: true,
    isHardBlock: false,
    maxAgeDays: 90
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

import { User, UserRole } from '@/types';

export const mockUsers: User[] = [
  { id: 'fd-1', name: 'Jane Thompson', email: 'jthompson@transplant.org', role: 'front-desk' },
  { id: 'fd-2', name: 'Mark Rivera', email: 'mrivera@transplant.org', role: 'front-desk' },
  { id: 'ptc-1', name: 'Sarah Chen', email: 'schen@transplant.org', role: 'ptc' },
  { id: 'ptc-2', name: 'Tom Wilson', email: 'twilson@transplant.org', role: 'ptc' },
  { id: 'sc-1', name: 'Dr. Emily Adams', email: 'eadams@transplant.org', role: 'senior-coordinator' },
  { id: 'fin-1', name: 'Rachel Green', email: 'rgreen@transplant.org', role: 'financial' },
  { id: 'diet-1', name: 'Amy Foster', email: 'afoster@transplant.org', role: 'dietitian' },
  { id: 'sw-1', name: 'Michael Ross', email: 'mross@transplant.org', role: 'social-work' },
  { id: 'neph-1', name: 'Dr. David Burke', email: 'dburke@transplant.org', role: 'nephrology' },
  { id: 'pharm-1', name: 'Lisa Park', email: 'lpark@transplant.org', role: 'pharmacist' },
  { id: 'surg-1', name: 'Dr. James Mitchell', email: 'jmitchell@transplant.org', role: 'surgeon' }
];

export const roleLabels: Record<UserRole, string> = {
  'front-desk': 'Front Desk / Navigator',
  ptc: 'Pre-Transplant Coordinator',
  'senior-coordinator': 'Senior Coordinator',
  financial: 'Financial Coordinator',
  dietitian: 'Dietitian',
  'social-work': 'Social Worker',
  nephrology: 'Nephrology',
  pharmacist: 'Pharmacist',
  surgeon: 'Surgeon'
};

export const clinics = [
  'Fresenius Kidney Care - Wilmington',
  'DaVita Dialysis - Newark',
  'Fresenius Kidney Care - Dover',
  'DaVita Dialysis - Middletown',
  'Atlantic Dialysis Management - Bear'
];

export const patientNames = [
  ['John', 'Smith', '1965-03-15'],
  ['Maria', 'Garcia', '1958-07-22'],
  ['Robert', 'Johnson', '1970-11-08'],
  ['Patricia', 'Williams', '1962-04-30'],
  ['Michael', 'Brown', '1975-09-12'],
  ['Jennifer', 'Davis', '1968-01-25'],
  ['David', 'Martinez', '1972-06-18'],
  ['Linda', 'Anderson', '1955-12-03'],
  ['James', 'Taylor', '1963-08-27'],
  ['Elizabeth', 'Thomas', '1978-02-14'],
  ['Richard', 'Jackson', '1960-10-09'],
  ['Susan', 'White', '1967-05-21'],
  ['Joseph', 'Harris', '1973-03-07'],
  ['Margaret', 'Clark', '1959-11-30'],
  ['Charles', 'Lewis', '1971-07-16'],
  ['Robin', 'Parker', '1964-06-21'],
  ['Wei', 'Chen', '1966-12-19'],
  ['Ana', 'Lopez', '1974-08-10'],
  ['Sam', 'Miller', '1969-02-01'],
  ['Emma', 'Wilson', '1976-11-11']
];

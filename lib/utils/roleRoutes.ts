import { UserRole } from '@/types';

export function dashboardRouteForRole(role: UserRole | null) {
  if (!role) return '/login';
  if (role === 'front-desk') return '/dashboard/front-desk';
  if (role === 'ptc') return '/dashboard/ptc';
  if (role === 'senior-coordinator') return '/dashboard/senior';
  if (role === 'financial') return '/dashboard/financial';
  if (role === 'dietitian') return '/dashboard/specialist/dietitian';
  if (role === 'social-work') return '/dashboard/specialist/social-work';
  if (role === 'nephrology') return '/dashboard/specialist/nephrology';
  return '/dashboard/front-desk';
}

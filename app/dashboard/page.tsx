'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { dashboardRouteForRole } from '@/lib/utils/roleRoutes';

export default function DashboardRedirectPage() {
  const router = useRouter();
  const { currentRole, isAuthenticated, hydrated } = useAuth();

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    router.replace(dashboardRouteForRole(currentRole));
  }, [hydrated, isAuthenticated, currentRole, router]);

  return null;
}

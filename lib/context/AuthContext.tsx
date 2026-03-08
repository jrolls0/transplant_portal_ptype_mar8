'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { mockUsers } from '@/lib/data/mockUsers';
import { User, UserRole } from '@/types';

const AUTH_KEY = 'transplant-auth-role';

export const demoRoles: UserRole[] = [
  'front-desk',
  'ptc',
  'senior-coordinator',
  'financial',
  'dietitian',
  'social-work',
  'nephrology'
];

interface AuthContextValue {
  currentRole: UserRole | null;
  currentUser: User | null;
  isAuthenticated: boolean;
  hydrated: boolean;
  loginAsRole: (role: UserRole) => void;
  switchRole: (role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function getUserForRole(role: UserRole): User {
  const scoped = mockUsers.find((u) => u.role === role);
  if (scoped) return scoped;
  return mockUsers[0];
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const persisted = window.localStorage.getItem(AUTH_KEY);
    if (persisted) {
      setCurrentRole(persisted as UserRole);
    }
    setHydrated(true);
  }, []);

  const setRole = (role: UserRole) => {
    setCurrentRole(role);
    window.localStorage.setItem(AUTH_KEY, role);
  };

  const logout = () => {
    setCurrentRole(null);
    window.localStorage.removeItem(AUTH_KEY);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      currentRole,
      currentUser: currentRole ? getUserForRole(currentRole) : null,
      isAuthenticated: Boolean(currentRole),
      hydrated,
      loginAsRole: setRole,
      switchRole: setRole,
      logout
    }),
    [currentRole, hydrated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function useRequireAuth(redirectTo = '/login') {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!auth.hydrated) return;
    if (!auth.isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [auth.hydrated, auth.isAuthenticated, redirectTo, router]);

  return auth;
}

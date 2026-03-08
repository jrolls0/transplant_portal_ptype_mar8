'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function Tabs({ value, onValueChange, children, className }: TabsProps) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={cn('w-full', className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('inline-flex h-10 items-center rounded-lg bg-slate-100 p-1', className)} {...props} />;
}

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

export function TabsTrigger({ className, value, ...props }: TabsTriggerProps) {
  const context = React.useContext(TabsContext);
  if (!context) return null;

  const active = context.value === value;

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
        active ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900',
        className
      )}
      onClick={() => context.onValueChange(value)}
      type='button'
      {...props}
    />
  );
}

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export function TabsContent({ className, value, ...props }: TabsContentProps) {
  const context = React.useContext(TabsContext);
  if (!context || context.value !== value) return null;

  return <div className={cn('mt-4', className)} {...props} />;
}

import * as React from 'react';
import { cn } from '@/lib/utils';

interface RadioGroupProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}

const RadioGroupContext = React.createContext<Pick<RadioGroupProps, 'value' | 'onValueChange'> | null>(null);

export function RadioGroup({ value, onValueChange, className, children }: RadioGroupProps) {
  return (
    <RadioGroupContext.Provider value={{ value, onValueChange }}>
      <div className={cn('space-y-2', className)}>{children}</div>
    </RadioGroupContext.Provider>
  );
}

interface RadioGroupItemProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
}

export function RadioGroupItem({ className, value, ...props }: RadioGroupItemProps) {
  const context = React.useContext(RadioGroupContext);
  if (!context) return null;

  return (
    <input
      type='radio'
      value={value}
      checked={context.value === value}
      onChange={() => context.onValueChange(value)}
      className={cn('h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500', className)}
      {...props}
    />
  );
}

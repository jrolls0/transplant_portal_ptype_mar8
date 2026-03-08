'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DialogContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DialogContext = React.createContext<DialogContextValue | null>(null);

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  return <DialogContext.Provider value={{ open, onOpenChange }}>{children}</DialogContext.Provider>;
}

export function DialogTrigger({ children, asChild }: { children: React.ReactElement; asChild?: boolean }) {
  const context = React.useContext(DialogContext);
  if (!context) return null;

  if (asChild) {
    return React.cloneElement(children, {
      onClick: (event: React.MouseEvent) => {
        children.props.onClick?.(event);
        context.onOpenChange(true);
      }
    });
  }

  return <button onClick={() => context.onOpenChange(true)}>{children}</button>;
}

interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  showClose?: boolean;
}

export function DialogContent({ className, children, showClose = true, ...props }: DialogContentProps) {
  const context = React.useContext(DialogContext);
  if (!context?.open) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4'>
      <div className={cn('relative w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-xl', className)} {...props}>
        {showClose ? (
          <button
            onClick={() => context.onOpenChange(false)}
            className='absolute right-3 top-3 rounded-md p-1 text-slate-500 hover:bg-slate-100'
            type='button'
          >
            <X className='h-4 w-4' />
          </button>
        ) : null}
        {children}
      </div>
    </div>
  );
}

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mb-4 space-y-1', className)} {...props} />;
}

export function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn('text-lg font-semibold text-slate-900', className)} {...props} />;
}

export function DialogDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm text-slate-600', className)} {...props} />;
}

export function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mt-6 flex justify-end gap-2', className)} {...props} />;
}

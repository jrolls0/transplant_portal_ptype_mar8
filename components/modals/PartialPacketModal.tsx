'use client';

import { Decision } from '@/types';
import { DecisionModal } from '@/components/modals/DecisionModal';

interface PartialPacketModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  decision: Decision;
  onSubmit: (option: string, rationale: string) => void;
}

export function PartialPacketModal({ open, onOpenChange, decision, onSubmit }: PartialPacketModalProps) {
  return (
    <DecisionModal
      open={open}
      onOpenChange={onOpenChange}
      decision={decision}
      contextLines={[
        'Hepatitis Panel (nephrologist-owned)',
        'PCP Records - last 2 years (external retrieval)'
      ]}
      onSubmit={onSubmit}
    />
  );
}

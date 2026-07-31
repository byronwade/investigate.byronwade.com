'use client';

import type * as React from 'react';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '#/components/ui/sheet';
import { DEFAULT_CASE_ID } from '#/features/console/data';

import { SidebarNav } from './sidebar-nav';

export function MobileNav({
  open,
  onOpenChange,
  variant = 'case',
  caseId = DEFAULT_CASE_ID,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant?: 'agency' | 'case';
  caseId?: string;
}): React.JSX.Element {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        showCloseButton
        className="w-[min(100%,var(--console-sidebar-width)+2rem)] gap-0 border-[var(--console-hairline)] bg-[var(--console-sidebar)] p-0 sm:max-w-none"
      >
        <SheetHeader className="border-b border-[var(--console-hairline)] px-4 py-3 text-left">
          <SheetTitle className="text-[14px] text-[var(--console-ink)]">Navigate</SheetTitle>
          <SheetDescription className="text-[12px] text-[var(--console-muted)]">
            {variant === 'agency' ? 'Agency workspace' : 'Case workspace'}
          </SheetDescription>
        </SheetHeader>
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-2.5 py-3.5">
          <SidebarNav variant={variant} caseId={caseId} onNavigate={() => onOpenChange(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}

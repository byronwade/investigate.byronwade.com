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
        data-surface="console"
        className="w-[min(100%,calc(var(--console-sidebar-width)+2rem))] gap-0 border-[var(--console-hairline)] bg-[var(--console-sidebar)] p-0 text-[var(--console-ink)] sm:max-w-none"
      >
        <SheetHeader className="border-b border-[var(--console-hairline)] px-5 pt-5 pb-4 text-left">
          <SheetTitle className="text-[17px] font-semibold tracking-[-0.01em] text-[var(--console-ink)]">
            More
          </SheetTitle>
          <SheetDescription className="text-[13px] text-[var(--console-muted)]">
            {variant === 'agency'
              ? 'Agency destinations and system tools'
              : 'Case workspaces and agency jump links'}
          </SheetDescription>
        </SheetHeader>
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 py-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
          <SidebarNav variant={variant} caseId={caseId} onNavigate={() => onOpenChange(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}

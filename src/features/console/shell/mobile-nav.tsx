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
        side="bottom"
        showCloseButton
        data-surface="console"
        className="flex h-[min(88dvh,100%)] max-h-[min(88dvh,100%)] flex-col gap-0 overflow-hidden rounded-t-[18px] border-[var(--console-hairline)] bg-[var(--console-ground)] p-0 text-[var(--console-ink)] sm:max-w-none"
      >
        <div
          aria-hidden="true"
          className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-[var(--console-hairline)]"
        />
        <SheetHeader className="shrink-0 border-b border-[var(--console-hairline)] px-5 pt-3 pb-3.5 text-left">
          <SheetTitle className="pr-8 text-[17px] font-semibold tracking-[-0.01em] text-[var(--console-ink)]">
            More
          </SheetTitle>
          <SheetDescription className="text-[13px] text-[var(--console-muted)]">
            {variant === 'agency'
              ? 'Agency destinations and system tools'
              : 'Case workspaces and agency jump links'}
          </SheetDescription>
        </SheetHeader>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <SidebarNav
            variant={variant}
            caseId={caseId}
            onNavigate={() => onOpenChange(false)}
            className="min-h-0"
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}

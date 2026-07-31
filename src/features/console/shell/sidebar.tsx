import type * as React from 'react';

import { ScrollArea } from '#/components/ui/scroll-area';
import { DEFAULT_CASE_ID } from '#/features/console/data';
import { cn } from '#/lib/utils';

import { SidebarNav } from './sidebar-nav';

export function Sidebar({
  variant = 'case',
  caseId = DEFAULT_CASE_ID,
  className,
}: {
  variant?: 'agency' | 'case';
  caseId?: string;
  className?: string;
}): React.JSX.Element {
  return (
    <aside
      className={cn(
        'hidden w-[var(--console-sidebar-width)] shrink-0 flex-col border-r border-[var(--console-hairline)] bg-[var(--console-sidebar)] lg:flex',
        className,
      )}
      aria-label="Console navigation"
    >
      <ScrollArea className="h-full">
        <div className="flex min-h-full flex-col px-2.5 py-3.5">
          <SidebarNav variant={variant} caseId={caseId} />
        </div>
      </ScrollArea>
    </aside>
  );
}

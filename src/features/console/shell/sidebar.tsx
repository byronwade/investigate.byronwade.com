import type * as React from 'react';

import { Separator } from '#/components/ui/separator';
import { cn } from '#/lib/utils';

import { ConsoleLink } from './console-link';
import { paperReferenceNav, resolveCaseNavTo, sidebarGroups } from './nav';

export function Sidebar({ caseId }: { caseId: string }): React.JSX.Element {
  const ReferenceIcon = paperReferenceNav.icon;

  return (
    <aside
      className="flex w-[var(--console-sidebar-width)] shrink-0 flex-col gap-0.5 border-r border-[var(--console-hairline)] bg-[var(--console-sidebar)] px-2.5 py-3.5"
      aria-label="Console navigation"
    >
      <nav className="flex min-h-0 flex-1 flex-col gap-4" aria-label="Primary">
        {sidebarGroups.map((group) => (
          <div key={group.id} className="flex flex-col gap-px">
            <div className="flex h-6 items-center px-2">
              <span className="text-[12px] font-medium text-[var(--console-muted)]">
                {group.label}
              </span>
            </div>
            {group.items.map((item) => {
              const Icon = item.icon;
              const href = resolveCaseNavTo(item.to, caseId);
              return (
                <ConsoleLink
                  key={`${group.id}-${item.label}`}
                  to={href}
                  className={cn(
                    'flex h-7 items-center gap-2.5 rounded-md px-2 text-[13px] text-[var(--console-body)]',
                    'hover:bg-[var(--console-row-active)] hover:text-[var(--console-ink)]',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--console-ink)]',
                  )}
                >
                  <Icon aria-hidden="true" weight="duotone" className="size-3 shrink-0" />
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                </ConsoleLink>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-2 pt-3">
        <Separator />
        <ConsoleLink
          to={paperReferenceNav.to}
          className={cn(
            'flex h-7 items-center gap-2.5 rounded-md px-2 text-[13px] text-[var(--console-muted)]',
            'hover:bg-[var(--console-row-active)] hover:text-[var(--console-ink)]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--console-ink)]',
          )}
        >
          <ReferenceIcon aria-hidden="true" weight="duotone" className="size-3 shrink-0" />
          <span className="min-w-0 flex-1 truncate">{paperReferenceNav.label}</span>
        </ConsoleLink>
      </div>
    </aside>
  );
}

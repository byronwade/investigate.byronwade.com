import type * as React from 'react';

import { Separator } from '#/components/ui/separator';
import { DEFAULT_CASE_ID } from '#/features/console/data';
import { cn } from '#/lib/utils';

import { ConsoleLink } from './console-link';
import {
  agencySidebarGroups,
  type CaseNavGroup,
  paperReferenceNav,
  resolveCaseNavTo,
  sidebarGroups,
} from './nav';

export function Sidebar({
  variant = 'case',
  caseId = DEFAULT_CASE_ID,
}: {
  variant?: 'agency' | 'case';
  caseId?: string;
}): React.JSX.Element {
  const groups: CaseNavGroup[] = variant === 'agency' ? agencySidebarGroups : sidebarGroups;
  const ReferenceIcon = paperReferenceNav.icon;

  return (
    <aside
      className="flex w-[var(--console-sidebar-width)] shrink-0 flex-col gap-0.5 border-r border-[var(--console-hairline)] bg-[var(--console-sidebar)] px-2.5 py-3.5"
      aria-label="Console navigation"
    >
      <nav className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto" aria-label="Primary">
        {groups.map((group) => (
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
                  activeOptions={{ exact: true }}
                  className={cn(
                    'flex h-7 items-center gap-2.5 rounded-md px-2 text-[13px] text-[var(--console-body)]',
                    'hover:bg-[var(--console-row-active)] hover:text-[var(--console-ink)]',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--console-ink)]',
                  )}
                  activeProps={{
                    className:
                      'bg-[var(--console-row-active)] font-medium text-[var(--console-ink)]',
                    'aria-current': 'page',
                  }}
                >
                  <Icon aria-hidden="true" weight="duotone" className="size-3 shrink-0" />
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  {item.badge ? (
                    <span className="shrink-0 text-[12px] text-[var(--console-muted)]">
                      {item.badge}
                    </span>
                  ) : null}
                </ConsoleLink>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-2 pt-3">
        {variant === 'agency' ? (
          <div className="space-y-1.5 px-2 pb-1">
            <div className="flex items-center gap-2">
              <span
                className="size-1.5 shrink-0 rounded-[3px] bg-[var(--console-activity)]"
                aria-hidden="true"
              />
              <span className="truncate text-[12px] text-[var(--console-body)]">
                SA D. Okonjo-Ramirez
              </span>
            </div>
            <p className="font-[family-name:var(--console-font-mono)] text-[11px] leading-[17px] text-[var(--console-muted)]">
              TS/SCI · CJIS-VERIFIED · MFA
            </p>
          </div>
        ) : null}
        <Separator />
        <ConsoleLink
          to={paperReferenceNav.to}
          className={cn(
            'flex h-7 items-center gap-2.5 rounded-md px-2 text-[13px] text-[var(--console-muted)]',
            'hover:bg-[var(--console-row-active)] hover:text-[var(--console-ink)]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--console-ink)]',
          )}
          activeProps={{
            className: 'bg-[var(--console-row-active)] font-medium text-[var(--console-ink)]',
            'aria-current': 'page',
          }}
        >
          <ReferenceIcon aria-hidden="true" weight="duotone" className="size-3 shrink-0" />
          <span className="min-w-0 flex-1 truncate">{paperReferenceNav.label}</span>
        </ConsoleLink>
      </div>
    </aside>
  );
}

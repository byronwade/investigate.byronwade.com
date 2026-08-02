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

export function SidebarNav({
  variant = 'case',
  caseId = DEFAULT_CASE_ID,
  onNavigate,
  className,
}: {
  variant?: 'agency' | 'case';
  caseId?: string;
  onNavigate?: () => void;
  className?: string;
}): React.JSX.Element {
  const groups: CaseNavGroup[] = variant === 'agency' ? agencySidebarGroups : sidebarGroups;
  const ReferenceIcon = paperReferenceNav.icon;

  return (
    <div className={cn('flex h-full min-h-0 flex-1 flex-col', className)}>
      <nav
        className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain px-0.5 pb-6"
        aria-label="Primary"
      >
        {groups.map((group) => (
          <div key={group.id} className="flex flex-col gap-0.5">
            <div className="flex h-7 items-center px-3">
              <span className="text-[11px] font-semibold tracking-[0.04em] text-[var(--console-muted)] uppercase">
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
                  {...(onNavigate ? { onClick: onNavigate } : {})}
                  className={cn(
                    'flex min-h-12 items-center gap-3 rounded-[10px] px-3 text-[15px] text-[var(--console-body)] lg:h-7 lg:min-h-0 lg:gap-2.5 lg:rounded-md lg:px-2 lg:text-[13px]',
                    'hover:bg-[var(--console-row-active)] hover:text-[var(--console-ink)]',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--console-ink)]',
                  )}
                  activeProps={{
                    className:
                      'bg-[var(--console-row-active)] font-medium text-[var(--console-ink)]',
                    'aria-current': 'page',
                  }}
                >
                  <Icon aria-hidden="true" weight="duotone" className="size-5 shrink-0 lg:size-3" />
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  {item.badge ? (
                    <span className="shrink-0 rounded-md bg-[var(--console-strip)] px-1.5 py-0.5 font-[family-name:var(--console-font-mono)] text-[11px] text-[var(--console-muted)]">
                      {item.badge}
                    </span>
                  ) : null}
                </ConsoleLink>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-[var(--console-hairline)] bg-[var(--console-ground)] px-1 pt-3 pb-2">
        {variant === 'agency' ? (
          <div className="space-y-1 px-3 pb-2">
            <div className="flex items-center gap-2">
              <span
                className="size-1.5 shrink-0 rounded-[3px] bg-[var(--console-activity)]"
                aria-hidden="true"
              />
              <span className="truncate text-[13px] text-[var(--console-body)]">
                SA D. Okonjo-Ramirez
              </span>
            </div>
            <p className="font-[family-name:var(--console-font-mono)] text-[11px] leading-[17px] text-[var(--console-muted)]">
              TS/SCI · CJIS-VERIFIED · MFA
            </p>
          </div>
        ) : null}
        <Separator className="mb-2 bg-[var(--console-hairline)]" />
        <ConsoleLink
          to={paperReferenceNav.to}
          {...(onNavigate ? { onClick: onNavigate } : {})}
          className={cn(
            'flex min-h-12 items-center gap-3 rounded-[10px] px-3 text-[15px] text-[var(--console-muted)] lg:h-7 lg:min-h-0 lg:gap-2.5 lg:rounded-md lg:px-2 lg:text-[13px]',
            'hover:bg-[var(--console-row-active)] hover:text-[var(--console-ink)]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--console-ink)]',
          )}
          activeProps={{
            className: 'bg-[var(--console-row-active)] font-medium text-[var(--console-ink)]',
            'aria-current': 'page',
          }}
        >
          <ReferenceIcon
            aria-hidden="true"
            weight="duotone"
            className="size-5 shrink-0 lg:size-3"
          />
          <span className="min-w-0 flex-1 truncate">{paperReferenceNav.label}</span>
        </ConsoleLink>
      </div>
    </div>
  );
}

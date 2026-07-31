import type * as React from 'react';

import { Separator } from '#/components/ui/separator';
import { StatusDot } from '#/features/console/ui/status-dot';
import { cn } from '#/lib/utils';

import { ConsoleLink } from './console-link';
import { caseTabs, resolveCaseNavTo } from './nav';

export function CaseTabs({
  caseId,
  caseNumber,
  caseLabel,
  reviewDueLabel,
}: {
  caseId: string;
  caseNumber: string;
  caseLabel: string;
  reviewDueLabel?: string;
}): React.JSX.Element {
  return (
    <div className="flex h-[var(--console-tabs-height)] shrink-0 items-center gap-4 border-b border-[var(--console-hairline)] bg-[var(--console-ground)] px-8">
      <div className="flex shrink-0 items-center gap-2.5">
        <span className="text-[12px] font-medium text-[var(--console-ink)]">{caseLabel}</span>
        <span className="font-[family-name:var(--console-font-mono)] text-[10px] text-[var(--console-muted)]">
          {caseNumber}
        </span>
      </div>
      <Separator orientation="vertical" className="h-4" />
      <nav aria-label="Case" className="flex min-w-0 flex-1 items-center gap-4 overflow-x-auto">
        {caseTabs.map((tab) => {
          const Icon = tab.icon;
          const href = resolveCaseNavTo(tab.to, caseId);
          return (
            <ConsoleLink
              key={tab.label}
              to={href}
              activeOptions={{ exact: true }}
              className={cn(
                'inline-flex items-center gap-1.5 border-b-2 border-transparent py-1 text-[12px] text-[var(--console-muted)]',
                'hover:text-[var(--console-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--console-ink)]',
              )}
              activeProps={{
                className: 'border-[var(--console-ink)] font-medium text-[var(--console-ink)]',
                'aria-current': 'page',
              }}
            >
              <Icon aria-hidden="true" weight="duotone" className="size-3.5" />
              {tab.label}
            </ConsoleLink>
          );
        })}
      </nav>
      {reviewDueLabel ? (
        <div className="flex shrink-0 items-center gap-2">
          <StatusDot tone="sensor" />
          <span className="text-[11px] text-[var(--console-muted)]">{reviewDueLabel}</span>
        </div>
      ) : null}
    </div>
  );
}

import type * as React from 'react';

import { cn } from '#/lib/utils';

export function PageHeader({
  title,
  description,
  meta,
  actions,
  className,
}: {
  title: string;
  description?: string;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}): React.JSX.Element {
  return (
    <header
      className={cn(
        'flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between',
        className,
      )}
    >
      <div className="min-w-0 space-y-1.5">
        <h1 className="font-[family-name:var(--console-font-sans)] text-[22px] font-semibold leading-7 tracking-[-0.02em] text-[var(--console-ink)] sm:text-[24px] sm:leading-[30px]">
          {title}
        </h1>
        {description ? (
          <p className="max-w-2xl text-[13px] leading-5 text-[var(--console-body)]">
            {description}
          </p>
        ) : null}
        {meta ? (
          <div className="pt-0.5 text-[12px] leading-4 text-[var(--console-muted)]">{meta}</div>
        ) : null}
      </div>
      {actions ? (
        <div className="flex w-full shrink-0 flex-wrap items-center gap-2 sm:w-auto">{actions}</div>
      ) : null}
    </header>
  );
}

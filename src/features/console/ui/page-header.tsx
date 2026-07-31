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
    <header className={cn('mb-6 flex flex-wrap items-start justify-between gap-4', className)}>
      <div className="min-w-0 space-y-1">
        <h1 className="font-[family-name:var(--console-font-sans)] text-[22px] font-semibold leading-7 tracking-[-0.02em] text-[var(--console-ink)]">
          {title}
        </h1>
        {description ? (
          <p className="max-w-2xl text-[13px] leading-5 text-[var(--console-body)]">
            {description}
          </p>
        ) : null}
        {meta ? <div className="pt-1 text-[12px] text-[var(--console-muted)]">{meta}</div> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}

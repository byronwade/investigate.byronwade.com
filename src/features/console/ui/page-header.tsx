import type * as React from 'react';

import { cn } from '#/lib/utils';

export function PageHeader({
  title,
  description,
  meta,
  actions,
  className,
  /** Hide title + description below `lg` when the sticky top bar already names the screen. */
  hideTitleOnMobile = false,
}: {
  title: string;
  description?: string;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  hideTitleOnMobile?: boolean;
}): React.JSX.Element {
  const hasMobileBody = Boolean(meta || actions);

  return (
    <header
      className={cn(
        'flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:gap-4',
        hideTitleOnMobile && !hasMobileBody && 'hidden lg:flex',
        className,
      )}
    >
      <div className="min-w-0 space-y-1.5">
        <h1
          className={cn(
            'font-[family-name:var(--console-font-sans)] text-[22px] font-semibold leading-7 tracking-[-0.02em] text-[var(--console-ink)] sm:text-[24px] sm:leading-[30px]',
            hideTitleOnMobile && 'hidden lg:block',
          )}
        >
          {title}
        </h1>
        {description ? (
          <p
            className={cn(
              'max-w-2xl text-[13px] leading-5 text-[var(--console-body)]',
              hideTitleOnMobile && 'hidden lg:block',
            )}
          >
            {description}
          </p>
        ) : null}
        {meta ? (
          <div className="text-[12px] leading-4 text-[var(--console-muted)]">{meta}</div>
        ) : null}
      </div>
      {actions ? <div className="console-actions sm:w-auto">{actions}</div> : null}
    </header>
  );
}

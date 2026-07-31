import type * as React from 'react';

import { cn } from '#/lib/utils';

export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}): React.JSX.Element {
  return (
    <div
      role="status"
      className={cn(
        'flex flex-col items-start gap-2 rounded-lg border border-dashed border-[var(--console-hairline)] bg-[var(--console-strip)] px-4 py-6',
        className,
      )}
    >
      <p className="text-[13px] font-medium text-[var(--console-ink)]">{title}</p>
      {description ? (
        <p className="max-w-md text-[12px] leading-5 text-[var(--console-muted)]">{description}</p>
      ) : null}
      {action ? <div className="pt-1">{action}</div> : null}
    </div>
  );
}

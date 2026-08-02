import type * as React from 'react';

import { cn } from '#/lib/utils';

export function SectionHeader({
  title,
  hint,
  action,
  className,
  titleId,
  /** Keep title + hint on one row (useful for column counts). */
  inlineHint = false,
}: {
  title: string;
  hint?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  titleId?: string;
  inlineHint?: boolean;
}): React.JSX.Element {
  return (
    <div
      className={cn('console-section-head', inlineHint && 'console-section-head-inline', className)}
    >
      <div className={cn(inlineHint && 'flex min-w-0 items-baseline gap-2')}>
        <h2 id={titleId} className="console-section-title">
          {title}
        </h2>
        {hint ? (
          <p className={cn('console-section-hint', inlineHint && 'console-section-hint-inline')}>
            {hint}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

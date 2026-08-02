import type * as React from 'react';

import { cn } from '#/lib/utils';

export function SectionHeader({
  title,
  hint,
  action,
  className,
  titleId,
}: {
  title: string;
  hint?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  titleId?: string;
}): React.JSX.Element {
  return (
    <div className={cn('console-section-head', className)}>
      <h2 id={titleId} className="console-section-title">
        {title}
      </h2>
      {hint ? <p className="console-section-hint">{hint}</p> : null}
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

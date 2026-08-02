import type * as React from 'react';

import { cn } from '#/lib/utils';

export function DetailPanel({
  children,
  className,
  title,
  description,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
}): React.JSX.Element {
  return (
    <aside className={cn('console-panel console-panel-pad space-y-4', className)}>
      {title || description ? (
        <div className="space-y-1">
          {title ? <h2 className="console-section-title">{title}</h2> : null}
          {description ? <p className="console-section-hint">{description}</p> : null}
        </div>
      ) : null}
      {children}
    </aside>
  );
}

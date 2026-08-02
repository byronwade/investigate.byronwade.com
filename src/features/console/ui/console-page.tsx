import type * as React from 'react';

import { cn } from '#/lib/utils';

export function ConsolePage({
  children,
  loose = false,
  className,
}: {
  children: React.ReactNode;
  loose?: boolean;
  className?: string;
}): React.JSX.Element {
  return (
    <div
      data-surface="console"
      className={cn(loose ? 'console-page-loose' : 'console-page', className)}
    >
      {children}
    </div>
  );
}

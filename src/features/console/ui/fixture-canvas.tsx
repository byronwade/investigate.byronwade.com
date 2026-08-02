import type * as React from 'react';

import { cn } from '#/lib/utils';

export function FixtureCanvas({
  children,
  className,
  showGrid = true,
  label,
  caption,
}: {
  children?: React.ReactNode;
  className?: string;
  showGrid?: boolean;
  label?: string;
  caption?: string;
}): React.JSX.Element {
  return (
    <div className={cn('console-canvas', className)}>
      {showGrid ? <div aria-hidden="true" className="console-canvas-grid" /> : null}
      {(label || caption) && (
        <div className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center px-4">
          <div className="space-y-1 text-center">
            {label ? (
              <p className="text-[13px] font-medium text-[var(--console-ink)]">{label}</p>
            ) : null}
            {caption ? <p className="text-[12px] text-[var(--console-muted)]">{caption}</p> : null}
          </div>
        </div>
      )}
      {children}
    </div>
  );
}

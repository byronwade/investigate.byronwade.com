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
        <div className="pointer-events-none absolute inset-x-0 top-0 z-[1] px-3 pt-3">
          <div className="max-w-[70%] space-y-0.5">
            {label ? (
              <p className="text-[12px] font-medium text-[var(--console-ink)]">{label}</p>
            ) : null}
            {caption ? <p className="text-[11px] text-[var(--console-muted)]">{caption}</p> : null}
          </div>
        </div>
      )}
      <div className="absolute inset-0 z-[2]">{children}</div>
    </div>
  );
}

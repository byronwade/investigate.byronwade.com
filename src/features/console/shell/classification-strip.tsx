import type * as React from 'react';

import { StatusDot } from '#/features/console/ui/status-dot';

export function ClassificationStrip(): React.JSX.Element {
  return (
    <header className="flex min-h-[var(--console-class-height)] shrink-0 flex-wrap items-center justify-between gap-x-3 gap-y-1 border-b border-[var(--console-hairline)] bg-[var(--console-strip)] px-3 py-1 sm:px-5">
      <div className="flex min-w-0 items-center gap-2">
        <StatusDot tone="ok" />
        <span className="truncate font-[family-name:var(--console-font-mono)] text-[10px] font-medium tracking-[0.06em] text-[var(--console-ink)] sm:text-[11px]">
          {'UNCLASSIFIED // LES'}
        </span>
        <span className="hidden font-[family-name:var(--console-font-mono)] text-[11px] tracking-[0.04em] text-[var(--console-muted)] sm:inline">
          FOUO · ORCON · NOFORN
        </span>
      </div>
      <span className="hidden font-[family-name:var(--console-font-mono)] text-[11px] tracking-[0.04em] text-[var(--console-muted)] md:inline">
        28 CFR 23 active · every action audited
      </span>
    </header>
  );
}

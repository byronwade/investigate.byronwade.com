import type * as React from 'react';

import { StatusDot } from '#/features/console/ui/status-dot';

export function ClassificationStrip(): React.JSX.Element {
  return (
    <output
      className="flex h-[var(--console-class-height)] shrink-0 items-center justify-between border-b border-[var(--console-hairline)] bg-[var(--console-strip)] px-5"
      aria-label="Classification"
    >
      <div className="flex items-center gap-2">
        <StatusDot tone="ok" />
        <span className="font-[family-name:var(--console-font-mono)] text-[11px] font-medium tracking-[0.06em] text-[var(--console-ink)]">
          {'UNCLASSIFIED // LAW ENFORCEMENT SENSITIVE'}
        </span>
        <span className="font-[family-name:var(--console-font-mono)] text-[11px] tracking-[0.04em] text-[var(--console-muted)]">
          FOUO · ORCON · NOFORN
        </span>
      </div>
      <span className="font-[family-name:var(--console-font-mono)] text-[11px] tracking-[0.04em] text-[var(--console-muted)]">
        28 CFR 23 active · every action audited
      </span>
    </output>
  );
}

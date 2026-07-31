import { Clock } from '@phosphor-icons/react/dist/csr/Clock';
import type * as React from 'react';

import { listTimeline } from '#/features/console/data';
import { PageHeader } from '#/features/console/ui/page-header';
import { StatusDot } from '#/features/console/ui/status-dot';

export function TimelinePage({ caseId }: { caseId: string }): React.JSX.Element {
  const events = listTimeline(caseId);

  return (
    <div className="space-y-6" data-surface="console">
      <PageHeader
        title="Timeline"
        meta={
          <span className="text-[13px] text-[var(--console-muted)]">{events.length} events</span>
        }
      />

      <ol className="max-w-[900px] space-y-0">
        {events.map((event) => (
          <li
            key={event.id}
            className="flex gap-3 border-b border-[var(--console-strip)] py-3 last:border-b-0"
          >
            <div className="flex w-3.5 shrink-0 justify-center pt-1.5">
              <StatusDot tone="muted" />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-2 text-[12px] text-[var(--console-muted)]">
                <Clock aria-hidden="true" weight="duotone" className="size-3.5 shrink-0" />
                <time className="font-[family-name:var(--console-font-mono)]">{event.atLabel}</time>
                <span aria-hidden="true" className="text-[var(--console-hairline)]">
                  ·
                </span>
                <span className="font-[family-name:var(--console-font-mono)] tracking-wide uppercase">
                  {event.kind}
                </span>
              </div>
              <p className="text-[14px] leading-[21px] text-[var(--console-ink)]">
                {event.summary}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

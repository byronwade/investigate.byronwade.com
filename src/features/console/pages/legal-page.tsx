import { Gavel } from '@phosphor-icons/react/dist/csr/Gavel';
import type * as React from 'react';

import { Badge } from '#/components/ui/badge';
import { getLegalProcess } from '#/features/console/data/agency-getters';
import { EmptyState } from '#/features/console/ui/empty-state';
import { PageHeader } from '#/features/console/ui/page-header';
import { StatusDot } from '#/features/console/ui/status-dot';

export function LegalPage({ caseId }: { caseId: string }): React.JSX.Element | null {
  const model = getLegalProcess(caseId);
  if (!model) {
    return null;
  }

  return (
    <div className="space-y-6" data-surface="console">
      <PageHeader
        title={model.title}
        description={model.description}
        meta={
          <span className="inline-flex items-center gap-2">
            <Gavel aria-hidden="true" weight="duotone" className="size-3.5" />
            {model.meta}
          </span>
        }
      />

      {model.items.length === 0 ? (
        <EmptyState
          title="No legal process"
          description="Subpoenas and warrants will appear as process is opened."
        />
      ) : (
        <ul className="divide-y divide-[var(--console-strip)] border-t border-[var(--console-hairline)]">
          {model.items.map((item) => (
            <li
              key={item.id}
              className="flex min-h-11 flex-col gap-2 py-3 sm:flex-row sm:items-center sm:gap-3.5"
            >
              <div className="flex min-w-0 flex-1 items-start gap-2.5">
                <StatusDot tone={item.tone} />
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[13px] font-medium text-[var(--console-ink)]">
                      {item.title}
                    </p>
                    <Badge variant="secondary" className="rounded-md">
                      {item.kind}
                    </Badge>
                  </div>
                  <p className="text-[13px] text-[var(--console-body)]">{item.summary}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 pl-5 sm:pl-0">
                {item.due ? (
                  <span className="text-[12px] text-[var(--console-muted)]">{item.due}</span>
                ) : null}
                <span className="text-[12px] text-[var(--console-muted)] sm:w-32 sm:text-right">
                  {item.status}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

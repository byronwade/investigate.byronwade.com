import { ChartBar } from '@phosphor-icons/react/dist/csr/ChartBar';
import type * as React from 'react';

import { getReports } from '#/features/console/data/agency-getters';
import { DirectoryList } from '#/features/console/pages/directory-list';
import { PageHeader } from '#/features/console/ui/page-header';
import { StatusDot } from '#/features/console/ui/status-dot';

export function ReportsPage(): React.JSX.Element {
  const model = getReports();

  return (
    <div className="space-y-8" data-surface="console">
      <PageHeader
        title={model.title}
        description={model.description}
        meta={
          <span className="inline-flex items-center gap-2">
            <ChartBar aria-hidden="true" weight="duotone" className="size-3.5" />
            {model.meta}
          </span>
        }
      />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {model.metrics.map((metric) => (
          <div
            key={metric.id}
            className="space-y-2 rounded-lg border border-[var(--console-hairline)] px-4 py-4"
          >
            <div className="flex items-center gap-2">
              <StatusDot tone={metric.tone} />
              <p className="text-[12px] text-[var(--console-muted)]">{metric.label}</p>
            </div>
            <p className="font-[family-name:var(--console-font-mono)] text-[28px] font-semibold tracking-tight text-[var(--console-ink)]">
              {metric.value}
            </p>
            <p className="text-[12px] leading-5 text-[var(--console-body)]">{metric.detail}</p>
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="text-[13px] font-semibold text-[var(--console-ink)]">Watch items</h2>
        <DirectoryList
          entries={model.notes}
          filters={['All', 'SLA', 'Assistants']}
          filterLabel="Filter report notes"
        />
      </section>
    </div>
  );
}

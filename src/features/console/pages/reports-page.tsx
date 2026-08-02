import { ChartBar } from '@phosphor-icons/react/dist/csr/ChartBar';
import type * as React from 'react';

import { getReports } from '#/features/console/data/agency-getters';
import { DirectoryList } from '#/features/console/pages/directory-list';
import { ConsolePage } from '#/features/console/ui/console-page';
import { PageHeader } from '#/features/console/ui/page-header';
import { SectionHeader } from '#/features/console/ui/section-header';
import { StatusDot } from '#/features/console/ui/status-dot';

export function ReportsPage(): React.JSX.Element {
  const model = getReports();

  return (
    <ConsolePage loose>
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

      <section aria-label="Weekly metrics" className="console-metric-strip">
        {model.metrics.map((metric) => (
          <div key={metric.id} className="console-metric-cell">
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
        <SectionHeader
          title="Watch items"
          hint="Aggregate notes without case facts in the metric tiles"
        />
        <DirectoryList
          entries={model.notes}
          filters={['All', 'SLA', 'Assistants']}
          filterLabel="Filter report notes"
        />
      </section>
    </ConsolePage>
  );
}

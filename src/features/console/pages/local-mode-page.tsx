import { WifiHigh } from '@phosphor-icons/react/dist/csr/WifiHigh';
import type * as React from 'react';

import { Badge } from '#/components/ui/badge';
import { getLocalMode } from '#/features/console/data/agency-getters';
import { DirectoryList } from '#/features/console/pages/directory-list';
import { PageHeader } from '#/features/console/ui/page-header';
import { StatusDot } from '#/features/console/ui/status-dot';

export function LocalModePage(): React.JSX.Element {
  const model = getLocalMode();

  return (
    <div className="space-y-8" data-surface="console">
      <PageHeader
        title={model.title}
        description={model.description}
        meta={
          <span className="inline-flex items-center gap-2">
            <WifiHigh aria-hidden="true" weight="duotone" className="size-3.5" />
            {model.meta}
          </span>
        }
      />

      <section className="flex flex-col gap-3 rounded-lg border border-[var(--console-hairline)] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <StatusDot tone={model.networkTone} />
          <div>
            <p className="text-[13px] font-medium text-[var(--console-ink)]">Network</p>
            <p className="text-[12px] text-[var(--console-muted)]">
              Last sync {model.lastSync} · never pretend live data when offline
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="w-fit rounded-md">
          {model.networkLabel}
        </Badge>
      </section>

      <section className="space-y-3">
        <h2 className="text-[13px] font-semibold text-[var(--console-ink)]">Local queues</h2>
        <DirectoryList
          entries={model.queue}
          filters={['All', 'Queue', 'Media']}
          filterLabel="Filter local queues"
        />
      </section>
    </div>
  );
}

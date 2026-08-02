import type * as React from 'react';

import { Badge } from '#/components/ui/badge';
import type { DocsPageModel } from '#/features/console/data/agency-types';
import { ConsolePage } from '#/features/console/ui/console-page';
import { PageHeader } from '#/features/console/ui/page-header';
import { StatusDot } from '#/features/console/ui/status-dot';

export function DocsPage({ model }: { model: DocsPageModel }): React.JSX.Element {
  return (
    <ConsolePage>
      <PageHeader title={model.title} description={model.description} meta={model.meta} />

      <ul className="console-list">
        {model.principles.map((principle) => (
          <li key={principle.id} className="console-row !items-start !py-4">
            <StatusDot tone={principle.tone} />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-[14px] font-semibold text-[var(--console-ink)]">
                  {principle.title}
                </h2>
                <Badge variant="secondary" className="rounded-md">
                  {principle.summary}
                </Badge>
              </div>
              <p className="text-[13px] leading-6 text-[var(--console-body)]">{principle.detail}</p>
            </div>
          </li>
        ))}
      </ul>
    </ConsolePage>
  );
}

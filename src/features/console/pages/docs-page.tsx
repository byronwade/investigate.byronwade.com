import type * as React from 'react';

import { Badge } from '#/components/ui/badge';
import type { DocsPageModel } from '#/features/console/data/agency-types';
import { PageHeader } from '#/features/console/ui/page-header';
import { StatusDot } from '#/features/console/ui/status-dot';

export function DocsPage({ model }: { model: DocsPageModel }): React.JSX.Element {
  return (
    <div className="space-y-6" data-surface="console">
      <PageHeader title={model.title} description={model.description} meta={model.meta} />

      <ul className="space-y-3">
        {model.principles.map((principle) => (
          <li
            key={principle.id}
            className="space-y-2 rounded-lg border border-[var(--console-hairline)] px-4 py-4"
          >
            <div className="flex flex-wrap items-center gap-2">
              <StatusDot tone={principle.tone} />
              <h2 className="text-[14px] font-semibold text-[var(--console-ink)]">
                {principle.title}
              </h2>
              <Badge variant="secondary" className="rounded-md">
                {principle.summary}
              </Badge>
            </div>
            <p className="text-[13px] leading-6 text-[var(--console-body)]">{principle.detail}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

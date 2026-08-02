import type * as React from 'react';

import { Badge } from '#/components/ui/badge';
import type { CaseQueueModel } from '#/features/console/data/agency-types';
import { ConsoleLink } from '#/features/console/shell/console-link';
import { ConsolePage } from '#/features/console/ui/console-page';
import { EmptyState } from '#/features/console/ui/empty-state';
import { PageHeader } from '#/features/console/ui/page-header';
import { StatusDot } from '#/features/console/ui/status-dot';

export function CaseQueuePage({ model }: { model: CaseQueueModel }): React.JSX.Element {
  return (
    <ConsolePage>
      <PageHeader title={model.title} description={model.description} meta={model.meta} />

      {model.items.length === 0 ? (
        <EmptyState
          title="Nothing in this queue"
          description="Items appear here as the investigation advances."
        />
      ) : (
        <ul className="console-list">
          {model.items.map((item) => {
            const body = (
              <div className="console-row">
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
                <div className="flex flex-wrap items-center gap-3">
                  {item.due ? (
                    <span className="text-[12px] text-[var(--console-muted)]">{item.due}</span>
                  ) : null}
                  <span className="text-[12px] text-[var(--console-muted)] sm:w-28 sm:text-right">
                    {item.status}
                  </span>
                </div>
              </div>
            );

            return (
              <li key={item.id}>
                {item.href ? (
                  <ConsoleLink
                    to={item.href}
                    className="block rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--console-ink)]"
                  >
                    {body}
                  </ConsoleLink>
                ) : (
                  body
                )}
              </li>
            );
          })}
        </ul>
      )}
    </ConsolePage>
  );
}

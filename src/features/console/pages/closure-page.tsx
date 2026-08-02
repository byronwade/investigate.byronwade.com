import { FlagCheckered } from '@phosphor-icons/react/dist/csr/FlagCheckered';
import type * as React from 'react';

import { Badge } from '#/components/ui/badge';
import { Button } from '#/components/ui/button';
import { getClosure } from '#/features/console/data/agency-getters';
import { EmptyState } from '#/features/console/ui/empty-state';
import { PageHeader } from '#/features/console/ui/page-header';
import { StatusDot } from '#/features/console/ui/status-dot';

export function ClosurePage({ caseId }: { caseId: string }): React.JSX.Element | null {
  const model = getClosure(caseId);
  if (!model) {
    return null;
  }

  const incomplete = model.items.filter((item) => !item.complete).length;

  return (
    <div className="space-y-6" data-surface="console">
      <PageHeader
        title={model.title}
        description={model.description}
        meta={
          <span className="inline-flex items-center gap-2">
            <FlagCheckered aria-hidden="true" weight="duotone" className="size-3.5" />
            {model.meta}
          </span>
        }
        actions={
          <Button
            type="button"
            size="sm"
            className="h-11 rounded-[7px] sm:h-[30px]"
            disabled={incomplete > 0}
          >
            {incomplete > 0 ? 'Close blocked' : 'Close case'}
          </Button>
        }
      />

      {model.items.length === 0 ? (
        <EmptyState title="No closure checklist" description="Checklist items will appear here." />
      ) : (
        <ul className="space-y-3">
          {model.items.map((item) => (
            <li
              key={item.id}
              className="flex flex-col gap-3 rounded-lg border border-[var(--console-hairline)] px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusDot tone={item.tone} />
                  <h2 className="text-[14px] font-semibold text-[var(--console-ink)]">
                    {item.title}
                  </h2>
                  <Badge variant={item.complete ? 'secondary' : 'outline'} className="rounded-md">
                    {item.status}
                  </Badge>
                </div>
                <p className="text-[13px] text-[var(--console-body)]">{item.summary}</p>
              </div>
              <p className="text-[12px] text-[var(--console-muted)] sm:text-right">
                {item.complete ? 'Complete' : 'Incomplete'}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

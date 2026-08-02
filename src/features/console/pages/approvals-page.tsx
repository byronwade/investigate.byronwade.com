import { CheckCircle } from '@phosphor-icons/react/dist/csr/CheckCircle';
import type * as React from 'react';

import { Badge } from '#/components/ui/badge';
import { Button } from '#/components/ui/button';
import { getApprovals } from '#/features/console/data/agency-getters';
import { EmptyState } from '#/features/console/ui/empty-state';
import { PageHeader } from '#/features/console/ui/page-header';
import { StatusDot } from '#/features/console/ui/status-dot';

export function ApprovalsPage({ caseId }: { caseId: string }): React.JSX.Element | null {
  const model = getApprovals(caseId);
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
            <CheckCircle aria-hidden="true" weight="duotone" className="size-3.5" />
            {model.meta}
          </span>
        }
      />

      {model.items.length === 0 ? (
        <EmptyState
          title="No pending approvals"
          description="Technique and process approvals land here when a human signature is required."
        />
      ) : (
        <ul className="space-y-3">
          {model.items.map((item) => (
            <li
              key={item.id}
              className="space-y-3 rounded-lg border border-[var(--console-hairline)] px-4 py-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <StatusDot tone={item.tone} />
                <h2 className="text-[14px] font-semibold text-[var(--console-ink)]">
                  {item.title}
                </h2>
                <Badge variant="secondary" className="rounded-md">
                  due {item.due}
                </Badge>
              </div>
              <p className="text-[13px] leading-5 text-[var(--console-body)]">{item.summary}</p>
              <p className="text-[12px] text-[var(--console-muted)]">
                Requested of {item.requester} · {item.decisionNote}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button type="button" size="sm" className="h-11 rounded-[7px] sm:h-[30px]">
                  Approve
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-11 rounded-[7px] sm:h-[30px]"
                >
                  Request revision
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-11 rounded-[7px] sm:h-[30px]"
                >
                  Defer
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

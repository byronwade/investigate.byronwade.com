'use client';

import { CheckCircle } from '@phosphor-icons/react/dist/csr/CheckCircle';
import type * as React from 'react';
import { useState } from 'react';

import { Badge } from '#/components/ui/badge';
import { Button } from '#/components/ui/button';
import { getApprovals } from '#/features/console/data/agency-getters';
import type { ApprovalItem } from '#/features/console/data/agency-types';
import { consoleActionClass } from '#/features/console/ui/console-action';
import { ConsolePage } from '#/features/console/ui/console-page';
import { useConsoleToast } from '#/features/console/ui/console-toast';
import { EmptyState } from '#/features/console/ui/empty-state';
import { PageHeader } from '#/features/console/ui/page-header';
import { StatusDot } from '#/features/console/ui/status-dot';

export function ApprovalsPage({ caseId }: { caseId: string }): React.JSX.Element | null {
  const model = getApprovals(caseId);
  const { push } = useConsoleToast();
  const [items, setItems] = useState<ApprovalItem[]>(() => model?.items ?? []);

  if (!model) {
    return null;
  }

  function resolve(item: ApprovalItem, action: 'approved' | 'revision' | 'deferred') {
    setItems((current) => current.filter((entry) => entry.id !== item.id));
    if (action === 'approved') {
      push(`Approved · ${item.title}`, 'ok');
      return;
    }
    if (action === 'revision') {
      push(`Revision requested · ${item.title}`, 'warn');
      return;
    }
    push(`Deferred · ${item.title}`, 'neutral');
  }

  return (
    <ConsolePage>
      <PageHeader
        title={model.title}
        description={model.description}
        meta={
          <span className="inline-flex items-center gap-2">
            <CheckCircle aria-hidden="true" weight="duotone" className="size-3.5" />
            {items.length === 0 ? 'Queue clear' : `${items.length} pending`}
          </span>
        }
      />

      {items.length === 0 ? (
        <EmptyState
          title="No pending approvals"
          description="Technique and process approvals land here when a human signature is required."
        />
      ) : (
        <ul className="console-list">
          {items.map((item) => (
            <li key={item.id} className="console-row !items-start !py-4">
              <div className="min-w-0 flex-1 space-y-3">
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
                  <Button
                    type="button"
                    size="sm"
                    className={consoleActionClass}
                    onClick={() => resolve(item, 'approved')}
                  >
                    Approve
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={consoleActionClass}
                    onClick={() => resolve(item, 'revision')}
                  >
                    Request revision
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={consoleActionClass}
                    onClick={() => resolve(item, 'deferred')}
                  >
                    Defer
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </ConsolePage>
  );
}

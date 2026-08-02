'use client';

import { FlagCheckered } from '@phosphor-icons/react/dist/csr/FlagCheckered';
import type * as React from 'react';
import { useState } from 'react';

import { Badge } from '#/components/ui/badge';
import { Button } from '#/components/ui/button';
import { getClosure } from '#/features/console/data/agency-getters';
import type { ClosureCheckItem } from '#/features/console/data/agency-types';
import { consoleActionClass } from '#/features/console/ui/console-action';
import { ConsolePage } from '#/features/console/ui/console-page';
import { useConsoleToast } from '#/features/console/ui/console-toast';
import { EmptyState } from '#/features/console/ui/empty-state';
import { PageHeader } from '#/features/console/ui/page-header';
import { StatusDot } from '#/features/console/ui/status-dot';

export function ClosurePage({ caseId }: { caseId: string }): React.JSX.Element | null {
  const model = getClosure(caseId);
  const { push } = useConsoleToast();
  const [items, setItems] = useState<ClosureCheckItem[]>(() => model?.items ?? []);
  const [closed, setClosed] = useState(false);

  if (!model) {
    return null;
  }

  const incomplete = items.filter((item) => !item.complete).length;

  function toggleItem(item: ClosureCheckItem) {
    setItems((current) =>
      current.map((entry) =>
        entry.id === item.id
          ? {
              ...entry,
              complete: !entry.complete,
              status: entry.complete ? 'Incomplete' : 'Complete',
              tone: entry.complete ? 'warn' : 'ok',
            }
          : entry,
      ),
    );
    push(item.complete ? `Reopened · ${item.title}` : `Checked · ${item.title}`, 'neutral');
  }

  function closeCase() {
    if (incomplete > 0 || closed) {
      return;
    }
    setClosed(true);
    push('Case closed — handoff package sealed', 'ok');
  }

  return (
    <ConsolePage>
      <PageHeader
        title={model.title}
        description={model.description}
        meta={
          <span className="inline-flex items-center gap-2">
            <FlagCheckered aria-hidden="true" weight="duotone" className="size-3.5" />
            {closed ? 'Closed' : incomplete > 0 ? `${incomplete} incomplete` : 'Ready to close'}
          </span>
        }
        actions={
          <Button
            type="button"
            size="sm"
            className={consoleActionClass}
            disabled={incomplete > 0 || closed}
            onClick={closeCase}
          >
            {closed ? 'Case closed' : incomplete > 0 ? 'Close blocked' : 'Close case'}
          </Button>
        }
      />

      {items.length === 0 ? (
        <EmptyState title="No closure checklist" description="Checklist items will appear here." />
      ) : (
        <ul className="console-list">
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className="console-row w-full text-left"
                onClick={() => toggleItem(item)}
                aria-pressed={item.complete}
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusDot tone={item.tone} />
                    <h2 className="text-[14px] font-semibold text-[var(--console-ink)]">
                      {item.title}
                    </h2>
                    <Badge variant={item.complete ? 'secondary' : 'outline'} className="rounded-md">
                      {item.status}
                    </Badge>
                  </div>
                  <p className="pl-5 text-[13px] text-[var(--console-body)] sm:pl-0">
                    {item.summary}
                  </p>
                </div>
                <p className="text-[12px] text-[var(--console-muted)] sm:w-24 sm:text-right">
                  {item.complete ? 'Complete' : 'Tap to check'}
                </p>
              </button>
            </li>
          ))}
        </ul>
      )}
    </ConsolePage>
  );
}

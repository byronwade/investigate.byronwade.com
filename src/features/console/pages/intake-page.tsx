'use client';

import type * as React from 'react';
import { useState } from 'react';

import { Badge } from '#/components/ui/badge';
import { Button } from '#/components/ui/button';
import { Separator } from '#/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '#/components/ui/tabs';
import { getIntake } from '#/features/console/data/agency-getters';
import type { IntakeQueueItem } from '#/features/console/data/agency-types';
import { ConsoleLink } from '#/features/console/shell/console-link';
import { EmptyState } from '#/features/console/ui/empty-state';
import { PageHeader } from '#/features/console/ui/page-header';
import { StatusDot } from '#/features/console/ui/status-dot';

type QueueFilter = 'all' | 'mine' | 'unassigned' | 'squad';

function filterQueue(queue: IntakeQueueItem[], filter: QueueFilter): IntakeQueueItem[] {
  if (filter === 'all') {
    return queue;
  }
  return queue.filter((item) => item.owner === filter);
}

export function IntakePage(): React.JSX.Element {
  const model = getIntake();
  const [filter, setFilter] = useState<QueueFilter>('all');
  const [selectedId, setSelectedId] = useState(model.selectedId);
  const filtered = filterQueue(model.queue, filter);
  const selected = filtered.find((item) => item.id === selectedId) ?? filtered[0] ?? null;

  return (
    <div className="space-y-6" data-surface="console">
      <PageHeader
        title={model.title}
        description={model.description}
        meta={model.meta}
        actions={
          <Button type="button" size="sm" className="h-11 rounded-[7px] sm:h-[30px]" asChild>
            <ConsoleLink to="/console/command-center">Back to command</ConsoleLink>
          </Button>
        }
      />

      <Tabs
        value={filter}
        onValueChange={(value) => setFilter(value as QueueFilter)}
        className="gap-4"
      >
        <TabsList className="h-auto w-full flex-wrap justify-start rounded-md bg-[var(--console-strip)] p-1">
          <TabsTrigger value="all" className="min-h-10 flex-none px-3 text-[13px]">
            All ({model.queue.length})
          </TabsTrigger>
          <TabsTrigger value="mine" className="min-h-10 flex-none px-3 text-[13px]">
            Mine
          </TabsTrigger>
          <TabsTrigger value="unassigned" className="min-h-10 flex-none px-3 text-[13px]">
            Unassigned
          </TabsTrigger>
          <TabsTrigger value="squad" className="min-h-10 flex-none px-3 text-[13px]">
            Squad
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {filtered.length === 0 ? (
        <EmptyState
          title="No tips in this queue"
          description="Switch filters or return later — overnight intake does not auto-open cases."
        />
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <ul className="divide-y divide-[var(--console-strip)] border-t border-[var(--console-hairline)]">
            {filtered.map((item) => {
              const isSelected = selected?.id === item.id;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    className={
                      isSelected
                        ? 'flex w-full flex-col gap-1 bg-[var(--console-strip)] px-2 py-3 text-left sm:flex-row sm:items-center sm:gap-3.5'
                        : 'flex w-full flex-col gap-1 px-2 py-3 text-left hover:bg-[var(--console-strip)] sm:flex-row sm:items-center sm:gap-3.5'
                    }
                    aria-pressed={isSelected}
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <StatusDot tone={item.tone} />
                      <span className="font-[family-name:var(--console-font-mono)] text-[12px] font-medium text-[var(--console-ink)]">
                        {item.tipId}
                      </span>
                    </div>
                    <span className="min-w-0 flex-1 pl-5 text-[13px] text-[var(--console-ink)] sm:pl-0">
                      {item.summary}
                    </span>
                    <span className="pl-5 text-[12px] text-[var(--console-muted)] sm:w-[120px] sm:shrink-0 sm:pl-0 sm:text-right">
                      {item.classification}
                    </span>
                    <span className="pl-5 text-[12px] text-[var(--console-muted)] sm:w-20 sm:shrink-0 sm:pl-0 sm:text-right">
                      {item.priority}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <aside className="space-y-4 rounded-lg border border-[var(--console-hairline)] p-4">
            {selected ? (
              <>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusDot tone={selected.tone} />
                    <h2 className="font-[family-name:var(--console-font-mono)] text-[13px] font-semibold text-[var(--console-ink)]">
                      {selected.tipId}
                    </h2>
                    <Badge variant="secondary" className="rounded-md">
                      {selected.classification}
                    </Badge>
                  </div>
                  <p className="text-[12px] text-[var(--console-muted)]">
                    {selected.submittedLabel}
                  </p>
                </div>
                <p className="text-[13px] leading-5 text-[var(--console-body)]">
                  {selected.summary}
                </p>
                <Separator />
                <dl className="space-y-3">
                  {selected.extractedFields.map((field) => (
                    <div key={field.label} className="space-y-1">
                      <dt className="text-[11px] font-medium tracking-wide text-[var(--console-muted)] uppercase">
                        {field.label}
                      </dt>
                      <dd className="text-[13px] text-[var(--console-ink)]">{field.value}</dd>
                    </div>
                  ))}
                </dl>
                <Separator />
                <div className="flex flex-wrap gap-2">
                  <Button type="button" size="sm" className="h-11 rounded-[7px] sm:h-[30px]">
                    Open case
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-11 rounded-[7px] sm:h-[30px]"
                  >
                    Refer
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-11 rounded-[7px] sm:h-[30px]"
                  >
                    Decline
                  </Button>
                </div>
                <p className="text-[11px] text-[var(--console-muted)]">
                  No tip auto-opens. Open / refer / decline are human-only decisions.
                </p>
              </>
            ) : (
              <EmptyState
                title="Select a tip"
                description="Choose a queue item to review extraction."
              />
            )}
          </aside>
        </div>
      )}
    </div>
  );
}

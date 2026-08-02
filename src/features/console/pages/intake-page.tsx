'use client';

import type * as React from 'react';
import { useState } from 'react';

import { Badge } from '#/components/ui/badge';
import { Button } from '#/components/ui/button';
import { Separator } from '#/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '#/components/ui/tabs';
import { DEFAULT_CASE_ID } from '#/features/console/data';
import { getIntake } from '#/features/console/data/agency-getters';
import type { IntakeQueueItem } from '#/features/console/data/agency-types';
import { ConsoleLink } from '#/features/console/shell/console-link';
import { consoleActionClass } from '#/features/console/ui/console-action';
import { ConsolePage } from '#/features/console/ui/console-page';
import { useConsoleToast } from '#/features/console/ui/console-toast';
import { DetailPanel } from '#/features/console/ui/detail-panel';
import { EmptyState } from '#/features/console/ui/empty-state';
import { PageHeader } from '#/features/console/ui/page-header';
import { StatusDot } from '#/features/console/ui/status-dot';
import { cn } from '#/lib/utils';

type QueueFilter = 'all' | 'mine' | 'unassigned' | 'squad';

function filterQueue(queue: IntakeQueueItem[], filter: QueueFilter): IntakeQueueItem[] {
  if (filter === 'all') {
    return queue;
  }
  return queue.filter((item) => item.owner === filter);
}

function caseHrefForTip(item: IntakeQueueItem): string {
  if (item.summary.toLowerCase().includes('halstead')) {
    return '/console/cases/halstead/overview';
  }
  return `/console/cases/${DEFAULT_CASE_ID}/overview`;
}

export function IntakePage(): React.JSX.Element {
  const model = getIntake();
  const { push } = useConsoleToast();
  const [filter, setFilter] = useState<QueueFilter>('all');
  const [queue, setQueue] = useState(model.queue);
  const [selectedId, setSelectedId] = useState(model.selectedId);
  const filtered = filterQueue(queue, filter);
  const selected = filtered.find((item) => item.id === selectedId) ?? filtered[0] ?? null;

  function dismiss(item: IntakeQueueItem, action: 'referred' | 'declined') {
    setQueue((current) => current.filter((entry) => entry.id !== item.id));
    push(
      action === 'referred' ? `Referred · ${item.tipId}` : `Declined · ${item.tipId}`,
      action === 'referred' ? 'warn' : 'neutral',
    );
  }

  return (
    <ConsolePage>
      <PageHeader
        title={model.title}
        description={model.description}
        meta={`${queue.length} awaiting triage`}
        actions={
          <Button type="button" size="sm" className={consoleActionClass} asChild>
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
            All ({queue.length})
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
          <ul className="console-list">
            {filtered.map((item) => {
              const isSelected = selected?.id === item.id;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    className={cn('console-row', isSelected && 'console-row-active')}
                    aria-pressed={isSelected}
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <StatusDot tone={item.tone} />
                      <span className="console-meta !text-[var(--console-ink)] !font-medium">
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

          <DetailPanel>
            {selected ? (
              <>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusDot tone={selected.tone} />
                    <h2 className="console-meta !text-[13px] !font-semibold !text-[var(--console-ink)]">
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
                <Separator className="bg-[var(--console-hairline)]" />
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
                <Separator className="bg-[var(--console-hairline)]" />
                <div className="flex flex-wrap gap-2">
                  <Button type="button" size="sm" className={consoleActionClass} asChild>
                    <ConsoleLink
                      to={caseHrefForTip(selected)}
                      onClick={() => push(`Opening case from ${selected.tipId}`, 'ok')}
                    >
                      Open case
                    </ConsoleLink>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={consoleActionClass}
                    onClick={() => dismiss(selected, 'referred')}
                  >
                    Refer
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={consoleActionClass}
                    onClick={() => dismiss(selected, 'declined')}
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
          </DetailPanel>
        </div>
      )}
    </ConsolePage>
  );
}

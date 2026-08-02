'use client';

import type * as React from 'react';
import { useState } from 'react';

import { Badge } from '#/components/ui/badge';
import { Button } from '#/components/ui/button';
import { Separator } from '#/components/ui/separator';
import { DEFAULT_CASE_ID } from '#/features/console/data';
import { getIntake } from '#/features/console/data/agency-getters';
import type { IntakeQueueItem } from '#/features/console/data/agency-types';
import { ConsoleLink } from '#/features/console/shell/console-link';
import { consoleActionClass } from '#/features/console/ui/console-action';
import { ConsolePage } from '#/features/console/ui/console-page';
import { useConsoleToast } from '#/features/console/ui/console-toast';
import { DetailPanel } from '#/features/console/ui/detail-panel';
import { EmptyState } from '#/features/console/ui/empty-state';
import { FilterBar } from '#/features/console/ui/filter-bar';
import { PageHeader } from '#/features/console/ui/page-header';
import { StatusDot } from '#/features/console/ui/status-dot';
import { cn } from '#/lib/utils';

const QUEUE_FILTERS = ['All', 'Mine', 'Unassigned', 'Squad'] as const;
type QueueFilter = (typeof QUEUE_FILTERS)[number];

function filterQueue(queue: IntakeQueueItem[], filter: QueueFilter): IntakeQueueItem[] {
  if (filter === 'All') {
    return queue;
  }
  const owner = filter.toLowerCase() as IntakeQueueItem['owner'];
  return queue.filter((item) => item.owner === owner);
}

function caseHrefForTip(item: IntakeQueueItem): string {
  if (item.summary.toLowerCase().includes('halstead')) {
    return '/console/cases/halstead/overview';
  }
  return `/console/cases/${DEFAULT_CASE_ID}/overview`;
}

function TipActions({
  item,
  onRefer,
  onDecline,
  onOpen,
}: {
  item: IntakeQueueItem;
  onRefer: () => void;
  onDecline: () => void;
  onOpen: () => void;
}): React.JSX.Element {
  return (
    <div className="console-actions">
      <Button type="button" size="sm" className={consoleActionClass} asChild>
        <ConsoleLink to={caseHrefForTip(item)} onClick={onOpen}>
          Open case
        </ConsoleLink>
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={consoleActionClass}
        onClick={onRefer}
      >
        Refer
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={consoleActionClass}
        onClick={onDecline}
      >
        Decline
      </Button>
    </div>
  );
}

export function IntakePage(): React.JSX.Element {
  const model = getIntake();
  const { push } = useConsoleToast();
  const [filter, setFilter] = useState<QueueFilter>('All');
  const [queue, setQueue] = useState(model.queue);
  const [selectedId, setSelectedId] = useState(model.selectedId);
  const filtered = filterQueue(queue, filter);
  const selected = filtered.find((item) => item.id === selectedId) ?? filtered[0] ?? null;
  const filterOptions = QUEUE_FILTERS.map((option) =>
    option === 'All' ? `All (${queue.length})` : option,
  );
  const filterValue = filter === 'All' ? `All (${queue.length})` : filter;

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
        hideTitleOnMobile
        description={model.description}
        meta={`${queue.length} awaiting triage`}
      />

      <FilterBar
        options={[...filterOptions]}
        value={filterValue}
        onChange={(value) => {
          setFilter(value.startsWith('All') ? 'All' : (value as QueueFilter));
        }}
        legend="Intake queue filters"
      />

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
                    <div className="flex min-w-0 items-center gap-2">
                      <StatusDot tone={item.tone} />
                      <span className="console-meta !text-[var(--console-ink)] !font-medium">
                        {item.tipId}
                      </span>
                      <span className="ml-auto text-[12px] text-[var(--console-muted)]">
                        {item.priority}
                      </span>
                    </div>
                    <p className="text-[13px] leading-5 text-[var(--console-ink)]">
                      {item.summary}
                    </p>
                    <p className="text-[12px] text-[var(--console-muted)]">{item.classification}</p>
                  </button>
                  {isSelected ? (
                    <div className="space-y-3 border-b border-[var(--console-strip)] px-1 pt-1 pb-4 xl:hidden">
                      <p className="text-[12px] text-[var(--console-muted)]">
                        {item.submittedLabel}
                      </p>
                      <dl className="space-y-2">
                        {item.extractedFields.slice(0, 2).map((field) => (
                          <div key={field.label} className="space-y-0.5">
                            <dt className="text-[11px] font-medium tracking-wide text-[var(--console-muted)] uppercase">
                              {field.label}
                            </dt>
                            <dd className="text-[13px] text-[var(--console-ink)]">{field.value}</dd>
                          </div>
                        ))}
                      </dl>
                      <TipActions
                        item={item}
                        onOpen={() => push(`Opening case from ${item.tipId}`, 'ok')}
                        onRefer={() => dismiss(item, 'referred')}
                        onDecline={() => dismiss(item, 'declined')}
                      />
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>

          <DetailPanel className="hidden xl:flex">
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
                <TipActions
                  item={selected}
                  onOpen={() => push(`Opening case from ${selected.tipId}`, 'ok')}
                  onRefer={() => dismiss(selected, 'referred')}
                  onDecline={() => dismiss(selected, 'declined')}
                />
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

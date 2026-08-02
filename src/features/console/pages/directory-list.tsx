'use client';

import type * as React from 'react';
import { useState } from 'react';

import { Badge } from '#/components/ui/badge';
import { Input } from '#/components/ui/input';
import type { DirectoryEntry } from '#/features/console/data/agency-types';
import { ConsoleLink } from '#/features/console/shell/console-link';
import { EmptyState } from '#/features/console/ui/empty-state';
import { FilterBar } from '#/features/console/ui/filter-bar';
import { StatusDot } from '#/features/console/ui/status-dot';

export function DirectoryList({
  entries,
  filters,
  filterLabel = 'Filter directory',
}: {
  entries: DirectoryEntry[];
  filters: string[];
  filterLabel?: string;
}): React.JSX.Element {
  const [filter, setFilter] = useState(filters[0] ?? 'All');
  const [query, setQuery] = useState('');
  const normalized = query.trim().toLowerCase();

  const filtered = entries.filter((entry) => {
    const matchesFilter =
      filter === 'All' ||
      entry.kind === filter ||
      entry.status === filter ||
      entry.kind.toLowerCase() === filter.toLowerCase() ||
      entry.status.toLowerCase() === filter.toLowerCase();
    if (!matchesFilter) {
      return false;
    }
    if (!normalized) {
      return true;
    }
    return [entry.title, entry.summary, entry.kind, entry.status, entry.meta ?? '']
      .join(' ')
      .toLowerCase()
      .includes(normalized);
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <FilterBar
          options={filters}
          value={filter}
          onChange={setFilter}
          legend="Directory filters"
        />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Filter…"
          aria-label={filterLabel}
          className="h-11 w-full max-w-xs rounded-[7px] border-[var(--console-hairline)] bg-transparent text-[13px] sm:h-9"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No matching entries"
          description="Clear the filter or broaden the query."
        />
      ) : (
        <ul className="console-list">
          {filtered.map((entry) => {
            const body = (
              <div className="console-row">
                <div className="flex min-w-0 items-center gap-2.5 sm:contents">
                  <StatusDot tone={entry.tone} />
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[13px] font-medium text-[var(--console-ink)]">
                        {entry.title}
                      </p>
                      <Badge variant="secondary" className="rounded-md">
                        {entry.kind}
                      </Badge>
                    </div>
                    <p className="text-[13px] text-[var(--console-body)]">{entry.summary}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 pl-5 sm:pl-0">
                  {entry.meta ? <span className="console-meta">{entry.meta}</span> : null}
                  <span className="text-[12px] text-[var(--console-muted)] sm:w-24 sm:text-right">
                    {entry.status}
                  </span>
                </div>
              </div>
            );

            return (
              <li key={entry.id}>
                {entry.href ? (
                  <ConsoleLink
                    to={entry.href}
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
    </div>
  );
}

'use client';

import { MagnifyingGlass } from '@phosphor-icons/react/dist/csr/MagnifyingGlass';
import type * as React from 'react';
import { useState } from 'react';

import { Badge } from '#/components/ui/badge';
import { Input } from '#/components/ui/input';
import { getSearch } from '#/features/console/data/agency-getters';
import { ConsoleLink } from '#/features/console/shell/console-link';
import { EmptyState } from '#/features/console/ui/empty-state';
import { PageHeader } from '#/features/console/ui/page-header';
import { StatusDot } from '#/features/console/ui/status-dot';

export function SearchPage(): React.JSX.Element {
  const model = getSearch();
  const [query, setQuery] = useState(model.query);
  const [filter, setFilter] = useState('All');

  const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const hits = model.hits.filter((hit) => {
    if (hit.clearanceHidden) {
      return filter === 'All';
    }
    const matchesFilter = filter === 'All' || hit.kind === filter;
    if (!matchesFilter) {
      return false;
    }
    if (tokens.length === 0) {
      return true;
    }
    const haystack = [hit.title, hit.snippet, hit.provenance, hit.kind].join(' ').toLowerCase();
    return tokens.every((token) => haystack.includes(token));
  });

  const visibleHits = hits.filter((hit) => !hit.clearanceHidden);
  const hiddenHits = hits.filter((hit) => hit.clearanceHidden);

  return (
    <div className="space-y-6" data-surface="console">
      <PageHeader
        title={model.title}
        description={model.description}
        meta={`${model.visibleCount} visible · ${model.hiddenCount} hidden by clearance`}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <MagnifyingGlass
            aria-hidden="true"
            weight="duotone"
            className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-[var(--console-offence)]"
          />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Search records"
            className="h-11 rounded-[7px] border-[var(--console-hairline)] bg-transparent pl-9 text-[13px] sm:h-9"
          />
        </div>
      </div>

      <fieldset className="flex flex-wrap gap-2 border-0 p-0">
        <legend className="sr-only">Result filters</legend>
        {model.filters.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFilter(item)}
            className={
              filter === item
                ? 'inline-flex min-h-10 items-center rounded-md bg-[var(--console-ink)] px-3 text-[12px] font-medium text-white'
                : 'inline-flex min-h-10 items-center rounded-md border border-[var(--console-hairline)] px-3 text-[12px] text-[var(--console-muted)] hover:bg-[var(--console-strip)]'
            }
            aria-pressed={filter === item}
          >
            {item}
          </button>
        ))}
      </fieldset>

      {visibleHits.length === 0 && hiddenHits.length === 0 ? (
        <EmptyState
          title="No search hits"
          description="Try a case number, evidence seal ID, or person name. Broad asks belong in the command palette."
          action={
            <ConsoleLink
              to="/console/command-center"
              className="text-[13px] text-[var(--console-offence)] underline-offset-4 hover:underline"
            >
              Open command center
            </ConsoleLink>
          }
        />
      ) : (
        <ul className="space-y-3">
          {visibleHits.map((hit) => {
            const body = (
              <div className="space-y-2 rounded-lg border border-[var(--console-hairline)] px-3 py-3 hover:bg-[var(--console-strip)]">
                <div className="flex flex-wrap items-center gap-2">
                  {hit.tone ? <StatusDot tone={hit.tone} /> : null}
                  <Badge variant="secondary" className="rounded-md">
                    {hit.kind}
                  </Badge>
                  <h2 className="text-[14px] font-semibold text-[var(--console-ink)]">
                    {hit.title}
                  </h2>
                </div>
                <p className="text-[13px] leading-5 text-[var(--console-body)]">{hit.snippet}</p>
                <p className="font-[family-name:var(--console-font-mono)] text-[11px] text-[var(--console-muted)]">
                  {hit.provenance}
                </p>
              </div>
            );

            return (
              <li key={hit.id}>
                {hit.href ? (
                  <ConsoleLink
                    to={hit.href}
                    className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--console-ink)]"
                  >
                    {body}
                  </ConsoleLink>
                ) : (
                  body
                )}
              </li>
            );
          })}
          {hiddenHits.map((hit) => (
            <li key={hit.id}>
              <div className="space-y-2 rounded-lg border border-dashed border-[var(--console-hairline)] px-3 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusDot tone="danger" />
                  <Badge variant="outline" className="rounded-md">
                    Restricted
                  </Badge>
                  <h2 className="text-[14px] font-semibold text-[var(--console-muted)]">
                    {hit.title}
                  </h2>
                </div>
                <p className="text-[13px] text-[var(--console-muted)]">{hit.snippet}</p>
                <p className="font-[family-name:var(--console-font-mono)] text-[11px] text-[var(--console-muted)]">
                  {hit.provenance}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

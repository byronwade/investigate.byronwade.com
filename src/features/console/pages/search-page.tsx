'use client';

import { MagnifyingGlass } from '@phosphor-icons/react/dist/csr/MagnifyingGlass';
import type * as React from 'react';
import { useState } from 'react';

import { Badge } from '#/components/ui/badge';
import { Input } from '#/components/ui/input';
import { getSearch } from '#/features/console/data/agency-getters';
import { ConsoleLink } from '#/features/console/shell/console-link';
import { ConsolePage } from '#/features/console/ui/console-page';
import { EmptyState } from '#/features/console/ui/empty-state';
import { FilterBar } from '#/features/console/ui/filter-bar';
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
    <ConsolePage>
      <PageHeader
        title={model.title}
        hideTitleOnMobile
        description={model.description}
        meta={`${model.visibleCount} visible · ${model.hiddenCount} hidden by clearance`}
      />

      <div className="space-y-3">
        <div className="relative min-w-0">
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
        <FilterBar
          options={model.filters}
          value={filter}
          onChange={setFilter}
          legend="Result filters"
        />
      </div>

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
        <ul className="console-list">
          {visibleHits.map((hit) => {
            const body = (
              <div className="console-row !items-start !py-3">
                <div className="min-w-0 flex-1 space-y-1.5">
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
                  <p className="console-meta">{hit.provenance}</p>
                </div>
              </div>
            );

            return (
              <li key={hit.id}>
                {hit.href ? (
                  <ConsoleLink
                    to={hit.href}
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
          {hiddenHits.map((hit) => (
            <li key={hit.id}>
              <div className="console-row !items-start !py-3 opacity-80">
                <div className="min-w-0 flex-1 space-y-1.5">
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
                  <p className="console-meta">{hit.provenance}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </ConsolePage>
  );
}

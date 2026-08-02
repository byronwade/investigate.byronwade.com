'use client';

import type * as React from 'react';
import { useState } from 'react';

import { Badge } from '#/components/ui/badge';
import { Button } from '#/components/ui/button';
import { Separator } from '#/components/ui/separator';
import { getIntelligence } from '#/features/console/data/agency-getters';
import { ConsoleLink } from '#/features/console/shell/console-link';
import { EmptyState } from '#/features/console/ui/empty-state';
import { PageHeader } from '#/features/console/ui/page-header';
import { StatusDot } from '#/features/console/ui/status-dot';

export function IntelligencePage(): React.JSX.Element {
  const model = getIntelligence();
  const [selectedId, setSelectedId] = useState(model.selectedId);
  const selected =
    model.packages.find((item) => item.id === selectedId) ?? model.packages[0] ?? null;

  return (
    <div className="space-y-6" data-surface="console">
      <PageHeader
        title={model.title}
        description={model.description}
        meta={model.meta}
        actions={
          <Button type="button" size="sm" className="h-11 rounded-[7px] sm:h-[30px]" asChild>
            <ConsoleLink to="/console/oversight">View audit blocks</ConsoleLink>
          </Button>
        }
      />

      {model.packages.length === 0 ? (
        <EmptyState
          title="No intelligence packages"
          description="Link charts and source packages appear here when squads publish them."
        />
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <ul className="divide-y divide-[var(--console-strip)] border-t border-[var(--console-hairline)]">
            {model.packages.map((item) => {
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
                    <div className="flex min-w-0 items-center gap-2.5 sm:w-[220px] sm:shrink-0">
                      <StatusDot tone={item.tone} />
                      <span className="truncate text-[13px] font-medium text-[var(--console-ink)]">
                        {item.title}
                      </span>
                    </div>
                    <span className="min-w-0 flex-1 pl-5 text-[13px] text-[var(--console-body)] sm:pl-0">
                      {item.summary}
                    </span>
                    <span className="pl-5 text-[12px] text-[var(--console-muted)] sm:w-28 sm:shrink-0 sm:pl-0 sm:text-right">
                      {item.status}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <aside className="space-y-4 rounded-lg border border-[var(--console-hairline)] p-4">
            {selected ? (
              <>
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusDot tone={selected.tone} />
                    <h2 className="text-[14px] font-semibold text-[var(--console-ink)]">
                      {selected.title}
                    </h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="rounded-md">
                      {selected.lane}
                    </Badge>
                    <Badge variant="outline" className="rounded-md">
                      {selected.status}
                    </Badge>
                  </div>
                </div>
                <p className="text-[13px] leading-5 text-[var(--console-body)]">
                  {selected.summary}
                </p>
                <Separator />
                <div className="space-y-2">
                  <h3 className="text-[11px] font-medium tracking-wide text-[var(--console-muted)] uppercase">
                    Entities
                  </h3>
                  <ul className="space-y-1.5">
                    {selected.entities.map((entity) => (
                      <li key={entity} className="text-[13px] text-[var(--console-ink)]">
                        {entity}
                      </li>
                    ))}
                  </ul>
                </div>
                <Separator />
                <p className="text-[12px] leading-5 text-[var(--console-muted)]">
                  {selected.accessNote}
                </p>
                {selected.href ? (
                  <Button
                    type="button"
                    size="sm"
                    className="h-11 rounded-[7px] sm:h-[30px]"
                    asChild
                  >
                    <ConsoleLink to={selected.href}>Open analysis board</ConsoleLink>
                  </Button>
                ) : null}
              </>
            ) : (
              <EmptyState
                title="Select a package"
                description="Choose a package to review entities and access boundaries."
              />
            )}
          </aside>
        </div>
      )}
    </div>
  );
}

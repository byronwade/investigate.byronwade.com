'use client';

import { MapPin } from '@phosphor-icons/react/dist/csr/MapPin';
import type * as React from 'react';
import { useState } from 'react';

import { Badge } from '#/components/ui/badge';
import { Button } from '#/components/ui/button';
import { getIncidents } from '#/features/console/data/agency-getters';
import { ConsoleLink } from '#/features/console/shell/console-link';
import { EmptyState } from '#/features/console/ui/empty-state';
import { PageHeader } from '#/features/console/ui/page-header';
import { StatusDot } from '#/features/console/ui/status-dot';

export function IncidentsPage(): React.JSX.Element {
  const model = getIncidents();
  const [selectedId, setSelectedId] = useState(model.selectedId);
  const selected = model.pins.find((pin) => pin.id === selectedId) ?? model.pins[0] ?? null;

  return (
    <div className="space-y-6" data-surface="console">
      <PageHeader title={model.title} description={model.description} meta={model.meta} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="overflow-hidden rounded-lg border border-[var(--console-hairline)] bg-[linear-gradient(160deg,#f4f6f8_0%,#e8eef4_45%,#dfe7ef_100%)]">
          <div className="relative min-h-[280px] sm:min-h-[360px]">
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  'linear-gradient(to right, rgba(17,17,17,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(17,17,17,0.06) 1px, transparent 1px)',
                backgroundSize: '48px 48px',
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="space-y-2 px-4 text-center">
                <MapPin
                  aria-hidden="true"
                  weight="duotone"
                  className="mx-auto size-6 text-[var(--console-ink)]"
                />
                <p className="text-[13px] font-medium text-[var(--console-ink)]">
                  Chicago field overlay
                </p>
                <p className="text-[12px] text-[var(--console-muted)]">
                  Fixture map · pins are mock locations only
                </p>
              </div>
            </div>
            {model.pins.map((pin, index) => {
              const left = `${18 + (index % 4) * 18}%`;
              const top = `${22 + Math.floor(index / 2) * 18}%`;
              const isSelected = selected?.id === pin.id;
              return (
                <button
                  key={pin.id}
                  type="button"
                  onClick={() => setSelectedId(pin.id)}
                  className={
                    isSelected
                      ? 'absolute z-10 inline-flex size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--console-ink)] text-white shadow-sm'
                      : 'absolute z-10 inline-flex size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--console-hairline)] bg-white text-[var(--console-ink)] shadow-sm hover:bg-[var(--console-strip)]'
                  }
                  style={{ left, top }}
                  aria-label={pin.label}
                  aria-pressed={isSelected}
                >
                  <MapPin aria-hidden="true" weight="fill" className="size-3.5" />
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <ul className="divide-y divide-[var(--console-strip)] border-t border-[var(--console-hairline)]">
            {model.pins.map((pin) => {
              const isSelected = selected?.id === pin.id;
              return (
                <li key={pin.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(pin.id)}
                    className={
                      isSelected
                        ? 'flex w-full flex-col gap-1 bg-[var(--console-strip)] px-2 py-3 text-left'
                        : 'flex w-full flex-col gap-1 px-2 py-3 text-left hover:bg-[var(--console-strip)]'
                    }
                    aria-pressed={isSelected}
                  >
                    <div className="flex items-center gap-2">
                      <StatusDot tone={pin.tone} />
                      <span className="text-[13px] font-medium text-[var(--console-ink)]">
                        {pin.label}
                      </span>
                    </div>
                    <p className="pl-5 text-[13px] text-[var(--console-body)]">{pin.summary}</p>
                    <p className="pl-5 font-[family-name:var(--console-font-mono)] text-[11px] text-[var(--console-muted)]">
                      {pin.coords} · {pin.when}
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>

          {selected ? (
            <aside className="space-y-3 rounded-lg border border-[var(--console-hairline)] p-4">
              <div className="flex flex-wrap items-center gap-2">
                <StatusDot tone={selected.tone} />
                <h2 className="text-[14px] font-semibold text-[var(--console-ink)]">
                  {selected.label}
                </h2>
                <Badge variant="secondary" className="rounded-md">
                  {selected.when}
                </Badge>
              </div>
              <p className="text-[13px] text-[var(--console-body)]">{selected.summary}</p>
              <p className="font-[family-name:var(--console-font-mono)] text-[11px] text-[var(--console-muted)]">
                {selected.coords}
              </p>
              {selected.href ? (
                <Button type="button" size="sm" className="h-11 rounded-[7px] sm:h-[30px]" asChild>
                  <ConsoleLink to={selected.href}>Open scene package</ConsoleLink>
                </Button>
              ) : (
                <EmptyState
                  title="No scene package"
                  description="This pin has no linked diagram yet."
                />
              )}
            </aside>
          ) : null}
        </div>
      </div>
    </div>
  );
}

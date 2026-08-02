'use client';

import { MapPin } from '@phosphor-icons/react/dist/csr/MapPin';
import type * as React from 'react';
import { useState } from 'react';

import { Badge } from '#/components/ui/badge';
import { Button } from '#/components/ui/button';
import { getIncidents } from '#/features/console/data/agency-getters';
import { ConsoleLink } from '#/features/console/shell/console-link';
import { consoleActionClass } from '#/features/console/ui/console-action';
import { ConsolePage } from '#/features/console/ui/console-page';
import { DetailPanel } from '#/features/console/ui/detail-panel';
import { EmptyState } from '#/features/console/ui/empty-state';
import { FixtureCanvas } from '#/features/console/ui/fixture-canvas';
import { PageHeader } from '#/features/console/ui/page-header';
import { SectionHeader } from '#/features/console/ui/section-header';
import { StatusDot } from '#/features/console/ui/status-dot';
import { cn } from '#/lib/utils';

export function IncidentsPage(): React.JSX.Element {
  const model = getIncidents();
  const [selectedId, setSelectedId] = useState(model.selectedId);
  const selected = model.pins.find((pin) => pin.id === selectedId) ?? model.pins[0] ?? null;

  return (
    <ConsolePage>
      <PageHeader title={model.title} description={model.description} meta={model.meta} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <FixtureCanvas
          label="Chicago field overlay"
          caption="Fixture map · pins are mock locations only"
        >
          {model.pins.map((pin, index) => {
            const left = `${18 + (index % 4) * 18}%`;
            const top = `${28 + Math.floor(index / 2) * 18}%`;
            const isSelected = selected?.id === pin.id;
            return (
              <button
                key={pin.id}
                type="button"
                onClick={() => setSelectedId(pin.id)}
                className={cn(
                  'absolute z-10 inline-flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-md border transition-colors',
                  isSelected
                    ? 'border-[var(--console-ink)] bg-[var(--console-ink)] text-white'
                    : 'border-[var(--console-hairline)] bg-[var(--console-ground)] text-[var(--console-ink)] hover:bg-[var(--console-strip)]',
                )}
                style={{ left, top }}
                aria-label={pin.label}
                aria-pressed={isSelected}
              >
                <MapPin aria-hidden="true" weight="fill" className="size-3.5" />
              </button>
            );
          })}
        </FixtureCanvas>

        <div className="space-y-4">
          <SectionHeader title="Mapped incidents" hint={`${model.pins.length} pins`} />
          <ul className="console-list">
            {model.pins.map((pin) => {
              const isSelected = selected?.id === pin.id;
              return (
                <li key={pin.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(pin.id)}
                    className={cn(
                      'console-row !flex-col !items-stretch',
                      isSelected && 'console-row-active',
                    )}
                    aria-pressed={isSelected}
                  >
                    <div className="flex items-center gap-2">
                      <StatusDot tone={pin.tone} />
                      <span className="text-[13px] font-medium text-[var(--console-ink)]">
                        {pin.label}
                      </span>
                    </div>
                    <p className="pl-5 text-[13px] text-[var(--console-body)]">{pin.summary}</p>
                    <p className="console-meta pl-5">
                      {pin.coords} · {pin.when}
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>

          {selected ? (
            <DetailPanel>
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
              <p className="console-meta">{selected.coords}</p>
              {selected.href ? (
                <Button type="button" size="sm" className={consoleActionClass} asChild>
                  <ConsoleLink to={selected.href}>Open scene package</ConsoleLink>
                </Button>
              ) : (
                <EmptyState
                  title="No scene package"
                  description="This pin has no linked diagram yet."
                />
              )}
            </DetailPanel>
          ) : null}
        </div>
      </div>
    </ConsolePage>
  );
}

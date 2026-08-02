import { Blueprint } from '@phosphor-icons/react/dist/csr/Blueprint';
import type * as React from 'react';

import { Badge } from '#/components/ui/badge';
import { getSceneDiagram } from '#/features/console/data/agency-getters';
import { ConsolePage } from '#/features/console/ui/console-page';
import { EmptyState } from '#/features/console/ui/empty-state';
import { FixtureCanvas } from '#/features/console/ui/fixture-canvas';
import { PageHeader } from '#/features/console/ui/page-header';
import { SectionHeader } from '#/features/console/ui/section-header';
import { StatusDot } from '#/features/console/ui/status-dot';

export function ScenePage({ caseId }: { caseId: string }): React.JSX.Element | null {
  const model = getSceneDiagram(caseId);
  if (!model) {
    return null;
  }

  return (
    <ConsolePage>
      <PageHeader
        title={model.title}
        description={model.description}
        meta={
          <span className="inline-flex items-center gap-2">
            <Blueprint aria-hidden="true" weight="duotone" className="size-3.5" />
            {model.meta}
          </span>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <FixtureCanvas
          label={model.location}
          caption="Fixture diagram · measurements locked"
          showGrid
        >
          <div
            aria-hidden="true"
            className="absolute inset-8 z-[1] rounded-md border border-dashed border-[var(--console-ink)]/15"
          />
          <div
            aria-hidden="true"
            className="absolute top-[28%] left-[22%] z-[1] h-[36%] w-[56%] rounded-sm border border-[var(--console-ink)]/20 bg-[var(--console-ground)]/55"
          />
          {model.anchors.map((anchor, index) => (
            <div
              key={anchor.id}
              className="absolute z-10 inline-flex items-center gap-1.5 rounded-md bg-[var(--console-ink)] px-2 py-1 text-[11px] text-white"
              style={{
                left: `${20 + index * 22}%`,
                top: `${30 + (index % 2) * 28}%`,
              }}
            >
              <span className="console-meta !text-white/90">{anchor.label}</span>
            </div>
          ))}
        </FixtureCanvas>

        <div className="space-y-6">
          <section className="space-y-3">
            <SectionHeader title="Layers" hint="Primary plan and provisional overlays" />
            {model.layers.length === 0 ? (
              <EmptyState title="No layers" description="Add a floor plan to begin." />
            ) : (
              <ul className="console-list">
                {model.layers.map((layer) => (
                  <li key={layer.id} className="console-row !items-start">
                    <StatusDot tone={layer.tone} />
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[13px] font-medium text-[var(--console-ink)]">
                          {layer.title}
                        </p>
                        <Badge variant="secondary" className="rounded-md">
                          {layer.status}
                        </Badge>
                      </div>
                      <p className="text-[13px] text-[var(--console-body)]">{layer.summary}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="space-y-3">
            <SectionHeader title="Photo anchors" hint="Locked to measured corners" />
            <ul className="console-list">
              {model.anchors.map((anchor) => (
                <li key={anchor.id} className="console-row">
                  <span className="console-meta sm:w-20">{anchor.label}</span>
                  <span className="text-[13px] text-[var(--console-ink)]">{anchor.note}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </ConsolePage>
  );
}

import { Blueprint } from '@phosphor-icons/react/dist/csr/Blueprint';
import type * as React from 'react';

import { Badge } from '#/components/ui/badge';
import { getSceneDiagram } from '#/features/console/data/agency-getters';
import { EmptyState } from '#/features/console/ui/empty-state';
import { PageHeader } from '#/features/console/ui/page-header';
import { StatusDot } from '#/features/console/ui/status-dot';

export function ScenePage({ caseId }: { caseId: string }): React.JSX.Element | null {
  const model = getSceneDiagram(caseId);
  if (!model) {
    return null;
  }

  return (
    <div className="space-y-6" data-surface="console">
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
        <div className="overflow-hidden rounded-lg border border-[var(--console-hairline)] bg-[linear-gradient(180deg,#f7f7f5_0%,#ecece8_100%)]">
          <div className="relative min-h-[280px] sm:min-h-[360px]">
            <div
              aria-hidden="true"
              className="absolute inset-8 rounded-md border border-dashed border-[var(--console-ink)]/20"
            />
            <div
              aria-hidden="true"
              className="absolute top-[28%] left-[22%] h-[36%] w-[56%] rounded-sm border border-[var(--console-ink)]/25 bg-white/50"
            />
            <div className="absolute inset-0 flex items-center justify-center px-4">
              <div className="space-y-2 text-center">
                <p className="text-[13px] font-medium text-[var(--console-ink)]">
                  {model.location}
                </p>
                <p className="text-[12px] text-[var(--console-muted)]">
                  Fixture diagram · measurements locked
                </p>
              </div>
            </div>
            {model.anchors.map((anchor, index) => (
              <div
                key={anchor.id}
                className="absolute inline-flex items-center gap-1.5 rounded-md bg-[var(--console-ink)] px-2 py-1 text-[11px] text-white"
                style={{
                  left: `${20 + index * 22}%`,
                  top: `${30 + (index % 2) * 28}%`,
                }}
              >
                <span className="font-[family-name:var(--console-font-mono)]">{anchor.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <section className="space-y-3">
            <h2 className="text-[13px] font-semibold text-[var(--console-ink)]">Layers</h2>
            {model.layers.length === 0 ? (
              <EmptyState title="No layers" description="Add a floor plan to begin." />
            ) : (
              <ul className="divide-y divide-[var(--console-strip)] border-t border-[var(--console-hairline)]">
                {model.layers.map((layer) => (
                  <li key={layer.id} className="flex items-start gap-2.5 py-3">
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
            <h2 className="text-[13px] font-semibold text-[var(--console-ink)]">Photo anchors</h2>
            <ul className="space-y-2">
              {model.anchors.map((anchor) => (
                <li
                  key={anchor.id}
                  className="flex items-center justify-between gap-3 rounded-md border border-[var(--console-hairline)] px-3 py-2.5"
                >
                  <span className="font-[family-name:var(--console-font-mono)] text-[12px] text-[var(--console-muted)]">
                    {anchor.label}
                  </span>
                  <span className="text-[13px] text-[var(--console-ink)]">{anchor.note}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

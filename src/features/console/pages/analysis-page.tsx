import { CirclesThreePlus } from '@phosphor-icons/react/dist/csr/CirclesThreePlus';
import type * as React from 'react';

import { getAnalysisBoard } from '#/features/console/data/agency-getters';
import { ConsolePage } from '#/features/console/ui/console-page';
import { EmptyState } from '#/features/console/ui/empty-state';
import { PageHeader } from '#/features/console/ui/page-header';
import { SectionHeader } from '#/features/console/ui/section-header';
import { StatusDot } from '#/features/console/ui/status-dot';

export function AnalysisPage({ caseId }: { caseId: string }): React.JSX.Element | null {
  const model = getAnalysisBoard(caseId);
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
            <CirclesThreePlus aria-hidden="true" weight="duotone" className="size-3.5" />
            {model.columns.reduce((count, column) => count + column.items.length, 0)} board items
          </span>
        }
      />

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {model.columns.map((column) => (
          <section key={column.id} aria-labelledby={`analysis-${column.id}`} className="space-y-3">
            <SectionHeader
              title={column.title}
              titleId={`analysis-${column.id}`}
              hint={`${column.items.length}`}
            />
            {column.items.length === 0 ? (
              <EmptyState
                title="Empty column"
                description="Items move here as analysis progresses."
              />
            ) : (
              <ul className="console-list">
                {column.items.map((item) => (
                  <li key={item.id} className="console-row !items-start !py-3">
                    {item.tone ? <StatusDot tone={item.tone} /> : null}
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="text-[13px] font-medium leading-5 text-[var(--console-ink)]">
                        {item.label}
                      </p>
                      <p className="text-[12px] leading-5 text-[var(--console-muted)]">
                        {item.detail}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </ConsolePage>
  );
}

import { CirclesThreePlus } from '@phosphor-icons/react/dist/csr/CirclesThreePlus';
import type * as React from 'react';

import { getAnalysisBoard } from '#/features/console/data/agency-getters';
import { EmptyState } from '#/features/console/ui/empty-state';
import { PageHeader } from '#/features/console/ui/page-header';
import { StatusDot } from '#/features/console/ui/status-dot';

export function AnalysisPage({ caseId }: { caseId: string }): React.JSX.Element | null {
  const model = getAnalysisBoard(caseId);
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
            <CirclesThreePlus aria-hidden="true" weight="duotone" className="size-3.5" />
            {model.columns.reduce((count, column) => count + column.items.length, 0)} board items
          </span>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {model.columns.map((column) => (
          <section
            key={column.id}
            aria-labelledby={`analysis-${column.id}`}
            className="space-y-2.5"
          >
            <div className="flex items-center justify-between border-b border-[var(--console-hairline)] pb-2">
              <h2
                id={`analysis-${column.id}`}
                className="text-[13px] font-semibold text-[var(--console-ink)]"
              >
                {column.title}
              </h2>
              <span className="font-[family-name:var(--console-font-mono)] text-[11px] text-[var(--console-muted)]">
                {column.items.length}
              </span>
            </div>
            {column.items.length === 0 ? (
              <EmptyState
                title="Empty column"
                description="Items move here as analysis progresses."
              />
            ) : (
              <ul className="space-y-2">
                {column.items.map((item) => (
                  <li
                    key={item.id}
                    className="space-y-2 rounded-md border border-[var(--console-hairline)] px-3 py-2.5"
                  >
                    <div className="flex items-start gap-2">
                      {item.tone ? <StatusDot tone={item.tone} /> : null}
                      <p className="text-[13px] font-medium leading-5 text-[var(--console-ink)]">
                        {item.label}
                      </p>
                    </div>
                    <p className="pl-5 text-[12px] leading-5 text-[var(--console-muted)]">
                      {item.detail}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}

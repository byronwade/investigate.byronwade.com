import { Path } from '@phosphor-icons/react/dist/csr/Path';
import { Plus } from '@phosphor-icons/react/dist/csr/Plus';
import type * as React from 'react';

import { Badge } from '#/components/ui/badge';
import { Button } from '#/components/ui/button';
import { getInvestigativePlan } from '#/features/console/data/agency-getters';
import { ConsoleLink } from '#/features/console/shell/console-link';
import { EmptyState } from '#/features/console/ui/empty-state';
import { PageHeader } from '#/features/console/ui/page-header';
import { StatusDot } from '#/features/console/ui/status-dot';

export function PlanPage({ caseId }: { caseId: string }): React.JSX.Element | null {
  const model = getInvestigativePlan(caseId);
  if (!model) {
    return null;
  }

  return (
    <div className="space-y-8" data-surface="console">
      <PageHeader
        title={model.title}
        description={model.description}
        meta={
          <span className="inline-flex items-center gap-2">
            <Path aria-hidden="true" weight="duotone" className="size-3.5" />
            {model.hypotheses.length} hypotheses · {model.steps.length} steps
          </span>
        }
        actions={
          <Button type="button" size="sm" className="h-11 gap-1.5 rounded-[7px] sm:h-[30px]">
            <Plus aria-hidden="true" weight="bold" className="size-[11px]" />
            Add a step
          </Button>
        }
      />

      <section className="space-y-2">
        <h2 className="text-[13px] font-semibold text-[var(--console-ink)]">Objective</h2>
        <p className="max-w-3xl text-[13px] leading-6 text-[var(--console-body)]">
          {model.objective}
        </p>
      </section>

      <section className="space-y-3">
        <div className="flex items-end justify-between gap-3 border-b border-[var(--console-hairline)] pb-2">
          <h2 className="text-[13px] font-semibold text-[var(--console-ink)]">Active hypotheses</h2>
          <p className="text-[12px] text-[var(--console-muted)]">
            Supports and contradicts stay source-cited
          </p>
        </div>
        <ul className="grid gap-3 lg:grid-cols-3">
          {model.hypotheses.map((hypothesis) => (
            <li
              key={hypothesis.id}
              className="space-y-3 rounded-lg border border-[var(--console-hairline)] p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <StatusDot tone={hypothesis.tone} />
                    <span className="font-[family-name:var(--console-font-mono)] text-[12px] text-[var(--console-muted)]">
                      {hypothesis.code}
                    </span>
                  </div>
                  <h3 className="text-[14px] font-semibold text-[var(--console-ink)]">
                    {hypothesis.title}
                  </h3>
                </div>
                <Badge variant="secondary" className="rounded-md">
                  {hypothesis.status}
                </Badge>
              </div>
              <p className="text-[13px] leading-5 text-[var(--console-body)]">
                {hypothesis.statement}
              </p>
              <div className="space-y-2 text-[12px]">
                <div>
                  <p className="font-medium text-[var(--console-muted)]">Supports</p>
                  <p className="text-[var(--console-ink)]">
                    {hypothesis.supports.length > 0 ? hypothesis.supports.join(' · ') : 'None yet'}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-[var(--console-muted)]">Contradicts</p>
                  <p className="text-[var(--console-ink)]">
                    {hypothesis.contradicts.length > 0
                      ? hypothesis.contradicts.join(' · ')
                      : 'None recorded'}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[var(--console-hairline)] pb-2">
          <h2 className="text-[13px] font-semibold text-[var(--console-ink)]">Planned steps</h2>
          <ConsoleLink
            to={`/console/cases/${caseId}/leads`}
            className="text-[12px] text-[var(--console-muted)] underline-offset-4 hover:underline"
          >
            Open leads board
          </ConsoleLink>
        </div>
        {model.steps.length === 0 ? (
          <EmptyState
            title="No steps planned"
            description="Add sequenced work once hypotheses are approved."
          />
        ) : (
          <ul className="divide-y divide-[var(--console-strip)]">
            {model.steps.map((step) => (
              <li
                key={step.id}
                className="flex min-h-11 flex-col gap-1 py-2.5 sm:min-h-[38px] sm:flex-row sm:items-center sm:gap-3.5"
              >
                <div className="flex min-w-0 items-center gap-2.5 sm:contents">
                  {step.tone ? <StatusDot tone={step.tone} /> : null}
                  <span className="min-w-0 flex-1 text-[13px] font-medium text-[var(--console-ink)]">
                    {step.label}
                  </span>
                </div>
                <span className="pl-5 text-[12px] text-[var(--console-muted)] sm:w-[180px] sm:shrink-0 sm:pl-0 sm:text-right">
                  {step.owner}
                </span>
                {step.due ? (
                  <span className="pl-5 text-[12px] text-[var(--console-muted)] sm:w-24 sm:shrink-0 sm:pl-0 sm:text-right">
                    {step.due}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

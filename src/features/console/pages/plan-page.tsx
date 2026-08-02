'use client';

import { Path } from '@phosphor-icons/react/dist/csr/Path';
import { Plus } from '@phosphor-icons/react/dist/csr/Plus';
import type * as React from 'react';
import { useState } from 'react';

import { Badge } from '#/components/ui/badge';
import { Button } from '#/components/ui/button';
import { getInvestigativePlan } from '#/features/console/data/agency-getters';
import type { PlanStep } from '#/features/console/data/agency-types';
import { ConsoleLink } from '#/features/console/shell/console-link';
import { consoleActionClass } from '#/features/console/ui/console-action';
import { ConsolePage } from '#/features/console/ui/console-page';
import { useConsoleToast } from '#/features/console/ui/console-toast';
import { EmptyState } from '#/features/console/ui/empty-state';
import { PageHeader } from '#/features/console/ui/page-header';
import { SectionHeader } from '#/features/console/ui/section-header';
import { StatusDot } from '#/features/console/ui/status-dot';

export function PlanPage({ caseId }: { caseId: string }): React.JSX.Element | null {
  const model = getInvestigativePlan(caseId);
  const { push } = useConsoleToast();
  const [steps, setSteps] = useState<PlanStep[]>(() => model?.steps ?? []);

  if (!model) {
    return null;
  }

  function addStep() {
    const nextIndex = steps.length + 1;
    const step: PlanStep = {
      id: `local-step-${nextIndex}`,
      label: `Draft step ${nextIndex} — pending technique approval`,
      owner: 'You',
      due: 'TBD',
      tone: 'muted',
    };
    setSteps((current) => [...current, step]);
    push('Step added to plan', 'ok');
  }

  return (
    <ConsolePage loose>
      <PageHeader
        title={model.title}
        hideTitleOnMobile
        description={model.description}
        meta={
          <span className="inline-flex items-center gap-2">
            <Path aria-hidden="true" weight="duotone" className="size-3.5" />
            {model.hypotheses.length} hypotheses · {steps.length} steps
          </span>
        }
        actions={
          <Button
            type="button"
            size="sm"
            className={`${consoleActionClass} gap-1.5`}
            onClick={addStep}
          >
            <Plus aria-hidden="true" weight="bold" className="size-[11px]" />
            Add a step
          </Button>
        }
      />

      <section className="space-y-2">
        <SectionHeader title="Objective" />
        <p className="max-w-3xl text-[13px] leading-6 text-[var(--console-body)]">
          {model.objective}
        </p>
      </section>

      <section className="space-y-3">
        <SectionHeader
          title="Active hypotheses"
          hint="Supports and contradicts stay source-cited"
        />
        <ul className="grid gap-3 lg:grid-cols-3">
          {model.hypotheses.map((hypothesis) => (
            <li key={hypothesis.id} className="console-panel console-panel-pad space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <StatusDot tone={hypothesis.tone} />
                    <span className="console-meta">{hypothesis.code}</span>
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
        <SectionHeader
          title="Planned steps"
          action={
            <ConsoleLink
              to={`/console/cases/${caseId}/leads`}
              className="text-[12px] text-[var(--console-muted)] underline-offset-4 hover:underline"
            >
              Open leads board
            </ConsoleLink>
          }
        />
        {steps.length === 0 ? (
          <EmptyState
            title="No steps planned"
            description="Add sequenced work once hypotheses are approved."
          />
        ) : (
          <ul className="console-list">
            {steps.map((step) => (
              <li key={step.id} className="console-row">
                <div className="flex min-w-0 items-center gap-2.5 sm:contents">
                  {step.tone ? <StatusDot tone={step.tone} /> : null}
                  <span className="min-w-0 flex-1 text-[13px] font-medium text-[var(--console-ink)]">
                    {step.label}
                  </span>
                </div>
                <span className="text-[12px] text-[var(--console-muted)] sm:w-[180px] sm:shrink-0 sm:text-right">
                  {step.owner}
                </span>
                {step.due ? (
                  <span className="text-[12px] text-[var(--console-muted)] sm:w-24 sm:shrink-0 sm:text-right">
                    {step.due}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </ConsolePage>
  );
}

import { Lock } from '@phosphor-icons/react/dist/csr/Lock';
import { Plus } from '@phosphor-icons/react/dist/csr/Plus';
import { Sparkle } from '@phosphor-icons/react/dist/csr/Sparkle';
import type * as React from 'react';

import { Badge } from '#/components/ui/badge';
import { Button } from '#/components/ui/button';
import { Separator } from '#/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table';
import {
  type AssistantStep,
  getOverview,
  listPeople,
  type PersonRecord,
} from '#/features/console/data';
import { ConsoleLink } from '#/features/console/shell/console-link';
import { PageHeader } from '#/features/console/ui/page-header';
import { StatusDot, type StatusDotTone } from '#/features/console/ui/status-dot';

const ROLE_LABEL: Record<PersonRecord['role'], string> = {
  subject: 'subject',
  witness: 'witness',
  poi: 'person of interest',
  other: 'other',
};

function stepTone(state: AssistantStep['state']): StatusDotTone {
  switch (state) {
    case 'done':
      return 'ok';
    case 'denied':
      return 'danger';
    case 'running':
      return 'sensor';
    case 'pending':
      return 'muted';
  }
}

function roleTone(role: PersonRecord['role']): StatusDotTone {
  switch (role) {
    case 'subject':
      return 'danger';
    case 'poi':
      return 'warn';
    case 'witness':
      return 'muted';
    case 'other':
      return 'ok';
  }
}

export function OverviewPage({ caseId }: { caseId: string }): React.JSX.Element | null {
  const overview = getOverview(caseId);
  if (!overview) {
    return null;
  }

  const people = listPeople(caseId);
  const { case: caseRecord, assistant, rail } = overview;
  const runningIndex = assistant.steps.findIndex((step) => step.state === 'running');
  const stepProgress =
    runningIndex >= 0
      ? `Step ${runningIndex + 1} of ${assistant.steps.length}`
      : `${assistant.steps.length} steps`;

  return (
    <div className="flex gap-8" data-surface="console">
      <div className="min-w-0 flex-1 space-y-8">
        <PageHeader
          title={caseRecord.title}
          meta={
            <span className="flex flex-wrap items-center gap-2 text-[13px] text-[var(--console-muted)]">
              <span>Full investigation</span>
              <span aria-hidden="true" className="text-[var(--console-hairline)]">
                ·
              </span>
              <span>{caseRecord.openedLabel}</span>
              <span aria-hidden="true" className="text-[var(--console-hairline)]">
                ·
              </span>
              <span>{caseRecord.assigneesLabel}</span>
              <span aria-hidden="true" className="text-[var(--console-hairline)]">
                ·
              </span>
              <span className="text-[var(--console-sensor)]">{caseRecord.reviewDueLabel}</span>
            </span>
          }
          actions={
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-[30px] border-[var(--console-hairline)] bg-[var(--console-ground)] text-[13px] font-medium text-[var(--console-body)] shadow-none"
              >
                Request approval
              </Button>
              <Button
                type="button"
                size="sm"
                className="h-[30px] bg-[var(--console-ink)] text-[13px] font-medium text-white hover:bg-[var(--console-ink)]/90"
              >
                <Plus aria-hidden="true" weight="duotone" className="size-3.5" />
                New lead
              </Button>
            </>
          }
        />

        <section aria-labelledby="assistant-heading" className="space-y-4">
          <div className="flex items-center justify-between gap-4 border-b border-[var(--console-hairline)] pb-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <Sparkle
                aria-hidden="true"
                weight="duotone"
                className="size-3.5 shrink-0 text-[var(--console-offence)]"
              />
              <h2
                id="assistant-heading"
                className="text-[15px] font-semibold tracking-[-0.01em] text-[var(--console-ink)]"
              >
                Investigative assistant
              </h2>
              <span className="truncate text-[13px] text-[var(--console-muted)]">
                {assistant.durationLabel}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-3 text-[13px] text-[var(--console-muted)]">
              <span>{stepProgress}</span>
              <Badge
                variant="outline"
                className="rounded-md border-transparent px-0 font-[family-name:var(--console-font-mono)] text-[11px] font-normal tracking-normal text-[var(--console-muted)]"
              >
                {assistant.runLabel}
              </Badge>
            </div>
          </div>

          <ol className="max-w-[900px] space-y-0">
            {assistant.steps.map((step) => {
              const isRunning = step.state === 'running';
              return (
                <li
                  key={step.id}
                  className="flex h-[30px] items-center gap-2.5 text-[13px] leading-4"
                >
                  <StatusDot
                    tone={stepTone(step.state)}
                    label={step.state}
                    {...(isRunning ? { className: 'bg-[var(--console-offence)]' } : {})}
                  />
                  <span
                    className={
                      isRunning
                        ? 'min-w-0 flex-1 font-medium text-[var(--console-ink)]'
                        : 'min-w-0 flex-1 text-[var(--console-body)]'
                    }
                  >
                    {step.label}
                  </span>
                  {step.durationLabel ? (
                    <span
                      className={
                        isRunning
                          ? 'w-[52px] shrink-0 text-right font-[family-name:var(--console-font-mono)] text-[11px] text-[var(--console-offence)]'
                          : 'w-[52px] shrink-0 text-right font-[family-name:var(--console-font-mono)] text-[11px] text-[var(--console-muted)]'
                      }
                    >
                      {step.durationLabel}
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ol>

          <ul className="max-w-[900px] space-y-[18px] pt-2">
            {assistant.findings.map((finding) => (
              <li key={finding.id} className="flex gap-2.5">
                <div className="flex w-3.5 shrink-0 justify-center pt-1.5">
                  <StatusDot
                    tone="ok"
                    className="size-1.5 bg-[var(--console-offence)]"
                    label="Finding"
                  />
                </div>
                <div className="min-w-0 flex-1 space-y-1.5">
                  <p className="text-[14px] leading-[21px] text-[var(--console-ink)]">
                    {finding.text}
                  </p>
                  <div className="flex flex-wrap items-center gap-2.5">
                    {finding.tags.map((tag) => (
                      <span
                        key={tag}
                        className="font-[family-name:var(--console-font-mono)] text-[11px] leading-[14px] text-[var(--console-offence)]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="max-w-[900px] space-y-3 border-t border-[var(--console-hairline)] pt-3.5">
            <div className="flex items-center gap-2">
              <Lock
                aria-hidden="true"
                weight="duotone"
                className="size-3 shrink-0 text-[var(--console-sensor)]"
              />
              <p className="text-[13px] font-medium text-[var(--console-ink)]">
                The assistant stops here. These decisions are human-only.
              </p>
            </div>
            <ul>
              {assistant.humanOnly.map((decision) => (
                <li
                  key={decision.id}
                  className="flex h-[34px] items-center gap-3 border-b border-[var(--console-strip)] last:border-b-0"
                >
                  <StatusDot tone="warn" label="Needs review" />
                  <span className="min-w-0 flex-1 truncate text-[13px] text-[var(--console-ink)]">
                    {decision.label}
                  </span>
                  <span className="w-[92px] shrink-0 truncate text-right text-[12px] text-[var(--console-muted)]">
                    {decision.assignee}
                  </span>
                  <div className="flex w-[120px] shrink-0 justify-end gap-1.5">
                    <Button
                      type="button"
                      size="xs"
                      className="h-6 bg-[var(--console-ink)] px-2.5 text-[12px] text-white hover:bg-[var(--console-ink)]/90"
                    >
                      Review
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="xs"
                      className="h-6 border-[var(--console-hairline)] bg-[var(--console-ground)] px-2.5 text-[12px] text-[var(--console-body)] shadow-none"
                    >
                      Reject
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section aria-labelledby="people-preview-heading" className="space-y-2">
          <div className="flex items-center justify-between gap-4 border-b border-[var(--console-hairline)] pb-2">
            <h2
              id="people-preview-heading"
              className="text-[13px] font-semibold text-[var(--console-ink)]"
            >
              People
            </h2>
            <ConsoleLink
              to={`/console/cases/${caseId}/people`}
              className="text-[12px] text-[var(--console-muted)] underline-offset-4 hover:text-[var(--console-ink)] hover:underline"
            >
              {people.length} linked · open directory
            </ConsoleLink>
          </div>
          <Table className="text-[13px]">
            <TableHeader>
              <TableRow className="border-[var(--console-hairline)] hover:bg-transparent">
                <TableHead className="h-8 px-0 text-[12px] font-medium text-[var(--console-muted)]">
                  Name
                </TableHead>
                <TableHead className="h-8 px-0 text-[12px] font-medium text-[var(--console-muted)]">
                  Role
                </TableHead>
                <TableHead className="h-8 px-0 text-[12px] font-medium text-[var(--console-muted)]">
                  Notes
                </TableHead>
                <TableHead className="h-8 px-0 text-right text-[12px] font-medium text-[var(--console-muted)]">
                  Contradictions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {people.map((person) => (
                <TableRow
                  key={person.id}
                  className="border-[var(--console-strip)] hover:bg-[var(--console-strip)]"
                >
                  <TableCell className="px-0 py-2.5 font-medium text-[var(--console-ink)]">
                    {person.name}
                  </TableCell>
                  <TableCell className="px-0 py-2.5">
                    <span className="inline-flex items-center gap-2 text-[12px] text-[var(--console-muted)]">
                      <StatusDot tone={roleTone(person.role)} label={ROLE_LABEL[person.role]} />
                      {ROLE_LABEL[person.role]}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-md truncate px-0 py-2.5 whitespace-normal text-[var(--console-ink)]">
                    {person.notes}
                  </TableCell>
                  <TableCell className="px-0 py-2.5 text-right text-[12px] text-[var(--console-sensor)]">
                    {person.contradictionCount > 0
                      ? `${person.contradictionCount} contradictory`
                      : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>
      </div>

      <aside className="hidden w-[344px] shrink-0 space-y-5 border-l border-[var(--console-hairline)] pl-6 xl:block">
        <div className="space-y-2.5">
          <h2 className="text-[12px] font-medium text-[var(--console-muted)]">
            Techniques at this level
          </h2>
          <ul className="space-y-1.5">
            {rail.techniques.map((technique) => (
              <li key={technique.id} className="flex items-center gap-2.5 text-[13px]">
                <StatusDot
                  tone={technique.ok ? 'ok' : 'danger'}
                  label={technique.ok ? 'Allowed' : 'Blocked'}
                />
                <span
                  className={
                    technique.ok ? 'text-[var(--console-ink)]' : 'text-[var(--console-muted)]'
                  }
                >
                  {technique.label}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <Separator className="bg-[var(--console-hairline)]" />

        <div className="space-y-2.5">
          <h2 className="text-[12px] font-medium text-[var(--console-muted)]">Your access</h2>
          <ul className="space-y-1.5">
            {rail.access.map((item) => (
              <li key={item.id} className="flex items-center gap-2.5 text-[13px]">
                <StatusDot tone="ok" label="Granted" />
                <span className="text-[var(--console-ink)]">{item.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}

import { Users } from '@phosphor-icons/react/dist/csr/Users';
import type * as React from 'react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table';
import { listPeople, type PersonRecord } from '#/features/console/data';
import { ConsoleLink } from '#/features/console/shell/console-link';
import { ConsolePage } from '#/features/console/ui/console-page';
import { EmptyState } from '#/features/console/ui/empty-state';
import { PageHeader } from '#/features/console/ui/page-header';
import { StatusDot, type StatusDotTone } from '#/features/console/ui/status-dot';

const ROLE_LABEL: Record<PersonRecord['role'], string> = {
  subject: 'subject',
  witness: 'witness',
  poi: 'person of interest',
  other: 'other',
};

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

export function PeoplePage({ caseId }: { caseId: string }): React.JSX.Element {
  const people = listPeople(caseId);

  return (
    <ConsolePage>
      <PageHeader
        title="People"
        meta={
          <span className="inline-flex items-center gap-2 text-[13px] text-[var(--console-muted)]">
            <Users aria-hidden="true" weight="duotone" className="size-3.5" />
            {people.length} linked
          </span>
        }
      />

      {people.length === 0 ? (
        <EmptyState
          title="No people linked"
          description="Subjects, witnesses, and persons of interest will appear as they are attached to the case."
        />
      ) : (
        <>
          <ul className="console-list md:hidden">
            {people.map((person) => (
              <li key={person.id}>
                <ConsoleLink
                  to={`/console/cases/${caseId}/people/${person.id}`}
                  className="console-row -mx-1 block rounded-[4px] px-1 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--console-ink)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <p className="truncate text-[13px] font-medium text-[var(--console-ink)]">
                        {person.name}
                      </p>
                      <p className="line-clamp-2 text-[12px] text-[var(--console-body)]">
                        {person.notes}
                      </p>
                    </div>
                    <span className="console-meta inline-flex shrink-0 items-center gap-2">
                      <StatusDot tone={roleTone(person.role)} />
                      {ROLE_LABEL[person.role]}
                    </span>
                  </div>
                  <p className="mt-2 text-[12px] text-[var(--console-sensor)]">
                    {person.contradictionCount > 0
                      ? `${person.contradictionCount} contradictory`
                      : 'No contradictions'}
                  </p>
                </ConsoleLink>
              </li>
            ))}
          </ul>

          <div className="hidden md:block">
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
                      <ConsoleLink
                        to={`/console/cases/${caseId}/people/${person.id}`}
                        className="underline-offset-4 hover:underline"
                      >
                        {person.name}
                      </ConsoleLink>
                    </TableCell>
                    <TableCell className="px-0 py-2.5">
                      <span className="inline-flex items-center gap-2 text-[12px] text-[var(--console-muted)]">
                        <StatusDot tone={roleTone(person.role)} />
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
          </div>
        </>
      )}
    </ConsolePage>
  );
}

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
    <div className="space-y-6" data-surface="console">
      <PageHeader
        title="People"
        meta={
          <span className="inline-flex items-center gap-2 text-[13px] text-[var(--console-muted)]">
            <Users aria-hidden="true" weight="duotone" className="size-3.5" />
            {people.length} linked
          </span>
        }
      />

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
                  <StatusDot tone={roleTone(person.role)} />
                  {ROLE_LABEL[person.role]}
                </span>
              </TableCell>
              <TableCell className="max-w-md truncate px-0 py-2.5 whitespace-normal text-[var(--console-ink)]">
                {person.notes}
              </TableCell>
              <TableCell className="px-0 py-2.5 text-right text-[12px] text-[var(--console-sensor)]">
                {person.contradictionCount > 0 ? `${person.contradictionCount} contradictory` : '—'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

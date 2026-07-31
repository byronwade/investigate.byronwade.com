import type * as React from 'react';

import { Badge } from '#/components/ui/badge';
import type { PersonRecord } from '#/features/console/data';
import { getPerson } from '#/features/console/data/agency-getters';
import { ConsoleLink } from '#/features/console/shell/console-link';
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

export function PersonProfilePage({
  caseId,
  personId,
}: {
  caseId: string;
  personId: string;
}): React.JSX.Element | null {
  const person = getPerson(caseId, personId);
  if (!person) {
    return null;
  }

  return (
    <div className="space-y-6" data-surface="console">
      <PageHeader
        title={person.name}
        description={person.notes}
        meta={
          <span className="inline-flex items-center gap-2">
            <StatusDot tone={roleTone(person.role)} />
            {ROLE_LABEL[person.role]}
          </span>
        }
        actions={
          <ConsoleLink
            to={`/console/cases/${caseId}/people`}
            className="text-[13px] text-[var(--console-muted)] underline-offset-4 hover:underline"
          >
            Back to people
          </ConsoleLink>
        }
      />

      <dl className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <dt className="text-[12px] text-[var(--console-muted)]">Contradictions</dt>
          <dd className="text-[13px] font-medium text-[var(--console-ink)]">
            {person.contradictionCount}
          </dd>
        </div>
        <div className="space-y-1">
          <dt className="text-[12px] text-[var(--console-muted)]">Case link</dt>
          <dd>
            <Badge variant="secondary" className="rounded-md">
              {caseId}
            </Badge>
          </dd>
        </div>
      </dl>
    </div>
  );
}

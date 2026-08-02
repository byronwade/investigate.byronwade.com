import type * as React from 'react';

import { Badge } from '#/components/ui/badge';
import { Button } from '#/components/ui/button';
import { Separator } from '#/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs';
import type { PersonRecord } from '#/features/console/data';
import { getPerson } from '#/features/console/data/agency-getters';
import { ConsoleLink } from '#/features/console/shell/console-link';
import { consoleActionClass } from '#/features/console/ui/console-action';
import { ConsolePage } from '#/features/console/ui/console-page';
import { EmptyState } from '#/features/console/ui/empty-state';
import { PageHeader } from '#/features/console/ui/page-header';
import { SectionHeader } from '#/features/console/ui/section-header';
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
    <ConsolePage>
      <PageHeader
        title={person.name}
        description={person.notes}
        meta={
          <span className="inline-flex flex-wrap items-center gap-2">
            <StatusDot tone={roleTone(person.role)} />
            <span>{ROLE_LABEL[person.role]}</span>
            <Badge variant="secondary" className="rounded-md">
              {caseId}
            </Badge>
          </span>
        }
        actions={
          <Button type="button" variant="outline" size="sm" className={consoleActionClass} asChild>
            <ConsoleLink to={`/console/cases/${caseId}/people`}>Back to people</ConsoleLink>
          </Button>
        }
      />

      <dl className="console-metric-strip">
        <div className="console-metric-cell space-y-1">
          <dt className="console-meta">Role</dt>
          <dd className="text-[13px] font-medium text-[var(--console-ink)]">
            {ROLE_LABEL[person.role]}
          </dd>
        </div>
        <div className="console-metric-cell space-y-1">
          <dt className="console-meta">Contradictions</dt>
          <dd className="text-[13px] font-medium text-[var(--console-ink)]">
            {person.contradictionCount > 0 ? (
              <span className="text-[var(--console-sensor)]">
                {person.contradictionCount} flagged
              </span>
            ) : (
              'None recorded'
            )}
          </dd>
        </div>
        <div className="console-metric-cell space-y-1">
          <dt className="console-meta">Linked case</dt>
          <dd>
            <ConsoleLink
              to={`/console/cases/${caseId}/overview`}
              className="text-[13px] font-medium text-[var(--console-offence)] underline-offset-4 hover:underline"
            >
              Open overview
            </ConsoleLink>
          </dd>
        </div>
      </dl>

      <Tabs defaultValue="summary" className="gap-4">
        <TabsList className="h-auto w-full flex-wrap justify-start rounded-md bg-[var(--console-strip)] p-1">
          <TabsTrigger value="summary" className="min-h-10 flex-none px-3 text-[13px]">
            Summary
          </TabsTrigger>
          <TabsTrigger value="links" className="min-h-10 flex-none px-3 text-[13px]">
            Case links
          </TabsTrigger>
          <TabsTrigger value="notes" className="min-h-10 flex-none px-3 text-[13px]">
            Notes
          </TabsTrigger>
        </TabsList>
        <TabsContent value="summary" className="space-y-3">
          <SectionHeader title="Working summary" />
          <p className="max-w-3xl text-[13px] leading-6 text-[var(--console-body)]">
            {person.notes}
          </p>
          <Separator />
          <p className="text-[12px] text-[var(--console-muted)]">
            Profile fields are fixture-backed until live person records are wired.
          </p>
        </TabsContent>
        <TabsContent value="links" className="space-y-3">
          <ul className="console-list">
            <li>
              <ConsoleLink
                to={`/console/cases/${caseId}/timeline`}
                className="console-row justify-between py-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--console-ink)]"
              >
                <span className="text-[13px] text-[var(--console-ink)]">Timeline mentions</span>
                <span className="console-meta">Open</span>
              </ConsoleLink>
            </li>
            <li>
              <ConsoleLink
                to={`/console/cases/${caseId}/interview`}
                className="console-row justify-between py-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--console-ink)]"
              >
                <span className="text-[13px] text-[var(--console-ink)]">Interview workspace</span>
                <span className="console-meta">Open</span>
              </ConsoleLink>
            </li>
            <li>
              <ConsoleLink
                to={`/console/cases/${caseId}/leads`}
                className="console-row justify-between py-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--console-ink)]"
              >
                <span className="text-[13px] text-[var(--console-ink)]">Related leads</span>
                <span className="console-meta">Open</span>
              </ConsoleLink>
            </li>
          </ul>
        </TabsContent>
        <TabsContent value="notes">
          {person.contradictionCount > 0 ? (
            <EmptyState
              title="Contradiction review required"
              description={`${person.contradictionCount} statement conflicts are queued for analyst review before court packaging.`}
              action={
                <ConsoleLink
                  to={`/console/cases/${caseId}/analysis`}
                  className="text-[13px] text-[var(--console-offence)] underline-offset-4 hover:underline"
                >
                  Open analysis
                </ConsoleLink>
              }
            />
          ) : (
            <EmptyState
              title="No analyst notes yet"
              description="Add interview or analysis notes from those workspaces; they will surface here."
            />
          )}
        </TabsContent>
      </Tabs>
    </ConsolePage>
  );
}

import { Kanban } from '@phosphor-icons/react/dist/csr/Kanban';
import type * as React from 'react';

import { type LeadRecord, listLeads } from '#/features/console/data';
import { ConsolePage } from '#/features/console/ui/console-page';
import { PageHeader } from '#/features/console/ui/page-header';
import { SectionHeader } from '#/features/console/ui/section-header';

const COLUMNS: { id: LeadRecord['column']; label: string }[] = [
  { id: 'triage', label: 'Triage' },
  { id: 'active', label: 'Active' },
  { id: 'blocked', label: 'Blocked' },
  { id: 'done', label: 'Done' },
];

export function LeadsPage({ caseId }: { caseId: string }): React.JSX.Element {
  const leads = listLeads(caseId);
  const byColumn = Object.fromEntries(
    COLUMNS.map((column) => [column.id, leads.filter((lead) => lead.column === column.id)]),
  ) as Record<LeadRecord['column'], LeadRecord[]>;

  return (
    <ConsolePage>
      <PageHeader
        title="Leads"
        hideTitleOnMobile
        meta={
          <span className="inline-flex items-center gap-2 text-[13px] text-[var(--console-muted)]">
            <Kanban aria-hidden="true" weight="duotone" className="size-3.5" />
            {leads.length} leads
          </span>
        }
      />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {COLUMNS.map((column) => {
          const columnLeads = byColumn[column.id];
          return (
            <section
              key={column.id}
              aria-labelledby={`leads-${column.id}`}
              className="min-w-0 space-y-2"
            >
              <SectionHeader
                title={column.label}
                titleId={`leads-${column.id}`}
                hint={`${columnLeads.length}`}
                inlineHint
              />
              <ul className="console-list">
                {columnLeads.length === 0 ? (
                  <li className="console-row text-[12px] text-[var(--console-muted)]">Empty</li>
                ) : (
                  columnLeads.map((lead) => (
                    <li key={lead.id} className="console-row !items-start !py-3">
                      <div className="min-w-0 space-y-1">
                        <p className="text-[13px] leading-5 text-[var(--console-ink)]">
                          {lead.title}
                        </p>
                        <p className="text-[12px] text-[var(--console-muted)]">{lead.owner}</p>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </section>
          );
        })}
      </div>
    </ConsolePage>
  );
}

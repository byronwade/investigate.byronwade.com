import { Kanban } from '@phosphor-icons/react/dist/csr/Kanban';
import type * as React from 'react';

import { type LeadRecord, listLeads } from '#/features/console/data';
import { PageHeader } from '#/features/console/ui/page-header';

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
    <div className="space-y-6" data-surface="console">
      <PageHeader
        title="Leads"
        meta={
          <span className="inline-flex items-center gap-2 text-[13px] text-[var(--console-muted)]">
            <Kanban aria-hidden="true" weight="duotone" className="size-3.5" />
            {leads.length} leads
          </span>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {COLUMNS.map((column) => {
          const columnLeads = byColumn[column.id];
          return (
            <section
              key={column.id}
              aria-labelledby={`leads-${column.id}`}
              className="min-w-0 space-y-2.5"
            >
              <div className="flex items-center justify-between border-b border-[var(--console-hairline)] pb-2">
                <h2
                  id={`leads-${column.id}`}
                  className="text-[13px] font-semibold text-[var(--console-ink)]"
                >
                  {column.label}
                </h2>
                <span className="font-[family-name:var(--console-font-mono)] text-[11px] text-[var(--console-muted)]">
                  {columnLeads.length}
                </span>
              </div>
              <ul className="space-y-2">
                {columnLeads.map((lead) => (
                  <li
                    key={lead.id}
                    className="rounded-md border border-[var(--console-hairline)] bg-[var(--console-ground)] px-3 py-2.5"
                  >
                    <p className="text-[13px] leading-5 text-[var(--console-ink)]">{lead.title}</p>
                    <p className="mt-1.5 text-[12px] text-[var(--console-muted)]">{lead.owner}</p>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}

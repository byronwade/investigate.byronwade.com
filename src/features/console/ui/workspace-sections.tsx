import type * as React from 'react';

import type { WorkspaceSection } from '#/features/console/data/agency-types';
import { ConsoleLink } from '#/features/console/shell/console-link';
import { EmptyState } from '#/features/console/ui/empty-state';
import { StatusDot } from '#/features/console/ui/status-dot';

export function WorkspaceSections({
  sections,
}: {
  sections: WorkspaceSection[];
}): React.JSX.Element {
  return (
    <div className="space-y-8">
      {sections.map((section) => (
        <section key={section.id} className="space-y-2">
          <div className="flex flex-col gap-1 border-b border-[var(--console-hairline)] pb-2 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-3">
            <h2 className="text-[13px] font-semibold text-[var(--console-ink)]">{section.title}</h2>
            {section.hint ? (
              <p className="max-w-xl text-[12px] text-[var(--console-muted)]">{section.hint}</p>
            ) : null}
          </div>
          {section.rows.length === 0 ? (
            <EmptyState
              title="Nothing in this queue"
              description="New items will appear here as the office triage and overnight runs complete."
            />
          ) : (
            <ul className="divide-y divide-[var(--console-strip)]">
              {section.rows.map((row) => {
                const body = (
                  <div className="flex min-h-11 flex-col gap-1 py-2.5 sm:min-h-[38px] sm:flex-row sm:items-center sm:gap-3.5 sm:py-2">
                    <div className="flex min-w-0 items-center gap-2.5 sm:contents">
                      {row.tone ? <StatusDot tone={row.tone} /> : null}
                      <div className="min-w-0 truncate text-[13px] font-medium text-[var(--console-ink)] sm:w-[150px] sm:shrink-0">
                        {row.primary}
                      </div>
                    </div>
                    <div className="min-w-0 pl-5 text-[13px] text-[var(--console-ink)] sm:flex-1 sm:pl-0">
                      {row.secondary}
                    </div>
                    <div className="flex items-center gap-3 pl-5 sm:contents sm:pl-0">
                      {row.meta ? (
                        <div className="text-[12px] text-[var(--console-muted)] sm:w-[130px] sm:shrink-0 sm:text-right">
                          {row.meta}
                        </div>
                      ) : null}
                      {row.due ? (
                        <div className="text-[12px] text-[var(--console-muted)] sm:w-20 sm:shrink-0 sm:text-right">
                          {row.due}
                        </div>
                      ) : null}
                    </div>
                  </div>
                );

                return (
                  <li key={row.id}>
                    {row.href ? (
                      <ConsoleLink
                        to={row.href}
                        className="block rounded-md hover:bg-[var(--console-strip)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--console-ink)]"
                      >
                        {body}
                      </ConsoleLink>
                    ) : (
                      body
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}

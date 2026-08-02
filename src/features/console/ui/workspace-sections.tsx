import type * as React from 'react';

import type { WorkspaceSection } from '#/features/console/data/agency-types';
import { ConsoleLink } from '#/features/console/shell/console-link';
import { EmptyState } from '#/features/console/ui/empty-state';
import { SectionHeader } from '#/features/console/ui/section-header';
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
          <SectionHeader title={section.title} {...(section.hint ? { hint: section.hint } : {})} />
          {section.rows.length === 0 ? (
            <EmptyState
              title="Nothing in this queue"
              description="New items will appear here as the office triage and overnight runs complete."
            />
          ) : (
            <ul className="console-list border-t-0">
              {section.rows.map((row) => {
                const body = (
                  <div className="console-row">
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
                        className="block rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--console-ink)]"
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

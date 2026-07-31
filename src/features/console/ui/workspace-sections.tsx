import type * as React from 'react';
import type { WorkspaceSection } from '#/features/console/data/agency-types';
import { ConsoleLink } from '#/features/console/shell/console-link';
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
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[var(--console-hairline)] pb-2">
            <h2 className="text-[13px] font-semibold text-[var(--console-ink)]">{section.title}</h2>
            {section.hint ? (
              <p className="max-w-xl text-[12px] text-[var(--console-muted)]">{section.hint}</p>
            ) : null}
          </div>
          <ul className="divide-y divide-[var(--console-strip)]">
            {section.rows.map((row) => {
              const body = (
                <div className="flex min-h-[38px] items-center gap-3.5 py-2">
                  {row.tone ? <StatusDot tone={row.tone} /> : null}
                  <div className="w-[150px] shrink-0 truncate text-[13px] font-medium text-[var(--console-ink)]">
                    {row.primary}
                  </div>
                  <div className="min-w-0 flex-1 text-[13px] text-[var(--console-ink)]">
                    {row.secondary}
                  </div>
                  {row.meta ? (
                    <div className="hidden w-[130px] shrink-0 text-right text-[12px] text-[var(--console-muted)] sm:block">
                      {row.meta}
                    </div>
                  ) : null}
                  {row.due ? (
                    <div className="w-20 shrink-0 text-right text-[12px] text-[var(--console-muted)]">
                      {row.due}
                    </div>
                  ) : null}
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
        </section>
      ))}
    </div>
  );
}

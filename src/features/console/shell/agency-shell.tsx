import type * as React from 'react';

import { ClassificationStrip } from './classification-strip';
import { ConsoleRailProvider, useConsoleRail } from './rail-context';
import { Sidebar } from './sidebar';
import { TopBar } from './top-bar';

export function AgencyShell({
  crumb,
  children,
  rail,
}: {
  crumb: string;
  children: React.ReactNode;
  rail?: React.ReactNode;
}): React.JSX.Element {
  return (
    <ConsoleRailProvider>
      <AgencyShellLayout crumb={crumb} rail={rail}>
        {children}
      </AgencyShellLayout>
    </ConsoleRailProvider>
  );
}

function AgencyShellLayout({
  crumb,
  children,
  rail,
}: {
  crumb: string;
  children: React.ReactNode;
  rail?: React.ReactNode;
}): React.JSX.Element {
  const contextRail = useConsoleRail();
  const resolvedRail = rail ?? contextRail;

  return (
    <div
      data-surface="console"
      className="flex min-h-dvh flex-col bg-[var(--console-ground)] text-[var(--console-ink)]"
    >
      <ClassificationStrip />
      <TopBar crumb={crumb} navVariant="agency" />
      <div className="flex min-h-0 flex-1">
        <Sidebar variant="agency" />
        <main
          id="console-main"
          tabIndex={-1}
          className="min-w-0 flex-1 overflow-auto p-4 outline-none sm:p-6"
        >
          {children}
        </main>
        {resolvedRail ? (
          <aside className="hidden w-[var(--console-rail-width)] shrink-0 border-l border-[var(--console-hairline)] xl:block">
            {resolvedRail}
          </aside>
        ) : null}
      </div>
    </div>
  );
}

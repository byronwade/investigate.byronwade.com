'use client';

import type * as React from 'react';
import { useState } from 'react';

import { ConsoleToastProvider } from '#/features/console/ui/console-toast';

import { ClassificationStrip } from './classification-strip';
import { MobileNav } from './mobile-nav';
import { MobileTabBar } from './mobile-tab-bar';
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
      <ConsoleToastProvider>
        <AgencyShellLayout crumb={crumb} rail={rail}>
          {children}
        </AgencyShellLayout>
      </ConsoleToastProvider>
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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div
      data-surface="console"
      className="flex min-h-dvh flex-col bg-[var(--console-ground)] text-[var(--console-ink)]"
    >
      <ClassificationStrip />
      <TopBar crumb={crumb} navVariant="agency" onOpenNav={() => setMobileNavOpen(true)} />
      <div className="flex min-h-0 flex-1">
        <Sidebar variant="agency" />
        <main
          id="console-main"
          tabIndex={-1}
          className="console-shell-main min-w-0 flex-1 overflow-auto p-4 outline-none sm:p-6"
        >
          {children}
        </main>
        {resolvedRail ? (
          <aside className="hidden w-[var(--console-rail-width)] shrink-0 border-l border-[var(--console-hairline)] xl:block">
            {resolvedRail}
          </aside>
        ) : null}
      </div>
      <MobileTabBar variant="agency" onMore={() => setMobileNavOpen(true)} />
      <MobileNav open={mobileNavOpen} onOpenChange={setMobileNavOpen} variant="agency" />
    </div>
  );
}

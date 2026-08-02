'use client';

import type * as React from 'react';
import { useState } from 'react';

import type { CaseRecord } from '#/features/console/data';
import { ConsoleToastProvider } from '#/features/console/ui/console-toast';

import { CaseTabs } from './case-tabs';
import { ClassificationStrip } from './classification-strip';
import { MobileNav } from './mobile-nav';
import { MobileTabBar } from './mobile-tab-bar';
import { shortCaseTitle } from './nav';
import { ConsoleRailProvider, useConsoleRail } from './rail-context';
import { Sidebar } from './sidebar';
import { TopBar } from './top-bar';

export function CaseShell({
  caseRecord,
  children,
  rail,
}: {
  caseRecord: CaseRecord;
  children: React.ReactNode;
  rail?: React.ReactNode;
}): React.JSX.Element {
  return (
    <ConsoleRailProvider>
      <ConsoleToastProvider>
        <CaseShellLayout caseRecord={caseRecord} rail={rail}>
          {children}
        </CaseShellLayout>
      </ConsoleToastProvider>
    </ConsoleRailProvider>
  );
}

function CaseShellLayout({
  caseRecord,
  children,
  rail,
}: {
  caseRecord: CaseRecord;
  children: React.ReactNode;
  rail?: React.ReactNode;
}): React.JSX.Element {
  const contextRail = useConsoleRail();
  const resolvedRail = rail ?? contextRail;
  const caseLabel = shortCaseTitle(caseRecord.title);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div
      data-surface="console"
      className="flex min-h-dvh flex-col bg-[var(--console-ground)] text-[var(--console-ink)]"
    >
      <ClassificationStrip />
      <TopBar caseRecord={caseRecord} navVariant="case" onOpenNav={() => setMobileNavOpen(true)} />
      <CaseTabs
        caseId={caseRecord.id}
        caseNumber={caseRecord.number}
        caseLabel={caseLabel}
        reviewDueLabel={caseRecord.reviewDueLabel}
      />
      <div className="flex min-h-0 flex-1">
        <Sidebar variant="case" caseId={caseRecord.id} />
        <main
          id="console-main"
          tabIndex={-1}
          className="console-shell-main min-w-0 flex-1 overflow-auto px-4 pt-3.5 outline-none sm:p-6"
        >
          {children}
        </main>
        {resolvedRail ? (
          <aside className="hidden w-[var(--console-rail-width)] shrink-0 border-l border-[var(--console-hairline)] xl:block">
            {resolvedRail}
          </aside>
        ) : null}
      </div>
      <MobileTabBar variant="case" caseId={caseRecord.id} onMore={() => setMobileNavOpen(true)} />
      <MobileNav
        open={mobileNavOpen}
        onOpenChange={setMobileNavOpen}
        variant="case"
        caseId={caseRecord.id}
      />
    </div>
  );
}

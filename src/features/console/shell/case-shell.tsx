import type * as React from 'react';

import type { CaseRecord } from '#/features/console/data';

import { CaseTabs } from './case-tabs';
import { ClassificationStrip } from './classification-strip';
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
      <CaseShellLayout caseRecord={caseRecord} rail={rail}>
        {children}
      </CaseShellLayout>
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

  return (
    <div
      data-surface="console"
      className="flex min-h-dvh flex-col bg-[var(--console-ground)] text-[var(--console-ink)]"
    >
      <ClassificationStrip />
      <TopBar caseRecord={caseRecord} navVariant="case" />
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

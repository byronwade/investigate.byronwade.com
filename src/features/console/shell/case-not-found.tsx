import { Link } from '@tanstack/react-router';
import type * as React from 'react';

import { DEFAULT_CASE_ID } from '#/features/console/data';

import { ClassificationStrip } from './classification-strip';

export function CaseNotFound({ caseId }: { caseId: string }): React.JSX.Element {
  return (
    <div
      data-surface="console"
      className="flex min-h-screen flex-col bg-[var(--console-ground)] text-[var(--console-ink)]"
    >
      <ClassificationStrip />
      <main
        id="console-main"
        tabIndex={-1}
        className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-6 py-16 outline-none"
      >
        <p className="font-[family-name:var(--console-font-mono)] text-[11px] tracking-[0.06em] text-[var(--console-muted)]">
          CASE NOT FOUND
        </p>
        <h1 className="mt-2 font-[family-name:var(--console-font-sans)] text-[22px] font-semibold leading-7 tracking-[-0.02em]">
          No case matches this identifier
        </h1>
        <p className="mt-3 text-[13px] leading-5 text-[var(--console-body)]">
          <span className="font-[family-name:var(--console-font-mono)] text-[var(--console-ink)]">
            {caseId}
          </span>{' '}
          is not in the local case set. Open the default Northridge workspace to continue.
        </p>
        <p className="mt-8">
          <Link
            to="/console/cases/$caseId/overview"
            params={{ caseId: DEFAULT_CASE_ID }}
            className="text-[13px] font-medium text-[var(--console-ink)] underline decoration-[var(--console-hairline)] underline-offset-4 hover:decoration-[var(--console-ink)]"
          >
            Open Northridge overview
          </Link>
        </p>
      </main>
    </div>
  );
}

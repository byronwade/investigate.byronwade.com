import type * as React from 'react';
import { useState } from 'react';

import { Input } from '#/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table';
import { listPortfolioCases } from '#/features/console/data/agency-getters';
import { ConsoleLink } from '#/features/console/shell/console-link';
import { ConsolePage } from '#/features/console/ui/console-page';
import { EmptyState } from '#/features/console/ui/empty-state';
import { PageHeader } from '#/features/console/ui/page-header';
import { StatusDot } from '#/features/console/ui/status-dot';

export function CasesPortfolioPage(): React.JSX.Element {
  const cases = listPortfolioCases();
  const [query, setQuery] = useState('');
  const normalized = query.trim().toLowerCase();
  const filtered = normalized
    ? cases.filter((item) =>
        [item.title, item.number, item.squad, item.status]
          .join(' ')
          .toLowerCase()
          .includes(normalized),
      )
    : cases;
  const openCount = cases.filter((item) => item.status === 'open').length;

  return (
    <ConsolePage>
      <PageHeader
        title="Cases portfolio"
        hideTitleOnMobile
        description="Open and recently closed cases for the Chicago field office."
        meta={`${openCount} open`}
      />

      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Filter cases…"
        aria-label="Filter cases"
        className="console-field h-11 w-full max-w-md sm:h-9"
      />

      {filtered.length === 0 ? (
        <EmptyState
          title="No matching cases"
          description="Clear the filter or open Intake to start a new case file."
          action={
            <ConsoleLink
              to="/console/intake"
              className="text-[13px] text-[var(--console-offence)] underline-offset-4 hover:underline"
            >
              Go to intake
            </ConsoleLink>
          }
        />
      ) : (
        <>
          <ul className="console-list md:hidden">
            {filtered.map((item) => (
              <li key={item.id}>
                <ConsoleLink
                  to={item.href}
                  className="console-row !items-start block py-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--console-ink)]"
                >
                  <div className="flex min-w-0 flex-col gap-1.5">
                    <div className="flex items-start justify-between gap-3">
                      <p className="line-clamp-2 text-[15px] font-medium leading-5 text-[var(--console-ink)]">
                        {item.title}
                      </p>
                      <span className="inline-flex shrink-0 items-center gap-2 pt-0.5 text-[12px] text-[var(--console-muted)]">
                        <StatusDot tone={item.status === 'open' ? 'ok' : 'muted'} />
                        {item.status}
                      </span>
                    </div>
                    <p className="font-[family-name:var(--console-font-mono)] text-[11px] text-[var(--console-muted)]">
                      {item.number}
                    </p>
                    <p className="text-[12px] text-[var(--console-body)]">
                      {item.squad} · {item.openedLabel}
                    </p>
                  </div>
                </ConsoleLink>
              </li>
            ))}
          </ul>

          <div className="hidden md:block">
            <Table className="text-[13px]">
              <TableHeader>
                <TableRow className="border-[var(--console-hairline)] hover:bg-transparent">
                  <TableHead className="h-8 px-0 text-[12px] font-medium text-[var(--console-muted)]">
                    Case
                  </TableHead>
                  <TableHead className="h-8 px-0 text-[12px] font-medium text-[var(--console-muted)]">
                    Number
                  </TableHead>
                  <TableHead className="h-8 px-0 text-[12px] font-medium text-[var(--console-muted)]">
                    Squad
                  </TableHead>
                  <TableHead className="h-8 px-0 text-[12px] font-medium text-[var(--console-muted)]">
                    Opened
                  </TableHead>
                  <TableHead className="h-8 px-0 text-right text-[12px] font-medium text-[var(--console-muted)]">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((item) => (
                  <TableRow
                    key={item.id}
                    className="border-[var(--console-strip)] hover:bg-[var(--console-strip)]"
                  >
                    <TableCell className="px-0 py-2.5">
                      <ConsoleLink
                        to={item.href}
                        className="font-medium text-[var(--console-ink)] underline-offset-4 hover:underline"
                      >
                        {item.title}
                      </ConsoleLink>
                    </TableCell>
                    <TableCell className="px-0 py-2.5 font-[family-name:var(--console-font-mono)] text-[12px] text-[var(--console-muted)]">
                      {item.number}
                    </TableCell>
                    <TableCell className="px-0 py-2.5 text-[var(--console-body)]">
                      {item.squad}
                    </TableCell>
                    <TableCell className="px-0 py-2.5 text-[var(--console-muted)]">
                      {item.openedLabel}
                    </TableCell>
                    <TableCell className="px-0 py-2.5 text-right">
                      <span className="inline-flex items-center justify-end gap-2 text-[12px] text-[var(--console-muted)]">
                        <StatusDot tone={item.status === 'open' ? 'ok' : 'muted'} />
                        {item.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </ConsolePage>
  );
}

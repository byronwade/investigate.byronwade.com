import type * as React from 'react';

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
import { PageHeader } from '#/features/console/ui/page-header';
import { StatusDot } from '#/features/console/ui/status-dot';

export function CasesPortfolioPage(): React.JSX.Element {
  const cases = listPortfolioCases();

  return (
    <div className="space-y-6" data-surface="console">
      <PageHeader
        title="Cases portfolio"
        description="Open and recently closed cases for the Chicago field office."
        meta={`${cases.filter((item) => item.status === 'open').length} open`}
      />

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
          {cases.map((item) => (
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
              <TableCell className="px-0 py-2.5 text-[var(--console-body)]">{item.squad}</TableCell>
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
  );
}

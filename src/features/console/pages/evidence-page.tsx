import { Package } from '@phosphor-icons/react/dist/csr/Package';
import type * as React from 'react';

import { Badge } from '#/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table';
import { type EvidenceRecord, listEvidence } from '#/features/console/data';
import { PageHeader } from '#/features/console/ui/page-header';

const CUSTODY_LABEL: Record<EvidenceRecord['custody'], string> = {
  sealed: 'sealed',
  lab: 'lab',
  'checked-out': 'checked-out',
  intake: 'intake',
};

function custodyVariant(
  custody: EvidenceRecord['custody'],
): 'outline' | 'secondary' | 'destructive' {
  switch (custody) {
    case 'sealed':
      return 'secondary';
    case 'lab':
      return 'outline';
    case 'checked-out':
      return 'destructive';
    case 'intake':
      return 'outline';
  }
}

export function EvidencePage({ caseId }: { caseId: string }): React.JSX.Element {
  const items = listEvidence(caseId);

  return (
    <div className="space-y-6" data-surface="console">
      <PageHeader
        title="Evidence"
        meta={
          <span className="inline-flex items-center gap-2 text-[13px] text-[var(--console-muted)]">
            <Package aria-hidden="true" weight="duotone" className="size-3.5" />
            {items.length} items
          </span>
        }
      />

      <Table className="text-[13px]">
        <TableHeader>
          <TableRow className="border-[var(--console-hairline)] hover:bg-transparent">
            <TableHead className="h-8 px-0 text-[12px] font-medium text-[var(--console-muted)]">
              Item
            </TableHead>
            <TableHead className="h-8 px-0 text-[12px] font-medium text-[var(--console-muted)]">
              Kind
            </TableHead>
            <TableHead className="h-8 px-0 text-right text-[12px] font-medium text-[var(--console-muted)]">
              Custody
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow
              key={item.id}
              className="border-[var(--console-strip)] hover:bg-[var(--console-strip)]"
            >
              <TableCell className="max-w-xl px-0 py-2.5 whitespace-normal font-medium text-[var(--console-ink)]">
                {item.label}
              </TableCell>
              <TableCell className="px-0 py-2.5 text-[12px] text-[var(--console-muted)]">
                {item.kind}
              </TableCell>
              <TableCell className="px-0 py-2.5 text-right">
                <Badge
                  variant={custodyVariant(item.custody)}
                  className="rounded-md border-[var(--console-hairline)] font-[family-name:var(--console-font-mono)] text-[11px] font-normal tracking-normal"
                >
                  {CUSTODY_LABEL[item.custody]}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

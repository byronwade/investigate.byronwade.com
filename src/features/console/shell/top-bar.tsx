'use client';

import { CaretDown } from '@phosphor-icons/react/dist/csr/CaretDown';
import { MagnifyingGlass } from '@phosphor-icons/react/dist/csr/MagnifyingGlass';
import { Plus } from '@phosphor-icons/react/dist/csr/Plus';
import { Triangle } from '@phosphor-icons/react/dist/csr/Triangle';
import type * as React from 'react';
import { useState } from 'react';

import { Avatar, AvatarFallback } from '#/components/ui/avatar';
import { Badge } from '#/components/ui/badge';
import { Button } from '#/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu';
import { Separator } from '#/components/ui/separator';
import { type CaseRecord, DEFAULT_CASE_ID } from '#/features/console/data';

import { CommandPalette } from './command-palette';
import { ConsoleLink } from './console-link';
import { paperReferenceNav, shortCaseTitle } from './nav';

export function TopBar({
  caseRecord,
  crumb,
}: {
  caseRecord?: CaseRecord;
  crumb?: string;
}): React.JSX.Element {
  const caseLabel = caseRecord ? shortCaseTitle(caseRecord.title) : null;
  const [commandOpen, setCommandOpen] = useState(false);
  const paletteCaseId = caseRecord?.id ?? DEFAULT_CASE_ID;

  return (
    <header className="flex h-[var(--console-topbar-height)] shrink-0 items-center justify-between gap-6 border-b border-[var(--console-hairline)] bg-[var(--console-ground)] px-5">
      <div className="flex min-w-0 shrink-0 items-center gap-2.5">
        <Triangle
          aria-hidden="true"
          weight="fill"
          className="size-[15px] shrink-0 text-[var(--console-ink)]"
        />
        <span className="text-[13px] text-[var(--console-muted)]">FBI Chicago</span>
        {caseRecord ? (
          <>
            <span className="text-[13px] text-[#c4c4c4]" aria-hidden="true">
              /
            </span>
            <span className="font-[family-name:var(--console-font-mono)] text-[12px] text-[var(--console-muted)]">
              {caseRecord.number}
            </span>
            <span className="text-[13px] text-[#c4c4c4]" aria-hidden="true">
              /
            </span>
            <span className="truncate text-[13px] font-medium text-[var(--console-ink)]">
              {caseLabel}
            </span>
          </>
        ) : (
          <>
            <span className="text-[13px] text-[#c4c4c4]" aria-hidden="true">
              /
            </span>
            <span className="text-[13px] text-[var(--console-muted)]">Chicago field office</span>
            {crumb ? (
              <>
                <span className="text-[13px] text-[#c4c4c4]" aria-hidden="true">
                  /
                </span>
                <span className="truncate text-[13px] font-medium text-[var(--console-ink)]">
                  {crumb}
                </span>
              </>
            ) : null}
          </>
        )}
      </div>

      <div className="flex min-w-0 max-w-[560px] flex-1 items-center gap-2">
        <button
          type="button"
          onClick={() => setCommandOpen(true)}
          className="relative flex h-[30px] min-w-0 flex-1 items-center rounded-[7px] border border-[var(--console-hairline)] bg-transparent pr-12 pl-9 text-left text-[13px] text-[var(--console-muted)] hover:bg-[var(--console-strip)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--console-ink)]"
          aria-label="Open command palette"
        >
          <MagnifyingGlass
            aria-hidden="true"
            weight="duotone"
            className="pointer-events-none absolute top-1/2 left-3 size-[13px] -translate-y-1/2 text-[var(--console-offence)]"
          />
          <span className="truncate">Ask the case, or run an agent task…</span>
          <kbd className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 font-[family-name:var(--console-font-mono)] text-[11px] text-[var(--console-muted)]">
            ⌘K
          </kbd>
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              size="sm"
              className="h-[30px] gap-1.5 rounded-[7px] px-3 text-[13px]"
            >
              <Plus aria-hidden="true" weight="bold" className="size-[11px]" />
              New
              <Separator orientation="vertical" className="mx-0.5 h-3.5 bg-white/25" />
              <CaretDown aria-hidden="true" weight="bold" className="size-[9px]" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem disabled>New lead</DropdownMenuItem>
            <DropdownMenuItem disabled>New evidence</DropdownMenuItem>
            <DropdownMenuItem disabled>New interview</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex shrink-0 items-center gap-3.5">
        <div className="hidden items-center gap-3 lg:flex">
          <Badge variant="secondary" className="rounded-md px-2 py-0.5 text-[13px] font-medium">
            Federal · FBI
          </Badge>
          <span className="text-[13px] text-[var(--console-muted)]">Local</span>
        </div>
        <Separator orientation="vertical" className="hidden h-[18px] lg:block" />
        <ConsoleLink
          to={paperReferenceNav.to}
          className="text-[13px] text-[var(--console-muted)] underline-offset-4 hover:text-[var(--console-ink)] hover:underline"
        >
          {paperReferenceNav.label}
        </ConsoleLink>
        <Avatar className="size-[26px]">
          <AvatarFallback className="bg-[var(--console-ink)] text-[11px] font-semibold text-white">
            DO
          </AvatarFallback>
        </Avatar>
      </div>

      <CommandPalette caseId={paletteCaseId} open={commandOpen} onOpenChange={setCommandOpen} />
    </header>
  );
}

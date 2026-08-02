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
import { TooltipProvider } from '#/components/ui/tooltip';
import { type CaseRecord, DEFAULT_CASE_ID } from '#/features/console/data';

import { CommandPalette } from './command-palette';
import { ConsoleLink } from './console-link';
import { paperReferenceNav, shortCaseTitle } from './nav';

export function TopBar({
  caseRecord,
  crumb,
  navVariant = 'agency',
}: {
  caseRecord?: CaseRecord;
  crumb?: string;
  navVariant?: 'agency' | 'case';
  /** Kept for shell API compatibility; mobile nav opens from the tab bar More control. */
  onOpenNav?: () => void;
}): React.JSX.Element {
  const caseLabel = caseRecord ? shortCaseTitle(caseRecord.title) : null;
  const [commandOpen, setCommandOpen] = useState(false);
  const paletteCaseId = caseRecord?.id ?? DEFAULT_CASE_ID;
  const mobileTitle = caseLabel ?? crumb ?? (navVariant === 'agency' ? 'Command' : 'Case');

  return (
    <TooltipProvider>
      <header className="sticky top-0 z-30 flex h-[var(--console-topbar-height)] shrink-0 items-center gap-2 border-b border-[var(--console-hairline)] bg-[var(--console-ground)]/95 px-3 backdrop-blur-md sm:gap-3 sm:px-5 lg:static lg:bg-[var(--console-ground)] lg:backdrop-blur-none">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-2.5">
          <Triangle
            aria-hidden="true"
            weight="fill"
            className="hidden size-[15px] shrink-0 text-[var(--console-ink)] sm:block"
          />

          {/* Mobile title — app-like */}
          <div className="min-w-0 lg:hidden">
            <p className="truncate text-[15px] font-semibold tracking-[-0.01em] text-[var(--console-ink)]">
              {mobileTitle}
            </p>
            <p className="truncate text-[11px] text-[var(--console-muted)]">
              {caseRecord ? caseRecord.number : 'FBI Chicago'}
            </p>
          </div>

          {/* Desktop breadcrumb */}
          <div className="hidden min-w-0 items-center gap-1.5 sm:gap-2.5 lg:flex">
            <span className="truncate text-[13px] text-[var(--console-muted)]">FBI Chicago</span>
            {caseRecord ? (
              <>
                <span className="text-[13px] text-[var(--console-hairline)]" aria-hidden="true">
                  /
                </span>
                <span className="font-[family-name:var(--console-font-mono)] text-[12px] text-[var(--console-muted)]">
                  {caseRecord.number}
                </span>
                <span className="text-[13px] text-[var(--console-hairline)]" aria-hidden="true">
                  /
                </span>
                <span className="truncate text-[13px] font-medium text-[var(--console-ink)]">
                  {caseLabel}
                </span>
              </>
            ) : (
              <>
                <span className="text-[13px] text-[var(--console-hairline)]" aria-hidden="true">
                  /
                </span>
                <span className="truncate text-[13px] text-[var(--console-muted)]">
                  Chicago field office
                </span>
                {crumb ? (
                  <>
                    <span className="text-[13px] text-[var(--console-hairline)]" aria-hidden="true">
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
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:min-w-0 sm:max-w-[560px] sm:flex-[1.2] sm:gap-2">
          <button
            type="button"
            onClick={() => setCommandOpen(true)}
            className="relative flex size-11 items-center justify-center rounded-[10px] border border-[var(--console-hairline)] text-[var(--console-muted)] hover:bg-[var(--console-strip)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--console-ink)] sm:h-[30px] sm:w-auto sm:min-w-0 sm:flex-1 sm:justify-start sm:rounded-[7px] sm:pr-12 sm:pl-9 sm:text-left sm:text-[13px]"
            aria-label="Open command palette"
          >
            <MagnifyingGlass
              aria-hidden="true"
              weight="duotone"
              className="size-[15px] text-[var(--console-offence)] sm:pointer-events-none sm:absolute sm:top-1/2 sm:left-3 sm:size-[13px] sm:-translate-y-1/2"
            />
            <span className="hidden truncate sm:inline">Ask the case…</span>
            <kbd className="pointer-events-none absolute top-1/2 right-3 hidden -translate-y-1/2 font-[family-name:var(--console-font-mono)] text-[11px] text-[var(--console-muted)] sm:inline">
              ⌘K
            </kbd>
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                size="sm"
                className="size-11 gap-1.5 rounded-[10px] px-0 text-[13px] sm:h-[30px] sm:w-auto sm:rounded-[7px] sm:px-3"
                aria-label="New"
              >
                <Plus aria-hidden="true" weight="bold" className="size-[11px]" />
                <span className="hidden sm:inline">New</span>
                <Separator
                  orientation="vertical"
                  className="mx-0.5 hidden h-3.5 bg-white/25 sm:block"
                />
                <CaretDown
                  aria-hidden="true"
                  weight="bold"
                  className="hidden size-[9px] sm:block"
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem asChild>
                <ConsoleLink to={`/console/cases/${paletteCaseId}/leads`}>New lead</ConsoleLink>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <ConsoleLink to={`/console/cases/${paletteCaseId}/evidence`}>
                  New evidence
                </ConsoleLink>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <ConsoleLink to={`/console/cases/${paletteCaseId}/interview`}>
                  New interview
                </ConsoleLink>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="hidden shrink-0 items-center gap-2 sm:gap-3.5 md:flex">
          <div className="hidden items-center gap-3 lg:flex">
            <Badge variant="secondary" className="rounded-md px-2 py-0.5 text-[13px] font-medium">
              Federal · FBI
            </Badge>
            <span className="text-[13px] text-[var(--console-muted)]">Local</span>
          </div>
          <Separator orientation="vertical" className="hidden h-[18px] lg:block" />
          <ConsoleLink
            to={paperReferenceNav.to}
            className="hidden text-[13px] text-[var(--console-muted)] underline-offset-4 hover:text-[var(--console-ink)] hover:underline md:inline"
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
    </TooltipProvider>
  );
}

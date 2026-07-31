'use client';

import { CaretDown } from '@phosphor-icons/react/dist/csr/CaretDown';
import { List } from '@phosphor-icons/react/dist/csr/List';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '#/components/ui/tooltip';
import { type CaseRecord, DEFAULT_CASE_ID } from '#/features/console/data';

import { CommandPalette } from './command-palette';
import { ConsoleLink } from './console-link';
import { MobileNav } from './mobile-nav';
import { paperReferenceNav, shortCaseTitle } from './nav';

export function TopBar({
  caseRecord,
  crumb,
  navVariant = 'agency',
}: {
  caseRecord?: CaseRecord;
  crumb?: string;
  navVariant?: 'agency' | 'case';
}): React.JSX.Element {
  const caseLabel = caseRecord ? shortCaseTitle(caseRecord.title) : null;
  const [commandOpen, setCommandOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const paletteCaseId = caseRecord?.id ?? DEFAULT_CASE_ID;

  return (
    <TooltipProvider>
      <header className="flex h-[var(--console-topbar-height)] shrink-0 items-center gap-2 border-b border-[var(--console-hairline)] bg-[var(--console-ground)] px-3 sm:gap-3 sm:px-5">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-2.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-11 shrink-0 rounded-md lg:hidden"
                aria-label="Open navigation"
                onClick={() => setMobileNavOpen(true)}
              >
                <List aria-hidden="true" weight="bold" className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Open navigation</TooltipContent>
          </Tooltip>

          <Triangle
            aria-hidden="true"
            weight="fill"
            className="hidden size-[15px] shrink-0 text-[var(--console-ink)] sm:block"
          />
          <div className="flex min-w-0 items-center gap-1.5 sm:gap-2.5">
            <span className="truncate text-[13px] text-[var(--console-muted)]">FBI Chicago</span>
            {caseRecord ? (
              <>
                <span
                  className="hidden text-[13px] text-[var(--console-hairline)] sm:inline"
                  aria-hidden="true"
                >
                  /
                </span>
                <span className="hidden font-[family-name:var(--console-font-mono)] text-[12px] text-[var(--console-muted)] sm:inline">
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
                <span
                  className="hidden text-[13px] text-[var(--console-hairline)] md:inline"
                  aria-hidden="true"
                >
                  /
                </span>
                <span className="hidden truncate text-[13px] text-[var(--console-muted)] md:inline">
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

        <div className="flex min-w-0 max-w-[560px] flex-[1.2] items-center gap-2">
          <button
            type="button"
            onClick={() => setCommandOpen(true)}
            className="relative flex h-11 min-w-0 flex-1 items-center rounded-[7px] border border-[var(--console-hairline)] bg-transparent pr-3 pl-9 text-left text-[13px] text-[var(--console-muted)] hover:bg-[var(--console-strip)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--console-ink)] sm:h-[30px] sm:pr-12"
            aria-label="Open command palette"
          >
            <MagnifyingGlass
              aria-hidden="true"
              weight="duotone"
              className="pointer-events-none absolute top-1/2 left-3 size-[13px] -translate-y-1/2 text-[var(--console-offence)]"
            />
            <span className="truncate">Ask the case…</span>
            <kbd className="pointer-events-none absolute top-1/2 right-3 hidden -translate-y-1/2 font-[family-name:var(--console-font-mono)] text-[11px] text-[var(--console-muted)] sm:inline">
              ⌘K
            </kbd>
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                size="sm"
                className="h-11 gap-1.5 rounded-[7px] px-3 text-[13px] sm:h-[30px]"
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

        <div className="flex shrink-0 items-center gap-2 sm:gap-3.5">
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
        <MobileNav
          open={mobileNavOpen}
          onOpenChange={setMobileNavOpen}
          variant={navVariant}
          caseId={paletteCaseId}
        />
      </header>
    </TooltipProvider>
  );
}

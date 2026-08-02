'use client';

import type { Icon } from '@phosphor-icons/react';
import { DotsThreeOutline } from '@phosphor-icons/react/dist/csr/DotsThreeOutline';
import { Folder } from '@phosphor-icons/react/dist/csr/Folder';
import { Kanban } from '@phosphor-icons/react/dist/csr/Kanban';
import { MagnifyingGlass } from '@phosphor-icons/react/dist/csr/MagnifyingGlass';
import { Package } from '@phosphor-icons/react/dist/csr/Package';
import { Path } from '@phosphor-icons/react/dist/csr/Path';
import { SquaresFour } from '@phosphor-icons/react/dist/csr/SquaresFour';
import { Tray } from '@phosphor-icons/react/dist/csr/Tray';
import { useRouterState } from '@tanstack/react-router';
import type * as React from 'react';

import { DEFAULT_CASE_ID } from '#/features/console/data';
import { cn } from '#/lib/utils';

import { ConsoleLink } from './console-link';
import { resolveCaseNavTo } from './nav';

type TabItem = {
  id: string;
  label: string;
  to?: string;
  icon: Icon;
  match?: (pathname: string) => boolean;
  onSelect?: () => void;
};

function isAgencyPrimary(pathname: string): boolean {
  return (
    pathname === '/console' ||
    pathname.startsWith('/console/command-center') ||
    pathname.startsWith('/console/intake') ||
    pathname === '/console/cases' ||
    pathname.startsWith('/console/search')
  );
}

function isCasePrimary(pathname: string): boolean {
  return (
    pathname.endsWith('/overview') ||
    pathname.endsWith('/timeline') ||
    pathname.endsWith('/evidence') ||
    pathname.endsWith('/leads')
  );
}

function agencyTabs(onMore: () => void): TabItem[] {
  return [
    {
      id: 'home',
      label: 'Home',
      to: '/console/command-center',
      icon: SquaresFour,
      match: (pathname) => pathname === '/console/command-center' || pathname === '/console',
    },
    {
      id: 'intake',
      label: 'Intake',
      to: '/console/intake',
      icon: Tray,
      match: (pathname) => pathname.startsWith('/console/intake'),
    },
    {
      id: 'cases',
      label: 'Cases',
      to: '/console/cases',
      icon: Folder,
      match: (pathname) => pathname === '/console/cases',
    },
    {
      id: 'search',
      label: 'Search',
      to: '/console/search',
      icon: MagnifyingGlass,
      match: (pathname) => pathname.startsWith('/console/search'),
    },
    {
      id: 'more',
      label: 'More',
      icon: DotsThreeOutline,
      onSelect: onMore,
      match: (pathname) => !isAgencyPrimary(pathname),
    },
  ];
}

function casePrimaryTabs(caseId: string, onMore: () => void): TabItem[] {
  return [
    {
      id: 'overview',
      label: 'Overview',
      to: resolveCaseNavTo('/console/cases/$caseId/overview', caseId),
      icon: SquaresFour,
      match: (pathname) => pathname.endsWith('/overview'),
    },
    {
      id: 'timeline',
      label: 'Timeline',
      to: resolveCaseNavTo('/console/cases/$caseId/timeline', caseId),
      icon: Path,
      match: (pathname) => pathname.endsWith('/timeline'),
    },
    {
      id: 'evidence',
      label: 'Evidence',
      to: resolveCaseNavTo('/console/cases/$caseId/evidence', caseId),
      icon: Package,
      match: (pathname) => pathname.endsWith('/evidence'),
    },
    {
      id: 'leads',
      label: 'Leads',
      to: resolveCaseNavTo('/console/cases/$caseId/leads', caseId),
      icon: Kanban,
      match: (pathname) => pathname.endsWith('/leads'),
    },
    {
      id: 'more',
      label: 'More',
      icon: DotsThreeOutline,
      onSelect: onMore,
      match: (pathname) => !isCasePrimary(pathname),
    },
  ];
}

export function MobileTabBar({
  variant,
  caseId = DEFAULT_CASE_ID,
  onMore,
}: {
  variant: 'agency' | 'case';
  caseId?: string;
  onMore: () => void;
}): React.JSX.Element {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const tabs = variant === 'agency' ? agencyTabs(onMore) : casePrimaryTabs(caseId, onMore);

  return (
    <nav
      aria-label={variant === 'agency' ? 'Agency primary' : 'Case primary'}
      className="console-tabbar lg:hidden"
    >
      <ul className="console-tabbar-list">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = tab.match?.(pathname) ?? false;

          if (tab.onSelect) {
            return (
              <li key={tab.id} className="min-w-0 flex-1">
                <button
                  type="button"
                  onClick={tab.onSelect}
                  className={cn('console-tabbar-item', active && 'console-tabbar-item-active')}
                  aria-label={tab.label}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon
                    aria-hidden="true"
                    weight={active ? 'fill' : 'duotone'}
                    className="size-5"
                  />
                  <span>{tab.label}</span>
                </button>
              </li>
            );
          }

          return (
            <li key={tab.id} className="min-w-0 flex-1">
              <ConsoleLink
                to={tab.to ?? '/console'}
                className={cn('console-tabbar-item', active && 'console-tabbar-item-active')}
                activeProps={{ 'aria-current': 'page' }}
              >
                <Icon aria-hidden="true" weight={active ? 'fill' : 'duotone'} className="size-5" />
                <span>{tab.label}</span>
              </ConsoleLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

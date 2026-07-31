import type { Icon } from '@phosphor-icons/react';
import { Books } from '@phosphor-icons/react/dist/csr/Books';
import { Clock } from '@phosphor-icons/react/dist/csr/Clock';
import { Folder } from '@phosphor-icons/react/dist/csr/Folder';
import { Kanban } from '@phosphor-icons/react/dist/csr/Kanban';
import { Package } from '@phosphor-icons/react/dist/csr/Package';
import { Path } from '@phosphor-icons/react/dist/csr/Path';
import { SquaresFour } from '@phosphor-icons/react/dist/csr/SquaresFour';
import { Users } from '@phosphor-icons/react/dist/csr/Users';

export type CaseNavItem = {
  /** Path template, e.g. `/console/cases/$caseId/overview` */
  to: string;
  label: string;
  icon: Icon;
};

export type CaseNavGroup = {
  id: string;
  label: string;
  items: CaseNavItem[];
};

/** Phase A case tabs — real destinations under `/console/cases/$caseId/...`. */
export const caseTabs: CaseNavItem[] = [
  {
    to: '/console/cases/$caseId/overview',
    label: 'Overview',
    icon: SquaresFour,
  },
  {
    to: '/console/cases/$caseId/timeline',
    label: 'Timeline',
    icon: Clock,
  },
  {
    to: '/console/cases/$caseId/evidence',
    label: 'Evidence',
    icon: Package,
  },
  {
    to: '/console/cases/$caseId/leads',
    label: 'Leads',
    icon: Kanban,
  },
  {
    to: '/console/cases/$caseId/people',
    label: 'People',
    icon: Users,
  },
];

/**
 * Sidebar groups for Phase A. Only destinations that will exist in Phase A
 * (plus Paper reference in the sidebar footer).
 */
export const sidebarGroups: CaseNavGroup[] = [
  {
    id: 'command',
    label: 'Command center',
    items: [
      {
        to: '/console/cases/$caseId/overview',
        label: 'Cases',
        icon: Folder,
      },
    ],
  },
  {
    id: 'record',
    label: 'Record',
    items: [
      {
        to: '/console/cases/$caseId/people',
        label: 'People',
        icon: Users,
      },
      {
        to: '/console/cases/$caseId/evidence',
        label: 'Evidence',
        icon: Package,
      },
      {
        to: '/console/cases/$caseId/leads',
        label: 'Leads',
        icon: Kanban,
      },
      {
        to: '/console/cases/$caseId/timeline',
        label: 'Timeline',
        icon: Path,
      },
    ],
  },
];

export const paperReferenceNav: CaseNavItem = {
  to: '/console/reference',
  label: 'Paper reference',
  icon: Books,
};

export function resolveCaseNavTo(to: string, caseId: string): string {
  return to.replaceAll('$caseId', caseId);
}

export function shortCaseTitle(title: string): string {
  const separator = title.indexOf('—');
  if (separator === -1) {
    return title;
  }
  return title.slice(0, separator).trim();
}

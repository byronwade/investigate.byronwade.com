import type { Icon } from '@phosphor-icons/react';
import { Books } from '@phosphor-icons/react/dist/csr/Books';
import { Buildings } from '@phosphor-icons/react/dist/csr/Buildings';
import { ChartBar } from '@phosphor-icons/react/dist/csr/ChartBar';
import { Clock } from '@phosphor-icons/react/dist/csr/Clock';
import { DownloadSimple } from '@phosphor-icons/react/dist/csr/DownloadSimple';
import { Flask } from '@phosphor-icons/react/dist/csr/Flask';
import { Folder } from '@phosphor-icons/react/dist/csr/Folder';
import { Gavel } from '@phosphor-icons/react/dist/csr/Gavel';
import { Graph } from '@phosphor-icons/react/dist/csr/Graph';
import { HardDrives } from '@phosphor-icons/react/dist/csr/HardDrives';
import { Image } from '@phosphor-icons/react/dist/csr/Image';
import { Kanban } from '@phosphor-icons/react/dist/csr/Kanban';
import { MagnifyingGlass } from '@phosphor-icons/react/dist/csr/MagnifyingGlass';
import { MapPin } from '@phosphor-icons/react/dist/csr/MapPin';
import { Microphone } from '@phosphor-icons/react/dist/csr/Microphone';
import { Package } from '@phosphor-icons/react/dist/csr/Package';
import { Path } from '@phosphor-icons/react/dist/csr/Path';
import { Scales } from '@phosphor-icons/react/dist/csr/Scales';
import { ShieldCheck } from '@phosphor-icons/react/dist/csr/ShieldCheck';
import { SquaresFour } from '@phosphor-icons/react/dist/csr/SquaresFour';
import { Tray } from '@phosphor-icons/react/dist/csr/Tray';
import { Users } from '@phosphor-icons/react/dist/csr/Users';
import { VideoCamera } from '@phosphor-icons/react/dist/csr/VideoCamera';
import { Warning } from '@phosphor-icons/react/dist/csr/Warning';

export type CaseNavItem = {
  /** Path template, e.g. `/console/cases/$caseId/overview` or absolute `/console/...` */
  to: string;
  label: string;
  icon: Icon;
  badge?: string;
};

export type CaseNavGroup = {
  id: string;
  label: string;
  items: CaseNavItem[];
};

/** Case tabs — destinations under `/console/cases/$caseId/...`. */
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
    to: '/console/cases/$caseId/plan',
    label: 'Plan',
    icon: Path,
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

/** Agency / workspace sidebar (AgencyShell). */
export const agencySidebarGroups: CaseNavGroup[] = [
  {
    id: 'command',
    label: 'Command',
    items: [
      {
        to: '/console/command-center',
        label: 'Command center',
        icon: SquaresFour,
      },
      {
        to: '/console/intake',
        label: 'Intake',
        icon: DownloadSimple,
        badge: '24',
      },
      {
        to: '/console/cases',
        label: 'Cases',
        icon: Folder,
      },
      {
        to: '/console/incidents',
        label: 'Incidents',
        icon: Warning,
      },
      {
        to: '/console/scenes',
        label: 'Scenes',
        icon: MapPin,
      },
    ],
  },
  {
    id: 'record',
    label: 'Record',
    items: [
      {
        to: '/console/people-orgs',
        label: 'People & orgs',
        icon: Users,
      },
      {
        to: '/console/cases/northridge/evidence',
        label: 'Physical evidence',
        icon: Package,
      },
      {
        to: '/console/cases/northridge/digital',
        label: 'Digital evidence',
        icon: HardDrives,
      },
      {
        to: '/console/cases/northridge/leads',
        label: 'Leads & tasks',
        icon: Kanban,
        badge: '37',
      },
      {
        to: '/console/interviews',
        label: 'Interviews',
        icon: Microphone,
      },
    ],
  },
  {
    id: 'process',
    label: 'Process',
    items: [
      {
        to: '/console/cases/northridge/legal',
        label: 'Legal process',
        icon: Scales,
        badge: '4',
      },
      {
        to: '/console/cases/northridge/forensics',
        label: 'Forensics',
        icon: Flask,
      },
      {
        to: '/console/intelligence',
        label: 'Intelligence',
        icon: Graph,
      },
      {
        to: '/console/prosecution',
        label: 'Prosecution',
        icon: Gavel,
      },
    ],
  },
  {
    id: 'media',
    label: 'Media',
    items: [
      {
        to: '/console/media/field-capture',
        label: 'Field capture',
        icon: Image,
      },
      {
        to: '/console/media/video-review',
        label: 'Video review',
        icon: VideoCamera,
      },
      {
        to: '/console/media/audio-examination',
        label: 'Audio examination',
        icon: Microphone,
      },
      {
        to: '/console/media/photo-canvas',
        label: 'Photo canvas',
        icon: Image,
      },
    ],
  },
  {
    id: 'governance',
    label: 'Governance',
    items: [
      {
        to: '/console/reports',
        label: 'Reports',
        icon: ChartBar,
      },
      {
        to: '/console/records',
        label: 'Records & retention',
        icon: Tray,
      },
      {
        to: '/console/oversight',
        label: 'Oversight & audit',
        icon: ShieldCheck,
      },
      {
        to: '/console/administration',
        label: 'Administration',
        icon: Buildings,
      },
    ],
  },
];

/** Case-context sidebar — case pages plus jump to agency home. */
export const sidebarGroups: CaseNavGroup[] = [
  {
    id: 'command',
    label: 'Command center',
    items: [
      {
        to: '/console/command-center',
        label: 'Command center',
        icon: SquaresFour,
      },
      {
        to: '/console/cases/$caseId/overview',
        label: 'This case',
        icon: Folder,
      },
      {
        to: '/console/cases',
        label: 'All cases',
        icon: Tray,
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
        to: '/console/cases/$caseId/digital',
        label: 'Digital',
        icon: HardDrives,
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
      {
        to: '/console/cases/$caseId/plan',
        label: 'Investigative plan',
        icon: MagnifyingGlass,
      },
    ],
  },
  {
    id: 'process',
    label: 'Process',
    items: [
      {
        to: '/console/cases/$caseId/legal',
        label: 'Legal',
        icon: Scales,
      },
      {
        to: '/console/cases/$caseId/forensics',
        label: 'Forensics',
        icon: Flask,
      },
      {
        to: '/console/cases/$caseId/discovery',
        label: 'Discovery',
        icon: Books,
      },
      {
        to: '/console/cases/$caseId/approvals',
        label: 'Approvals',
        icon: ShieldCheck,
      },
      {
        to: '/console/cases/$caseId/closure',
        label: 'Closure',
        icon: Folder,
      },
    ],
  },
];

export const paperReferenceNav: CaseNavItem = {
  to: '/console/reference',
  label: 'Paper reference',
  icon: Books,
};

export const agencyCommandDestinations: CaseNavItem[] = agencySidebarGroups.flatMap(
  (group) => group.items,
);

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

import type {
  CommandCenterModel,
  MediaWorkbenchModel,
  PortfolioCase,
  WorkspacePageModel,
} from './agency-types';
import { NORTHRIDGE_CASE_ID } from './northridge';

const DEFAULT_CASE_ID = NORTHRIDGE_CASE_ID;

export const commandCenter: CommandCenterModel = {
  greeting: 'Good morning, Dayo',
  summary: [
    '61 open cases',
    'assistants ran overnight on 12 of them',
    '18 decisions waiting on a human',
  ],
  waiting: {
    id: 'waiting',
    title: 'Waiting on you — soonest 4 of 11',
    hint: 'no assistant can complete any of these — each one is a human-only decision',
    rows: [
      {
        id: 'w1',
        primary: 'Northridge',
        secondary: 'Accept a potentially exculpatory finding and route it to the prosecution team',
        meta: 'brady review',
        due: 'due 04 Mar',
        tone: 'warn',
        href: `/console/cases/${DEFAULT_CASE_ID}/overview`,
      },
      {
        id: 'w2',
        primary: 'Northridge',
        secondary: 'Elevate a person of interest to subject — requires a written factual basis',
        meta: 'role elevation',
        due: 'today',
        tone: 'warn',
        href: `/console/cases/${DEFAULT_CASE_ID}/people`,
      },
      {
        id: 'w3',
        primary: 'Halstead Transit',
        secondary:
          'Approve a warrant affidavit — every assertion is source-cited, none are assistant-authored facts',
        meta: 'probable cause',
        due: '2 days',
        tone: 'danger',
      },
      {
        id: 'w4',
        primary: 'Cortland Wire',
        secondary:
          'Confirm redactions before defense production — assistant proposed, human must confirm',
        meta: 'disclosure',
        due: '06 Mar',
        tone: 'warn',
      },
    ],
  },
  overnight: {
    id: 'overnight',
    title: 'Assistant runs overnight',
    hint: 'every run is logged with the records it read and the records it was denied',
    rows: [
      {
        id: 'r8841',
        primary: 'RUN 8841 · Northridge',
        secondary: 'Contradiction sweep — 3 found, 1 potentially exculpatory',
        meta: '41 read · 4 denied',
        due: 'running',
        tone: 'sensor',
      },
      {
        id: 'r8836',
        primary: 'RUN 8836 · Halstead Transit',
        secondary:
          'Drafted a warrant affidavit from verified records only — 0 unsupported assertions',
        meta: '88 read · 0 denied',
        due: 'complete',
        tone: 'ok',
      },
      {
        id: 'r8831',
        primary: 'RUN 8831 · Cortland Wire',
        secondary: 'Retention hold check across 6 systems — 2 holds expiring this week',
        meta: '12 read · 1 denied',
        due: 'complete',
        tone: 'ok',
      },
    ],
  },
  attention: {
    id: 'attention',
    title: 'Squad attention',
    hint: 'surface items from shared queues that are not yet assigned to you',
    rows: [
      {
        id: 'a1',
        primary: 'Intake backlog',
        secondary: '24 tips awaiting triage classification',
        meta: 'intake',
        due: 'open',
        tone: 'warn',
        href: '/console/intake',
      },
      {
        id: 'a2',
        primary: 'Prosecution packet',
        secondary: 'Northridge Brady index incomplete for next production',
        meta: 'prosecution',
        due: 'flagged',
        tone: 'danger',
        href: '/console/prosecution',
      },
    ],
  },
};

export const portfolioCases: PortfolioCase[] = [
  {
    id: DEFAULT_CASE_ID,
    number: '245D-CG-3881127',
    title: 'Northridge — public corruption & wire fraud',
    status: 'open',
    squad: 'Public corruption',
    openedLabel: 'Opened 11 Feb 2026',
    href: `/console/cases/${DEFAULT_CASE_ID}/overview`,
  },
  {
    id: 'halstead',
    number: '245D-CG-3880901',
    title: 'Halstead Transit — procurement kickbacks',
    status: 'open',
    squad: 'Public corruption',
    openedLabel: 'Opened 03 Jan 2026',
    href: `/console/cases/${DEFAULT_CASE_ID}/overview`,
  },
  {
    id: 'cortland',
    number: '245D-CG-3877402',
    title: 'Cortland Wire — wire fraud & money laundering',
    status: 'open',
    squad: 'White collar',
    openedLabel: 'Opened 18 Nov 2025',
    href: `/console/cases/${DEFAULT_CASE_ID}/overview`,
  },
  {
    id: 'lakeshore',
    number: '245D-CG-3862100',
    title: 'Lakeshore — closed civil rights referral',
    status: 'closed',
    squad: 'Civil rights',
    openedLabel: 'Closed 09 Dec 2025',
    href: `/console/cases/${DEFAULT_CASE_ID}/overview`,
  },
];

function listPage(
  slug: string,
  title: string,
  crumb: string,
  description: string,
  sections: WorkspacePageModel['sections'],
  meta?: string,
): WorkspacePageModel {
  return meta === undefined
    ? { slug, title, crumb, description, sections }
    : { slug, title, crumb, description, sections, meta };
}

export const workspacePages: Record<string, WorkspacePageModel> = {
  intake: listPage(
    'intake',
    'Intake & triage',
    'Intake',
    'Classify tips, assign need-to-know, and open or decline cases. Assistants propose; humans decide.',
    [
      {
        id: 'queue',
        title: 'Open queue — 24',
        hint: 'sorted by risk score · none auto-opened',
        rows: [
          {
            id: 'i1',
            primary: 'TIP-2026-1184',
            secondary: 'Anonymous tip — Northridge vendor invoices inflated on 2024 awards',
            meta: 'public corruption',
            due: 'priority',
            tone: 'danger',
          },
          {
            id: 'i2',
            primary: 'TIP-2026-1179',
            secondary: 'Municipal clerk reports missing badge-access export for Feb board vote',
            meta: 'records',
            due: 'today',
            tone: 'warn',
          },
          {
            id: 'i3',
            primary: 'TIP-2026-1162',
            secondary: 'Citizen complaint — parking ticket pattern; no federal nexus indicated',
            meta: 'decline candidate',
            due: 'low',
            tone: 'muted',
          },
        ],
      },
    ],
    '24 awaiting triage',
  ),
  intelligence: listPage(
    'intelligence',
    'Intelligence',
    'Intelligence',
    'Cross-case link analysis and source packages with explicit access boundaries.',
    [
      {
        id: 'packages',
        title: 'Active packages',
        rows: [
          {
            id: 'p1',
            primary: 'Northridge vendor cluster',
            secondary: '6 entities · 3 shared bank routing numbers · FOUO',
            meta: 'link chart',
            due: 'updated 2h',
            tone: 'ok',
          },
          {
            id: 'p2',
            primary: 'Halstead subcontractors',
            secondary: 'Awaiting FINCEN query — foreign-intel lane locked',
            meta: 'denied lane',
            due: 'blocked',
            tone: 'danger',
          },
        ],
      },
    ],
  ),
  reports: listPage(
    'reports',
    'Reports & statistics',
    'Reports',
    'Squad workload, SLA, and assistant run metrics — no case facts in aggregates.',
    [
      {
        id: 'stats',
        title: 'This week',
        rows: [
          {
            id: 's1',
            primary: 'Open cases',
            secondary: '61 field-wide · 14 on your squad',
            meta: 'portfolio',
            due: '+2',
            tone: 'ok',
          },
          {
            id: 's2',
            primary: 'Human-only decisions cleared',
            secondary: '27 cleared · 18 remaining in your queue',
            meta: 'decisions',
            due: 'watch',
            tone: 'warn',
          },
          {
            id: 's3',
            primary: 'Assistant denials',
            secondary: '112 records denied overnight for need-to-know',
            meta: 'audit',
            due: 'logged',
            tone: 'muted',
          },
        ],
      },
    ],
  ),
  oversight: listPage(
    'oversight',
    'Oversight & audit',
    'Oversight',
    'Query logs, technique use, and access justifications for inspector-general review.',
    [
      {
        id: 'audits',
        title: 'Recent audit events',
        rows: [
          {
            id: 'o1',
            primary: 'Session 4c81·ff20',
            secondary: 'SA Okonjo-Ramirez queried Northridge bank records — justification on file',
            meta: 'query',
            due: '07:12',
            tone: 'ok',
          },
          {
            id: 'o2',
            primary: 'Technique block',
            secondary: 'Foreign intel lane requested on Halstead — blocked · no clearance',
            meta: 'block',
            due: '06:40',
            tone: 'danger',
          },
        ],
      },
    ],
  ),
  records: listPage(
    'records',
    'Records & retention',
    'Records',
    'Retention schedules, legal holds, and destruction holds across systems of record.',
    [
      {
        id: 'holds',
        title: 'Active holds',
        rows: [
          {
            id: 'h1',
            primary: 'Northridge — litigation hold',
            secondary: 'Municipal email + financial systems · expires review 01 Apr',
            meta: 'hold',
            due: 'active',
            tone: 'warn',
          },
          {
            id: 'h2',
            primary: 'Cortland Wire — discovery freeze',
            secondary: 'Defense production window · no destruction authorized',
            meta: 'freeze',
            due: 'active',
            tone: 'danger',
          },
        ],
      },
    ],
  ),
  incidents: listPage(
    'incidents',
    'Incidents map',
    'Incidents',
    'Geographic and temporal incident overlays tied to open cases — mock pins only.',
    [
      {
        id: 'pins',
        title: 'Mapped incidents',
        rows: [
          {
            id: 'm1',
            primary: 'Northridge Township Hall',
            secondary: 'Award vote night · badge-access anomaly cluster',
            meta: '41.9°N',
            due: '11 Feb',
            tone: 'warn',
            href: `/console/cases/${DEFAULT_CASE_ID}/scene`,
          },
          {
            id: 'm2',
            primary: 'Halstead depot',
            secondary: 'Subcontractor cash drop allegation — uncorroborated',
            meta: '41.8°N',
            due: '22 Jan',
            tone: 'muted',
          },
        ],
      },
    ],
  ),
  'people-orgs': listPage(
    'people-orgs',
    'People & organizations',
    'People & orgs',
    'Agency-wide directory of people and orgs linked across cases.',
    [
      {
        id: 'people',
        title: 'Directory',
        rows: [
          {
            id: 'po1',
            primary: 'Vance, Curtis A.',
            secondary: 'Subject · Northridge · 4 contradictions',
            meta: 'person',
            href: `/console/cases/${DEFAULT_CASE_ID}/people/person-vance`,
            tone: 'danger',
          },
          {
            id: 'po2',
            primary: 'Northridge Township',
            secondary: 'Municipal org · awards board · records custodian',
            meta: 'org',
            tone: 'muted',
          },
          {
            id: 'po3',
            primary: 'Bright, Renata',
            secondary: 'Witness · recorded statement 08-B',
            meta: 'person',
            href: `/console/cases/${DEFAULT_CASE_ID}/people/person-bright`,
            tone: 'ok',
          },
        ],
      },
    ],
  ),
  prosecution: listPage(
    'prosecution',
    'Prosecution',
    'Prosecution',
    'Packets, Brady indexes, and AUSA handoffs — human-gated release.',
    [
      {
        id: 'packets',
        title: 'Active packets',
        rows: [
          {
            id: 'pr1',
            primary: 'Northridge · NDIL',
            secondary: 'Brady index incomplete · 2 items awaiting confirmation',
            meta: 'AUSA Chen',
            due: 'flagged',
            tone: 'danger',
            href: `/console/cases/${DEFAULT_CASE_ID}/discovery`,
          },
          {
            id: 'pr2',
            primary: 'Halstead · warrant support',
            secondary: 'Affidavit ready for human signature',
            meta: 'PC package',
            due: 'ready',
            tone: 'warn',
          },
        ],
      },
    ],
  ),
  scenes: listPage(
    'scenes',
    'Scenes index',
    'Scenes',
    'Scene diagrams and location packages across the portfolio.',
    [
      {
        id: 'scenes',
        title: 'Scenes',
        rows: [
          {
            id: 'sc1',
            primary: 'Northridge Township Hall — council chamber',
            secondary: 'Diagram v3 · photo set 14 · measurements locked',
            meta: 'primary',
            href: `/console/cases/${DEFAULT_CASE_ID}/scene`,
            tone: 'ok',
          },
          {
            id: 'sc2',
            primary: 'Vendor warehouse — invoice staging',
            secondary: 'Walkthrough pending · access request open',
            meta: 'secondary',
            tone: 'warn',
          },
        ],
      },
    ],
  ),
  interviews: listPage(
    'interviews',
    'Interviews index',
    'Interviews',
    'Interview schedule, transcripts, and contradiction flags.',
    [
      {
        id: 'iv',
        title: 'Interviews',
        rows: [
          {
            id: 'iv1',
            primary: 'Bright, Renata — statement 08-B',
            secondary: 'Recorded · transcript reviewed · 0 contradictions',
            meta: 'complete',
            href: `/console/cases/${DEFAULT_CASE_ID}/interview`,
            tone: 'ok',
          },
          {
            id: 'iv2',
            primary: 'Vance, Curtis A. — subject interview',
            secondary: 'Scheduled · counsel present required',
            meta: 'upcoming',
            due: '12 Mar',
            tone: 'warn',
          },
        ],
      },
    ],
  ),
  administration: listPage(
    'administration',
    'Administration',
    'Administration',
    'Roles, clearances, technique catalogs, and agency configuration.',
    [
      {
        id: 'admin',
        title: 'Configuration',
        rows: [
          {
            id: 'ad1',
            primary: 'Clearance matrix',
            secondary: 'Federal · Local · Crim-intel · Foreign intel · IG',
            meta: 'RBAC',
            tone: 'ok',
          },
          {
            id: 'ad2',
            primary: 'Technique catalog',
            secondary: '42 techniques · 6 blocked at this clearance',
            meta: 'policy',
            tone: 'muted',
          },
        ],
      },
    ],
  ),
  'local-mode': listPage(
    'local-mode',
    'Local mode',
    'Local mode',
    'Disconnected / air-gapped operation. Sync queues hold until network returns.',
    [
      {
        id: 'local',
        title: 'Local status',
        rows: [
          {
            id: 'lm1',
            primary: 'Network',
            secondary: 'Simulated online · last sync 07:04',
            meta: 'connected',
            tone: 'ok',
          },
          {
            id: 'lm2',
            primary: 'Outbound queue',
            secondary: '0 mutations waiting · 2 audit events buffered',
            meta: 'queue',
            tone: 'muted',
          },
        ],
      },
    ],
  ),
  handoff: listPage(
    'handoff',
    'Handoff',
    'Handoff',
    'Shift and squad handoff notes with explicit open decisions.',
    [
      {
        id: 'ho',
        title: 'Open handoffs',
        rows: [
          {
            id: 'ho1',
            primary: 'Night → day · Northridge',
            secondary: 'Brady finding awaiting accept · do not brief AUSA until confirmed',
            meta: 'critical',
            tone: 'danger',
            href: `/console/cases/${DEFAULT_CASE_ID}/overview`,
          },
          {
            id: 'ho2',
            primary: 'Squad desk',
            secondary: 'Intake tip 1184 needs federal nexus review',
            meta: 'intake',
            tone: 'warn',
            href: '/console/intake',
          },
        ],
      },
    ],
  ),
  search: listPage(
    'search',
    'Search results',
    'Search',
    'Cross-record search with need-to-know filtering applied to every hit.',
    [
      {
        id: 'hits',
        title: 'Results for “Northridge award”',
        hint: '4 visible · 2 hidden by clearance',
        rows: [
          {
            id: 'sr1',
            primary: 'Evidence · vendor invoice 8812',
            secondary: 'Case Northridge · custody intake',
            meta: 'evidence',
            href: `/console/cases/${DEFAULT_CASE_ID}/evidence`,
            tone: 'ok',
          },
          {
            id: 'sr2',
            primary: 'Timeline · award vote',
            secondary: '11 Feb 2026 · council chamber',
            meta: 'event',
            href: `/console/cases/${DEFAULT_CASE_ID}/timeline`,
            tone: 'ok',
          },
        ],
      },
    ],
  ),
  'court-production': listPage(
    'court-production',
    'Court production',
    'Court production',
    'Assemble productions with redaction confirmation gates.',
    [
      {
        id: 'prod',
        title: 'Productions',
        rows: [
          {
            id: 'cp1',
            primary: 'Northridge · defense set B',
            secondary: '14 docs · 3 proposed redactions awaiting human confirm',
            meta: 'pending',
            tone: 'warn',
            href: `/console/cases/${DEFAULT_CASE_ID}/discovery`,
          },
        ],
      },
    ],
  ),
  foundations: listPage(
    'foundations',
    'Foundations',
    'Foundations',
    'Console design tokens, type, density, and component principles (docs route).',
    [
      {
        id: 'fd',
        title: 'Principles',
        rows: [
          {
            id: 'fd1',
            primary: 'Ink on ground',
            secondary: '#111111 on #FFFFFF · hairline #ECECEC · muted floor #6B6B6B',
            meta: 'color',
            tone: 'muted',
          },
          {
            id: 'fd2',
            primary: 'Geist / Geist Mono',
            secondary: 'UI sans + mono for case numbers and classification',
            meta: 'type',
            tone: 'muted',
          },
          {
            id: 'fd3',
            primary: 'Shell chrome is shared',
            secondary: 'Pages fill main (+ optional rail) only',
            meta: 'layout',
            tone: 'ok',
          },
        ],
      },
    ],
  ),
  motion: listPage(
    'motion',
    'Motion & interaction',
    'Motion',
    'Press feedback, menus, side panels, indeterminate agent bar — honor reduced motion.',
    [
      {
        id: 'mo',
        title: 'Allowed motion',
        rows: [
          {
            id: 'mo1',
            primary: 'Press / focus',
            secondary: 'Buttons and rows — short opacity/background only',
            meta: 'allowed',
            tone: 'ok',
          },
          {
            id: 'mo2',
            primary: 'No decorative reshuffles',
            secondary: 'Lists do not animate reordering for delight',
            meta: 'forbidden',
            tone: 'danger',
          },
        ],
      },
    ],
  ),
  'empty-states': listPage(
    'empty-states',
    'Empty states',
    'Empty states',
    'Calm empty, denied, and offline patterns for console surfaces.',
    [
      {
        id: 'es',
        title: 'Patterns',
        rows: [
          {
            id: 'es1',
            primary: 'No records yet',
            secondary: 'Explain what belongs here and the first human action',
            meta: 'empty',
            tone: 'muted',
          },
          {
            id: 'es2',
            primary: 'Access denied',
            secondary: 'State the lane and that the denial is audited',
            meta: 'denied',
            tone: 'danger',
          },
          {
            id: 'es3',
            primary: 'Offline / local mode',
            secondary: 'Show sync queue depth — never pretend live data',
            meta: 'offline',
            tone: 'warn',
          },
        ],
      },
    ],
  ),
};

/** Case-scoped Phase C pages (beyond Phase A five). */
export const caseWorkspacePages: Record<string, WorkspacePageModel> = {
  plan: listPage(
    'plan',
    'Investigative plan',
    'Plan',
    'Hypotheses, techniques, and sequenced work — assistants propose steps; humans approve.',
    [
      {
        id: 'hyp',
        title: 'Active hypotheses',
        rows: [
          {
            id: 'pl1',
            primary: 'H1 — Inflated awards',
            secondary: 'Vendor invoices systematically exceed peer awards by >18%',
            meta: 'testing',
            tone: 'warn',
          },
          {
            id: 'pl2',
            primary: 'H2 — Badge-access cover',
            secondary: 'Subject present for vote; alibi conflict with access log',
            meta: 'corroborating',
            tone: 'ok',
          },
        ],
      },
    ],
  ),
  analysis: listPage(
    'analysis',
    'Analysis board',
    'Analysis',
    'Working theories, contradictions, and evidence links on one board.',
    [
      {
        id: 'an',
        title: 'Board columns',
        rows: [
          {
            id: 'an1',
            primary: 'Supported',
            secondary: 'Invoice 8812 · badge log · Bright statement',
            meta: '3 items',
            tone: 'ok',
          },
          {
            id: 'an2',
            primary: 'Contradicted',
            secondary: 'Osei tip vs. absence of corroborating record',
            meta: '1 item',
            tone: 'danger',
          },
        ],
      },
    ],
  ),
  scene: listPage(
    'scene',
    'Scene diagram',
    'Scene',
    'Council chamber layout with measurement lock and photo anchors.',
    [
      {
        id: 'sc',
        title: 'Diagram layers',
        rows: [
          {
            id: 'sc1',
            primary: 'Floor plan v3',
            secondary: 'Locked measurements · 14 photo anchors',
            meta: 'primary',
            tone: 'ok',
          },
          {
            id: 'sc2',
            primary: 'Movement overlay',
            secondary: 'Subject path from badge events — provisional',
            meta: 'overlay',
            tone: 'warn',
          },
        ],
      },
    ],
  ),
  legal: listPage(
    'legal',
    'Legal process',
    'Legal',
    'Warrants, subpoenas, and process tracking for this case.',
    [
      {
        id: 'lg',
        title: 'Process',
        rows: [
          {
            id: 'lg1',
            primary: 'Bank records subpoena',
            secondary: 'Served 14 Feb · production rolling',
            meta: 'subpoena',
            tone: 'ok',
          },
          {
            id: 'lg2',
            primary: 'Device warrant — laptop NR-2291',
            secondary: 'Affidavit draft ready · human sign-off required',
            meta: 'warrant',
            tone: 'warn',
          },
        ],
      },
    ],
    '4 open',
  ),
  interview: listPage(
    'interview',
    'Interview transcript',
    'Interview',
    'Bright statement 08-B — transcript with contradiction markers.',
    [
      {
        id: 'tr',
        title: 'Transcript excerpts',
        rows: [
          {
            id: 'tr1',
            primary: '00:04:12',
            secondary: 'Bright confirms presence at award vote; identifies Vance at table',
            meta: 'corroborates',
            tone: 'ok',
          },
          {
            id: 'tr2',
            primary: '00:18:40',
            secondary: 'No recollection of invoice 8812 discussion — flagged for follow-up',
            meta: 'gap',
            tone: 'warn',
          },
        ],
      },
    ],
  ),
  digital: listPage(
    'digital',
    'Digital evidence',
    'Digital',
    'Devices, extractions, and hash-verified artifacts.',
    [
      {
        id: 'de',
        title: 'Digital items',
        rows: [
          {
            id: 'de1',
            primary: 'Dell Latitude NR-2291',
            secondary: 'Seal E-88417 · hash pending lab',
            meta: 'device',
            tone: 'warn',
            href: `/console/cases/${DEFAULT_CASE_ID}/evidence`,
          },
          {
            id: 'de2',
            primary: 'Badge-access export',
            secondary: 'CSV · SHA-256 verified · lab',
            meta: 'records',
            tone: 'ok',
          },
        ],
      },
    ],
  ),
  forensics: listPage(
    'forensics',
    'Forensics',
    'Forensics',
    'Lab requests and results tied to custody items.',
    [
      {
        id: 'fs',
        title: 'Lab queue',
        rows: [
          {
            id: 'fs1',
            primary: 'Disk image — NR-2291',
            secondary: 'Queued · estimated 5 days',
            meta: 'digital',
            tone: 'warn',
          },
          {
            id: 'fs2',
            primary: 'Paper invoice ink analysis',
            secondary: 'Not requested — no physical original',
            meta: 'n/a',
            tone: 'muted',
          },
        ],
      },
    ],
  ),
  discovery: listPage(
    'discovery',
    'Discovery & disclosure',
    'Discovery',
    'Brady / Giglio tracking and defense productions.',
    [
      {
        id: 'di',
        title: 'Disclosure items',
        rows: [
          {
            id: 'di1',
            primary: 'Potentially exculpatory contradiction',
            secondary: 'Assistant finding — human accept required before AUSA brief',
            meta: 'Brady',
            tone: 'danger',
          },
          {
            id: 'di2',
            primary: 'Bright statement 08-B',
            secondary: 'Marked for production set B',
            meta: 'produce',
            tone: 'ok',
          },
        ],
      },
    ],
  ),
  approvals: listPage(
    'approvals',
    'Approvals',
    'Approvals',
    'Technique and process approvals awaiting a human signature.',
    [
      {
        id: 'ap',
        title: 'Pending',
        rows: [
          {
            id: 'ap1',
            primary: 'Role elevation — Osei → subject',
            secondary: 'Requires written factual basis',
            meta: 'you',
            due: 'today',
            tone: 'warn',
          },
          {
            id: 'ap2',
            primary: 'Warrant affidavit — laptop',
            secondary: 'All assertions source-cited',
            meta: 'SSA',
            due: '2 days',
            tone: 'warn',
          },
        ],
      },
    ],
  ),
  closure: listPage(
    'closure',
    'Case closure',
    'Closure',
    'Checklist for closing or referring the case — nothing auto-closes.',
    [
      {
        id: 'cl',
        title: 'Closure checklist',
        rows: [
          {
            id: 'cl1',
            primary: 'Evidence disposition',
            secondary: '3 items sealed · 1 in lab — incomplete',
            meta: 'open',
            tone: 'warn',
          },
          {
            id: 'cl2',
            primary: 'Prosecution handoff',
            secondary: 'Brady index incomplete',
            meta: 'blocked',
            tone: 'danger',
          },
          {
            id: 'cl3',
            primary: 'Retention holds',
            secondary: 'Litigation hold active through Apr review',
            meta: 'ok',
            tone: 'ok',
          },
        ],
      },
    ],
  ),
};

export const mediaWorkbenches: Record<string, MediaWorkbenchModel> = {
  'field-capture': {
    slug: 'field-capture',
    title: 'Field capture',
    crumb: 'Field capture',
    description: 'Ingest photos and notes from the field with custody-preserving packaging.',
    assetLabel: 'Capture set · Northridge Hall · 11 Feb',
    statusLabel: '14 assets · hashes pending sync',
    tracks: [
      { id: 't1', label: 'Chamber wide', detail: 'IMG_0142 · NE corner' },
      { id: 't2', label: 'Dais detail', detail: 'IMG_0148 · placard Vance' },
      { id: 't3', label: 'Exit corridor', detail: 'IMG_0155 · badge reader' },
    ],
    notes: [
      { id: 'n1', at: '19:42', text: 'Lighting uneven — request supplemental flash set' },
      { id: 'n2', at: '19:51', text: 'Chain seal applied to SD card sleeve FC-22' },
    ],
  },
  'video-review': {
    slug: 'video-review',
    title: 'Video review',
    crumb: 'Video review',
    description: 'Review CCTV and body-worn video with bookmarkable moments.',
    assetLabel: 'Hall lobby cam · 11 Feb 18:40–20:10',
    statusLabel: 'Scrubbing · bookmarks 3',
    tracks: [
      { id: 't1', label: '18:52:01', detail: 'Subject enters frame from east door' },
      { id: 't2', label: '19:08:44', detail: 'Conversation at reception — faces occluded' },
      { id: 't3', label: '19:41:12', detail: 'Subject exits · bag in left hand' },
    ],
    notes: [
      {
        id: 'n1',
        at: 'bookmark',
        text: 'Request enhancement on 19:08 faces — human approve first',
      },
    ],
  },
  'audio-examination': {
    slug: 'audio-examination',
    title: 'Audio examination',
    crumb: 'Audio examination',
    description: 'Waveform review for recorded statements and ambient audio.',
    assetLabel: 'Statement 08-B · Bright',
    statusLabel: 'Transcript aligned · 0 redaction marks',
    tracks: [
      { id: 't1', label: '00:04:12', detail: 'Presence at vote affirmed' },
      { id: 't2', label: '00:18:40', detail: 'Invoice discussion — no recollection' },
    ],
    notes: [{ id: 'n1', at: 'QC', text: 'No clipping · room tone consistent' }],
  },
  'photo-canvas': {
    slug: 'photo-canvas',
    title: 'Photo canvas',
    crumb: 'Photo canvas',
    description: 'Annotate stills with measurements and callouts for scene packages.',
    assetLabel: 'IMG_0148 · dais placard',
    statusLabel: 'Annotations 2 · export locked',
    tracks: [
      { id: 't1', label: 'Callout A', detail: 'Placard text: Vance' },
      { id: 't2', label: 'Measure', detail: 'Dais edge to wall — 1.2 m (locked)' },
    ],
    notes: [{ id: 'n1', at: 'note', text: 'Do not upscale — original retained' }],
  },
};

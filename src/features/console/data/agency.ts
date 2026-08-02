import type {
  AnalysisBoardModel,
  ApprovalsModel,
  CaseQueueModel,
  ClosureModel,
  CommandCenterModel,
  DirectoryModel,
  DocsPageModel,
  IncidentsModel,
  IntakeModel,
  IntelligenceModel,
  InterviewTranscriptModel,
  InvestigativePlanModel,
  LegalProcessModel,
  LocalModeModel,
  MediaWorkbenchModel,
  PortfolioCase,
  ProsecutionModel,
  ReportsModel,
  SceneDiagramModel,
  SearchModel,
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
    href: '/console/cases/halstead/overview',
  },
  {
    id: 'cortland',
    number: '245D-CG-3877402',
    title: 'Cortland Wire — wire fraud & money laundering',
    status: 'open',
    squad: 'White collar',
    openedLabel: 'Opened 18 Nov 2025',
    href: '/console/cases/cortland/overview',
  },
  {
    id: 'lakeshore',
    number: '245D-CG-3862100',
    title: 'Lakeshore — closed civil rights referral',
    status: 'closed',
    squad: 'Civil rights',
    openedLabel: 'Closed 09 Dec 2025',
    href: '/console/cases/lakeshore/overview',
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

export const intakeModel: IntakeModel = {
  title: 'Intake & triage',
  description:
    'Classify tips, assign need-to-know, and open or decline cases. Assistants propose; humans decide.',
  meta: '24 awaiting triage',
  selectedId: 'i1',
  queue: [
    {
      id: 'i1',
      tipId: 'TIP-2026-1184',
      summary: 'Anonymous tip — Northridge vendor invoices inflated on 2024 awards',
      classification: 'public corruption',
      priority: 'priority',
      tone: 'danger',
      owner: 'mine',
      submittedLabel: 'Submitted 28 Feb · tip line',
      extractedFields: [
        { label: 'Alleged actors', value: 'Vance, Curtis A. · Northridge Township' },
        { label: 'Federal nexus', value: 'Proposed — wire / program fraud (assistant)' },
        { label: 'Source reliability', value: 'Unknown · anonymous' },
        { label: 'Suggested action', value: 'Open preliminary · assign Public Corruption' },
      ],
    },
    {
      id: 'i2',
      tipId: 'TIP-2026-1179',
      summary: 'Municipal clerk reports missing badge-access export for Feb board vote',
      classification: 'records',
      priority: 'today',
      tone: 'warn',
      owner: 'unassigned',
      submittedLabel: 'Submitted 27 Feb · walk-in',
      extractedFields: [
        { label: 'Alleged actors', value: 'Unknown clerk staff' },
        { label: 'Federal nexus', value: 'Unclear — may support Northridge' },
        { label: 'Source reliability', value: 'Named municipal employee' },
        { label: 'Suggested action', value: 'Link to Northridge · request records' },
      ],
    },
    {
      id: 'i3',
      tipId: 'TIP-2026-1162',
      summary: 'Citizen complaint — parking ticket pattern; no federal nexus indicated',
      classification: 'decline candidate',
      priority: 'low',
      tone: 'muted',
      owner: 'squad',
      submittedLabel: 'Submitted 25 Feb · web form',
      extractedFields: [
        { label: 'Alleged actors', value: 'Local parking enforcement' },
        { label: 'Federal nexus', value: 'None indicated' },
        { label: 'Source reliability', value: 'Named complainant' },
        { label: 'Suggested action', value: 'Decline · refer to municipal' },
      ],
    },
    {
      id: 'i4',
      tipId: 'TIP-2026-1155',
      summary: 'Vendor employee alleges kickbacks on Halstead Transit bus shelter contracts',
      classification: 'public corruption',
      priority: 'today',
      tone: 'warn',
      owner: 'mine',
      submittedLabel: 'Submitted 24 Feb · tip line',
      extractedFields: [
        { label: 'Alleged actors', value: 'Halstead Transit procurement' },
        { label: 'Federal nexus', value: 'Proposed — federal transit funds' },
        { label: 'Source reliability', value: 'Named · employment verified pending' },
        { label: 'Suggested action', value: 'Open · assign to Halstead squad' },
      ],
    },
  ],
};

export const investigativePlan: InvestigativePlanModel = {
  title: 'Investigative plan',
  description:
    'Hypotheses, techniques, and sequenced work — assistants propose steps; humans approve.',
  objective:
    'Determine whether Northridge Township award decisions were steered through inflated invoices and covered by access-log manipulation around the 11 Feb vote.',
  hypotheses: [
    {
      id: 'h1',
      code: 'H1',
      title: 'Inflated awards',
      statement:
        'Vendor invoices systematically exceed peer awards by more than 18% on contested packages.',
      status: 'testing',
      tone: 'warn',
      supports: ['Invoice 8812', 'Peer award spreadsheet'],
      contradicts: [],
    },
    {
      id: 'h2',
      code: 'H2',
      title: 'Badge-access cover',
      statement:
        'Subject was present for the award vote; stated alibi conflicts with badge-access log.',
      status: 'corroborating',
      tone: 'ok',
      supports: ['Badge-access log', 'Bright statement 08-B'],
      contradicts: ['Subject verbal alibi'],
    },
    {
      id: 'h3',
      code: 'H3',
      title: 'Osei tip channel',
      statement:
        'Marcus Osei is a material tip source rather than a participant in the award scheme.',
      status: 'disprove candidate',
      tone: 'danger',
      supports: [],
      contradicts: ['No corroborating record for Osei'],
    },
  ],
  steps: [
    {
      id: 's1',
      label: 'Complete bank records production review',
      owner: 'SA Okonjo-Ramirez',
      due: '04 Mar',
      tone: 'warn',
    },
    {
      id: 's2',
      label: 'Schedule follow-up interview — Bright',
      owner: 'SSA Halloway',
      due: 'this week',
      tone: 'ok',
    },
    {
      id: 's3',
      label: 'Disprove or corroborate Osei tip with independent records',
      owner: 'Assistant propose · human approve',
      due: 'queued',
      tone: 'sensor',
    },
  ],
};

export const searchModel: SearchModel = {
  title: 'Search results',
  description: 'Cross-record search with need-to-know filtering applied to every hit.',
  query: 'Northridge award',
  visibleCount: 5,
  hiddenCount: 2,
  filters: ['All', 'Evidence', 'Timeline', 'People', 'Runs'],
  hits: [
    {
      id: 'sr1',
      kind: 'Evidence',
      title: 'Vendor invoice 8812',
      snippet: 'Line items for “community outreach” exceed peer awards by 22% on package NR-14.',
      provenance: 'Northridge · custody intake · DE-1183',
      href: `/console/cases/${DEFAULT_CASE_ID}/evidence`,
      tone: 'ok',
    },
    {
      id: 'sr2',
      kind: 'Timeline',
      title: 'Award vote — council chamber',
      snippet:
        '11 Feb 2026 · roll-call vote on contested awards; Vance present for three of four packages.',
      provenance: 'Northridge · event · council minutes',
      href: `/console/cases/${DEFAULT_CASE_ID}/timeline`,
      tone: 'ok',
    },
    {
      id: 'sr3',
      kind: 'People',
      title: 'Vance, Curtis A.',
      snippet: 'Signed 3 of 4 disputed awards · bank records subpoenaed 14 Feb.',
      provenance: 'Northridge · subject',
      href: `/console/cases/${DEFAULT_CASE_ID}/people/person-vance`,
      tone: 'warn',
    },
    {
      id: 'sr4',
      kind: 'Run',
      title: 'RUN 8841 — contradiction sweep',
      snippet: '3 contradictions found · 1 potentially exculpatory · 41 records read · 4 denied.',
      provenance: 'Overnight assistant · FOUO',
      href: `/console/cases/${DEFAULT_CASE_ID}/overview`,
      tone: 'sensor',
    },
    {
      id: 'sr5',
      kind: 'Media',
      title: 'Hall lobby cam bookmark 18:52',
      snippet: 'Subject enters frame from east door carrying folio consistent with award packet.',
      provenance: 'Video review · fixture asset',
      href: '/console/media/video-review',
      tone: 'ok',
    },
    {
      id: 'sr6',
      kind: 'Restricted',
      title: 'Foreign-intel lane hit',
      snippet: 'Hidden by clearance — denial audited.',
      provenance: 'Need-to-know filter',
      tone: 'danger',
      clearanceHidden: true,
    },
  ],
};

export const intelligenceModel: IntelligenceModel = {
  title: 'Intelligence',
  description: 'Cross-case link analysis and source packages with explicit access boundaries.',
  meta: '2 active packages · 1 blocked lane',
  selectedId: 'p1',
  packages: [
    {
      id: 'p1',
      title: 'Northridge vendor cluster',
      summary: 'Six entities share three bank routing numbers across contested awards.',
      lane: 'FOUO · federal',
      status: 'updated 2h',
      tone: 'ok',
      entities: ['Vance, Curtis A.', 'Northridge Township', 'Brightline Vendors LLC'],
      accessNote: 'Readable at current clearance · ORCON applies to export',
      href: `/console/cases/${DEFAULT_CASE_ID}/analysis`,
    },
    {
      id: 'p2',
      title: 'Halstead subcontractors',
      summary: 'Awaiting FINCEN query — foreign-intel lane requested and blocked.',
      lane: 'Foreign intel',
      status: 'blocked',
      tone: 'danger',
      entities: ['Halstead Transit', 'Unknown shell vendor'],
      accessNote: 'Denied — no foreign-intel clearance on this session',
    },
    {
      id: 'p3',
      title: 'Cortland Wire money flow',
      summary: 'Draft link chart of remittance hops; assistant proposed, human must accept edges.',
      lane: 'Crim-intel',
      status: 'draft',
      tone: 'warn',
      entities: ['Cortland Wire', 'Two remittance desks'],
      accessNote: 'Readable · edge acceptance is a human-only decision',
    },
  ],
};

export const incidentsModel: IncidentsModel = {
  title: 'Incidents map',
  description: 'Geographic and temporal incident overlays tied to open cases — mock pins only.',
  meta: '4 pins · Chicago field',
  selectedId: 'm1',
  pins: [
    {
      id: 'm1',
      label: 'Northridge Township Hall',
      summary: 'Award vote night · badge-access anomaly cluster',
      coords: '41.921°N · 87.701°W',
      when: '11 Feb',
      tone: 'warn',
      href: `/console/cases/${DEFAULT_CASE_ID}/scene`,
    },
    {
      id: 'm2',
      label: 'Halstead depot',
      summary: 'Subcontractor cash drop allegation — uncorroborated',
      coords: '41.882°N · 87.642°W',
      when: '22 Jan',
      tone: 'muted',
    },
    {
      id: 'm3',
      label: 'Vendor warehouse — invoice staging',
      summary: 'Walkthrough pending · access request open',
      coords: '41.867°N · 87.689°W',
      when: 'pending',
      tone: 'warn',
      href: `/console/cases/${DEFAULT_CASE_ID}/scene`,
    },
    {
      id: 'm4',
      label: 'Cortland remittance desk',
      summary: 'Wire pattern observation · no scene package yet',
      coords: '41.895°N · 87.628°W',
      when: '18 Nov',
      tone: 'ok',
    },
  ],
};

export const interviewsIndexModel: DirectoryModel = {
  title: 'Interviews index',
  description: 'Interview schedule, transcripts, and contradiction flags.',
  meta: '1 complete · 1 upcoming',
  filters: ['All', 'Complete', 'Upcoming', 'Draft'],
  entries: [
    {
      id: 'iv1',
      title: 'Bright, Renata — statement 08-B',
      summary: 'Recorded · transcript reviewed · 0 contradictions',
      kind: 'Witness',
      status: 'Complete',
      tone: 'ok',
      href: `/console/cases/${DEFAULT_CASE_ID}/interview`,
      meta: '08-B',
    },
    {
      id: 'iv2',
      title: 'Vance, Curtis A. — subject interview',
      summary: 'Scheduled · counsel present required',
      kind: 'Subject',
      status: 'Upcoming',
      tone: 'warn',
      meta: '12 Mar',
    },
    {
      id: 'iv3',
      title: 'Municipal clerk — badge export',
      summary: 'Draft outline only · not yet scheduled',
      kind: 'Witness',
      status: 'Draft',
      tone: 'muted',
      meta: 'outline',
    },
  ],
};

export const peopleOrgsModel: DirectoryModel = {
  title: 'People & organizations',
  description: 'Agency-wide directory of people and orgs linked across cases.',
  meta: '3 directory rows',
  filters: ['All', 'Person', 'Org'],
  entries: [
    {
      id: 'po1',
      title: 'Vance, Curtis A.',
      summary: 'Subject · Northridge · 4 contradictions',
      kind: 'Person',
      status: 'Subject',
      tone: 'danger',
      href: `/console/cases/${DEFAULT_CASE_ID}/people/person-vance`,
    },
    {
      id: 'po2',
      title: 'Northridge Township',
      summary: 'Municipal org · awards board · records custodian',
      kind: 'Org',
      status: 'Custodian',
      tone: 'muted',
    },
    {
      id: 'po3',
      title: 'Bright, Renata',
      summary: 'Witness · recorded statement 08-B',
      kind: 'Person',
      status: 'Witness',
      tone: 'ok',
      href: `/console/cases/${DEFAULT_CASE_ID}/people/person-bright`,
    },
    {
      id: 'po4',
      title: 'Brightline Vendors LLC',
      summary: 'Vendor org · contested awards NR-14 / NR-18',
      kind: 'Org',
      status: 'Vendor',
      tone: 'warn',
    },
  ],
};

export const scenesIndexModel: DirectoryModel = {
  title: 'Scenes index',
  description: 'Scene diagrams and location packages across the portfolio.',
  meta: '2 scene packages',
  filters: ['All', 'Primary', 'Secondary'],
  entries: [
    {
      id: 'sc1',
      title: 'Northridge Township Hall — council chamber',
      summary: 'Diagram v3 · photo set 14 · measurements locked',
      kind: 'Primary',
      status: 'Locked',
      tone: 'ok',
      href: `/console/cases/${DEFAULT_CASE_ID}/scene`,
    },
    {
      id: 'sc2',
      title: 'Vendor warehouse — invoice staging',
      summary: 'Walkthrough pending · access request open',
      kind: 'Secondary',
      status: 'Pending',
      tone: 'warn',
    },
  ],
};

export const prosecutionModel: ProsecutionModel = {
  title: 'Prosecution',
  description: 'Packets, Brady indexes, and AUSA handoffs — human-gated release.',
  meta: '2 packets · 1 Brady flag',
  packets: [
    {
      id: 'pr1',
      title: 'Northridge · NDIL',
      summary: 'Brady index incomplete · 2 items awaiting confirmation',
      owner: 'AUSA Chen',
      status: 'flagged',
      tone: 'danger',
      bradyOpen: 2,
      href: `/console/cases/${DEFAULT_CASE_ID}/discovery`,
    },
    {
      id: 'pr2',
      title: 'Halstead · warrant support',
      summary: 'Affidavit ready for human signature',
      owner: 'PC package',
      status: 'ready',
      tone: 'warn',
      bradyOpen: 0,
    },
  ],
};

export const analysisBoard: AnalysisBoardModel = {
  title: 'Analysis board',
  description: 'Working theories, contradictions, and evidence links on one board.',
  columns: [
    {
      id: 'supported',
      title: 'Supported',
      items: [
        {
          id: 'an1',
          label: 'Invoice 8812 over peer awards',
          detail: 'Linked to Brightline Vendors · custody DE-1183',
          tone: 'ok',
        },
        {
          id: 'an2',
          label: 'Badge log places Vance at vote',
          detail: 'Access events 18:41–19:12 · chamber door',
          tone: 'ok',
        },
        {
          id: 'an3',
          label: 'Bright statement 08-B',
          detail: 'Identifies Vance at awards table',
          tone: 'ok',
        },
      ],
    },
    {
      id: 'contradicted',
      title: 'Contradicted',
      items: [
        {
          id: 'an4',
          label: 'Osei tip vs. absence of record',
          detail: 'No corroborating municipal or bank record yet',
          tone: 'danger',
        },
      ],
    },
    {
      id: 'open',
      title: 'Open questions',
      items: [
        {
          id: 'an5',
          label: 'Who altered badge export?',
          detail: 'Clerk tip linked · extraction incomplete',
          tone: 'warn',
        },
        {
          id: 'an6',
          label: 'Counsel interview window for Vance',
          detail: 'Scheduled 12 Mar · do not contact without counsel',
          tone: 'warn',
        },
      ],
    },
  ],
};

export const interviewTranscript: InterviewTranscriptModel = {
  title: 'Interview transcript',
  description: 'Bright statement 08-B — transcript with contradiction markers.',
  subject: 'Bright, Renata',
  meta: '08-B · recorded · reviewed',
  lines: [
    {
      id: 'tr1',
      at: '00:04:12',
      speaker: 'Bright',
      text: 'I was at the award vote. Curtis Vance sat at the table for three of the four packages.',
      marker: 'corroborates',
      tone: 'ok',
    },
    {
      id: 'tr2',
      at: '00:11:05',
      speaker: 'SA Okonjo-Ramirez',
      text: 'Did anyone discuss invoice line items for community outreach that night?',
    },
    {
      id: 'tr3',
      at: '00:18:40',
      speaker: 'Bright',
      text: 'I do not recall any discussion of invoice 8812. That is not ringing a bell.',
      marker: 'gap',
      tone: 'warn',
    },
    {
      id: 'tr4',
      at: '00:22:18',
      speaker: 'Bright',
      text: 'The clerk said the badge export for that night went missing the next morning.',
      marker: 'lead',
      tone: 'sensor',
    },
  ],
};

export const legalProcess: LegalProcessModel = {
  title: 'Legal process',
  description: 'Warrants, subpoenas, and process tracking for this case.',
  meta: '4 open',
  items: [
    {
      id: 'lg1',
      title: 'Bank records subpoena',
      summary: 'Served 14 Feb · production rolling',
      kind: 'subpoena',
      status: 'in production',
      tone: 'ok',
    },
    {
      id: 'lg2',
      title: 'Device warrant — laptop NR-2291',
      summary: 'Affidavit draft ready · human sign-off required',
      kind: 'warrant',
      status: 'awaiting signature',
      tone: 'warn',
      due: '2 days',
    },
    {
      id: 'lg3',
      title: 'Municipal email subpoena',
      summary: 'Draft assertions source-cited · not yet served',
      kind: 'subpoena',
      status: 'draft',
      tone: 'muted',
      due: 'this week',
    },
    {
      id: 'lg4',
      title: 'Preservation letter — badge system',
      summary: 'Sent to township IT · acknowledgment received',
      kind: 'preservation',
      status: 'acknowledged',
      tone: 'ok',
    },
  ],
};

export const approvalsModel: ApprovalsModel = {
  title: 'Approvals',
  description: 'Technique and process approvals awaiting a human signature.',
  meta: '2 pending on you',
  items: [
    {
      id: 'ap1',
      title: 'Role elevation — Osei → subject',
      summary: 'Requires written factual basis before role change.',
      requester: 'you',
      due: 'today',
      tone: 'warn',
      decisionNote: 'Assistants may draft the basis; only a human can elevate.',
    },
    {
      id: 'ap2',
      title: 'Warrant affidavit — laptop',
      summary: 'All assertions source-cited · SSA co-signature required.',
      requester: 'SSA',
      due: '2 days',
      tone: 'warn',
      decisionNote: 'No assistant-authored facts appear in the affidavit body.',
    },
  ],
};

export const sceneDiagram: SceneDiagramModel = {
  title: 'Scene diagram',
  description: 'Council chamber layout with measurement lock and photo anchors.',
  location: 'Northridge Township Hall — council chamber',
  meta: 'v3 · measurements locked',
  layers: [
    {
      id: 'sc1',
      title: 'Floor plan v3',
      summary: 'Locked measurements · 14 photo anchors',
      status: 'primary',
      tone: 'ok',
    },
    {
      id: 'sc2',
      title: 'Movement overlay',
      summary: 'Subject path from badge events — provisional',
      status: 'overlay',
      tone: 'warn',
    },
    {
      id: 'sc3',
      title: 'Camera coverage',
      summary: 'Lobby cam FOV · hall cam FOV',
      status: 'reference',
      tone: 'muted',
    },
  ],
  anchors: [
    { id: 'a1', label: 'Anchor A', note: 'Dais / awards table' },
    { id: 'a2', label: 'Anchor B', note: 'East door · badge reader' },
    { id: 'a3', label: 'Anchor C', note: 'Public gallery rail' },
  ],
};

export const reportsModel: ReportsModel = {
  title: 'Reports & statistics',
  description: 'Squad workload, SLA, and assistant run metrics — no case facts in aggregates.',
  meta: 'Week of 24 Feb',
  metrics: [
    {
      id: 's1',
      label: 'Open cases',
      value: '61',
      detail: '14 on your squad · +2 this week',
      tone: 'ok',
    },
    {
      id: 's2',
      label: 'Human-only decisions',
      value: '18',
      detail: '27 cleared · remaining in your queue',
      tone: 'warn',
    },
    {
      id: 's3',
      label: 'Assistant denials',
      value: '112',
      detail: 'Records denied overnight for need-to-know',
      tone: 'muted',
    },
    {
      id: 's4',
      label: 'Intake backlog',
      value: '24',
      detail: 'Tips awaiting triage classification',
      tone: 'warn',
    },
  ],
  notes: [
    {
      id: 'n1',
      title: 'SLA watch — Brady accept',
      summary: 'Northridge finding still awaiting human accept before AUSA brief',
      kind: 'SLA',
      status: 'watch',
      tone: 'danger',
      href: `/console/cases/${DEFAULT_CASE_ID}/approvals`,
    },
    {
      id: 'n2',
      title: 'Run volume',
      summary: '12 overnight runs · 0 unsupported assertions in drafted affidavits',
      kind: 'Assistants',
      status: 'healthy',
      tone: 'ok',
    },
  ],
};

export const oversightModel: DirectoryModel = {
  title: 'Oversight & audit',
  description: 'Query logs, technique use, and access justifications for inspector-general review.',
  meta: 'Session 4c81·ff20',
  filters: ['All', 'Query', 'Block', 'Technique'],
  entries: [
    {
      id: 'o1',
      title: 'Session 4c81·ff20',
      summary: 'SA Okonjo-Ramirez queried Northridge bank records — justification on file',
      kind: 'Query',
      status: '07:12',
      tone: 'ok',
    },
    {
      id: 'o2',
      title: 'Technique block',
      summary: 'Foreign intel lane requested on Halstead — blocked · no clearance',
      kind: 'Block',
      status: '06:40',
      tone: 'danger',
    },
    {
      id: 'o3',
      title: 'Technique use — contradiction sweep',
      summary: 'RUN 8841 · 41 read · 4 denied · logged for IG',
      kind: 'Technique',
      status: 'overnight',
      tone: 'sensor',
      href: `/console/cases/${DEFAULT_CASE_ID}/overview`,
    },
  ],
};

export const recordsModel: DirectoryModel = {
  title: 'Records & retention',
  description: 'Retention schedules, legal holds, and destruction holds across systems of record.',
  meta: '2 active holds',
  filters: ['All', 'Hold', 'Freeze'],
  entries: [
    {
      id: 'h1',
      title: 'Northridge — litigation hold',
      summary: 'Municipal email + financial systems · expires review 01 Apr',
      kind: 'Hold',
      status: 'active',
      tone: 'warn',
    },
    {
      id: 'h2',
      title: 'Cortland Wire — discovery freeze',
      summary: 'Defense production window · no destruction authorized',
      kind: 'Freeze',
      status: 'active',
      tone: 'danger',
    },
    {
      id: 'h3',
      title: 'Halstead Transit — retention schedule',
      summary: 'Standard 7-year financial retention · no special hold',
      kind: 'Hold',
      status: 'schedule',
      tone: 'muted',
    },
  ],
};

export const administrationModel: DirectoryModel = {
  title: 'Administration',
  description: 'Roles, clearances, technique catalogs, and agency configuration.',
  meta: 'Chicago field office',
  filters: ['All', 'RBAC', 'Policy', 'Catalog'],
  entries: [
    {
      id: 'ad1',
      title: 'Clearance matrix',
      summary: 'Federal · Local · Crim-intel · Foreign intel · IG',
      kind: 'RBAC',
      status: 'configured',
      tone: 'ok',
    },
    {
      id: 'ad2',
      title: 'Technique catalog',
      summary: '42 techniques · 6 blocked at this clearance',
      kind: 'Catalog',
      status: 'current',
      tone: 'muted',
    },
    {
      id: 'ad3',
      title: 'Need-to-know policy',
      summary: 'Assistants never invent access · denials are audited',
      kind: 'Policy',
      status: 'enforced',
      tone: 'ok',
    },
  ],
};

export const localModeModel: LocalModeModel = {
  title: 'Local mode',
  description: 'Disconnected / air-gapped operation. Sync queues hold until network returns.',
  meta: 'Simulated online',
  networkLabel: 'Connected',
  networkTone: 'ok',
  lastSync: '07:04',
  queue: [
    {
      id: 'lm1',
      title: 'Outbound mutations',
      summary: '0 mutations waiting',
      kind: 'Queue',
      status: 'clear',
      tone: 'ok',
    },
    {
      id: 'lm2',
      title: 'Audit buffer',
      summary: '2 audit events buffered for next sync',
      kind: 'Queue',
      status: 'buffered',
      tone: 'muted',
    },
    {
      id: 'lm3',
      title: 'Media packages',
      summary: 'Field capture package staged locally · not yet uploaded',
      kind: 'Media',
      status: 'staged',
      tone: 'warn',
      href: '/console/media/field-capture',
    },
  ],
};

export const handoffModel: DirectoryModel = {
  title: 'Handoff',
  description: 'Shift and squad handoff notes with explicit open decisions.',
  meta: '2 open handoffs',
  filters: ['All', 'Critical', 'Intake'],
  entries: [
    {
      id: 'ho1',
      title: 'Night → day · Northridge',
      summary: 'Brady finding awaiting accept · do not brief AUSA until confirmed',
      kind: 'Critical',
      status: 'open',
      tone: 'danger',
      href: `/console/cases/${DEFAULT_CASE_ID}/overview`,
    },
    {
      id: 'ho2',
      title: 'Squad desk',
      summary: 'Intake tip 1184 needs federal nexus review',
      kind: 'Intake',
      status: 'open',
      tone: 'warn',
      href: '/console/intake',
    },
  ],
};

export const courtProductionModel: DirectoryModel = {
  title: 'Court production',
  description: 'Assemble productions with redaction confirmation gates.',
  meta: '1 pending production',
  filters: ['All', 'Pending', 'Ready'],
  entries: [
    {
      id: 'cp1',
      title: 'Northridge · defense set B',
      summary: '14 docs · 3 proposed redactions awaiting human confirm',
      kind: 'Pending',
      status: 'pending',
      tone: 'warn',
      href: `/console/cases/${DEFAULT_CASE_ID}/discovery`,
    },
    {
      id: 'cp2',
      title: 'Halstead · PC package exhibit list',
      summary: 'Exhibit index drafted · not released',
      kind: 'Ready',
      status: 'draft',
      tone: 'muted',
    },
  ],
};

export const foundationsDocs: DocsPageModel = {
  title: 'Foundations',
  description: 'Console design tokens, type, density, and component principles (docs route).',
  meta: 'Product docs',
  principles: [
    {
      id: 'fd1',
      title: 'Ink on ground',
      summary: 'Four greys, no more',
      detail: '#111111 on #FFFFFF · hairline #ECECEC · muted floor #6B6B6B · body #3D3D3D',
      tone: 'muted',
    },
    {
      id: 'fd2',
      title: 'Geist / Geist Mono',
      summary: 'UI sans + mono for identifiers',
      detail: 'Case numbers, classification, hashes, and times always use mono.',
      tone: 'muted',
    },
    {
      id: 'fd3',
      title: 'Shell chrome is shared',
      summary: 'Pages fill main (+ optional rail) only',
      detail: 'Classification, top bar, sidebar, and case tabs are never re-rendered by pages.',
      tone: 'ok',
    },
  ],
};

export const motionDocs: DocsPageModel = {
  title: 'Motion & interaction',
  description:
    'Press feedback, menus, side panels, indeterminate agent bar — honor reduced motion.',
  meta: 'Product docs',
  principles: [
    {
      id: 'mo1',
      title: 'Press / focus',
      summary: 'Allowed',
      detail: 'Buttons and rows may use short opacity or background changes only.',
      tone: 'ok',
    },
    {
      id: 'mo2',
      title: 'No decorative reshuffles',
      summary: 'Forbidden',
      detail: 'Lists do not animate reordering for delight. Prefer reduced-motion safe patterns.',
      tone: 'danger',
    },
    {
      id: 'mo3',
      title: 'Indeterminate agent bar',
      summary: 'Allowed when running',
      detail: 'Show progress only while an assistant run is active; never fake completion.',
      tone: 'sensor',
    },
  ],
};

export const digitalEvidenceQueue: CaseQueueModel = {
  title: 'Digital evidence',
  description: 'Devices, extractions, and hash-verified artifacts.',
  meta: '2 digital items',
  items: [
    {
      id: 'de1',
      title: 'Dell Latitude NR-2291',
      summary: 'Seal E-88417 · hash pending lab',
      kind: 'device',
      status: 'pending hash',
      tone: 'warn',
      href: `/console/cases/${DEFAULT_CASE_ID}/evidence`,
    },
    {
      id: 'de2',
      title: 'Badge-access export',
      summary: 'CSV · SHA-256 verified · lab',
      kind: 'records',
      status: 'verified',
      tone: 'ok',
    },
    {
      id: 'de3',
      title: 'Hall lobby cam clip',
      summary: 'Bookmark 18:52 · chain locked',
      kind: 'media',
      status: 'reviewed',
      tone: 'ok',
      href: '/console/media/video-review',
    },
  ],
};

export const forensicsQueue: CaseQueueModel = {
  title: 'Forensics',
  description: 'Lab requests and results tied to custody items.',
  meta: '1 queued · 1 n/a',
  items: [
    {
      id: 'fs1',
      title: 'Disk image — NR-2291',
      summary: 'Queued · estimated 5 days',
      kind: 'digital',
      status: 'queued',
      tone: 'warn',
      due: '5 days',
    },
    {
      id: 'fs2',
      title: 'Paper invoice ink analysis',
      summary: 'Not requested — no physical original',
      kind: 'n/a',
      status: 'not requested',
      tone: 'muted',
    },
  ],
};

export const discoveryQueue: CaseQueueModel = {
  title: 'Discovery & disclosure',
  description: 'Brady / Giglio tracking and defense productions.',
  meta: '1 Brady · 1 produce',
  items: [
    {
      id: 'di1',
      title: 'Potentially exculpatory contradiction',
      summary: 'Assistant finding — human accept required before AUSA brief',
      kind: 'Brady',
      status: 'awaiting accept',
      tone: 'danger',
      href: `/console/cases/${DEFAULT_CASE_ID}/approvals`,
    },
    {
      id: 'di2',
      title: 'Bright statement 08-B',
      summary: 'Marked for production set B',
      kind: 'produce',
      status: 'set B',
      tone: 'ok',
      href: `/console/cases/${DEFAULT_CASE_ID}/interview`,
    },
    {
      id: 'di3',
      title: 'Proposed redactions — set B',
      summary: '3 redactions awaiting human confirm in court production',
      kind: 'redaction',
      status: 'pending',
      tone: 'warn',
      href: '/console/court-production',
    },
  ],
};

export const closureModel: ClosureModel = {
  title: 'Case closure',
  description: 'Checklist for closing or referring the case — nothing auto-closes.',
  meta: '2 incomplete · 1 ok',
  items: [
    {
      id: 'cl1',
      title: 'Evidence disposition',
      summary: '3 items sealed · 1 in lab — incomplete',
      status: 'open',
      tone: 'warn',
      complete: false,
    },
    {
      id: 'cl2',
      title: 'Prosecution handoff',
      summary: 'Brady index incomplete',
      status: 'blocked',
      tone: 'danger',
      complete: false,
    },
    {
      id: 'cl3',
      title: 'Retention holds',
      summary: 'Litigation hold active through Apr review',
      status: 'ok',
      tone: 'ok',
      complete: true,
    },
  ],
};

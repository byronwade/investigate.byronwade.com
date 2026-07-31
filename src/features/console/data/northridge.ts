import type {
  CaseRecord,
  EvidenceRecord,
  LeadRecord,
  OverviewModel,
  PersonRecord,
  TimelineEventRecord,
} from './types';

export const NORTHRIDGE_CASE_ID = 'northridge';

export const northridgeCase: CaseRecord = {
  id: NORTHRIDGE_CASE_ID,
  number: '245D-CG-3881127',
  title: 'Northridge — public corruption & wire fraud',
  status: 'open',
  openedLabel: 'Opened 11 Feb 2026',
  assigneesLabel: 'SA Okonjo-Ramirez, SSA Halloway',
  reviewDueLabel: 'Review due in 9 days',
};

export const northridgePeople: PersonRecord[] = [
  {
    id: 'person-vance',
    caseId: NORTHRIDGE_CASE_ID,
    name: 'Vance, Curtis A.',
    role: 'subject',
    notes: 'Signed 3 of 4 disputed awards · bank records subpoenaed 14 Feb',
    contradictionCount: 4,
  },
  {
    id: 'person-bright',
    caseId: NORTHRIDGE_CASE_ID,
    name: 'Bright, Renata',
    role: 'witness',
    notes: 'Present at award vote · recorded statement 08-B',
    contradictionCount: 0,
  },
  {
    id: 'person-osei',
    caseId: NORTHRIDGE_CASE_ID,
    name: 'Osei, Marcus',
    role: 'poi',
    notes: 'Named in originating tip only · no corroborating record located',
    contradictionCount: 2,
  },
  {
    id: 'person-dunn',
    caseId: NORTHRIDGE_CASE_ID,
    name: 'Dunn, Priscilla',
    role: 'other',
    notes: 'Alibi verified against badge-access log · role closed 16 Feb',
    contradictionCount: 0,
  },
];

export const northridgeEvidence: EvidenceRecord[] = [
  {
    id: 'ev-26-0417-014',
    caseId: NORTHRIDGE_CASE_ID,
    label: 'Dell latitude laptop, black, asset tag NR-2291 · seal E-88417 intact',
    kind: 'digital device',
    custody: 'sealed',
  },
  {
    id: 'ev-0091',
    caseId: NORTHRIDGE_CASE_ID,
    label: 'Badge-access log — Northridge Township municipal building',
    kind: 'records',
    custody: 'lab',
  },
  {
    id: 'de-1183',
    caseId: NORTHRIDGE_CASE_ID,
    label: 'Vendor invoice 8812',
    kind: 'financial',
    custody: 'intake',
  },
  {
    id: 'ev-statement-08b',
    caseId: NORTHRIDGE_CASE_ID,
    label: 'Interview transcript 08-B — Bright, Renata',
    kind: 'statement',
    custody: 'checked-out',
  },
];

export const northridgeLeads: LeadRecord[] = [
  {
    id: 'lead-tip-reconcile',
    caseId: NORTHRIDGE_CASE_ID,
    title: 'Reconcile originating tip against warrant 26-MJ-0417 returns',
    column: 'active',
    owner: 'SA Okonjo-Ramirez',
  },
  {
    id: 'lead-bank-subpoena',
    caseId: NORTHRIDGE_CASE_ID,
    title: 'Review Vance bank records subpoenaed 14 Feb',
    column: 'triage',
    owner: 'SSA Halloway',
  },
  {
    id: 'lead-invoice-sequence',
    caseId: NORTHRIDGE_CASE_ID,
    title: 'Explain invoice 8812 dating 11 days before award vote',
    column: 'blocked',
    owner: 'SA Reyes',
  },
  {
    id: 'lead-dunn-alibi',
    caseId: NORTHRIDGE_CASE_ID,
    title: 'Close Dunn role after badge-access alibi verification',
    column: 'done',
    owner: 'SSA Halloway',
  },
];

export const northridgeTimeline: TimelineEventRecord[] = [
  {
    id: 'tl-tip',
    caseId: NORTHRIDGE_CASE_ID,
    atLabel: '11 February 2026',
    kind: 'tip',
    summary: 'Anonymous tip received through the public portal at 22:58.',
  },
  {
    id: 'tl-opened',
    caseId: NORTHRIDGE_CASE_ID,
    atLabel: '11 February 2026',
    kind: 'case',
    summary: 'Full investigation opened — Northridge public corruption & wire fraud.',
  },
  {
    id: 'tl-warrant',
    caseId: NORTHRIDGE_CASE_ID,
    atLabel: '18 February 2026',
    kind: 'warrant',
    summary: 'Search warrant 26-MJ-0417 executed at 4400 Kessler Blvd, Suite 210 — 09:41.',
  },
  {
    id: 'tl-assistant',
    caseId: NORTHRIDGE_CASE_ID,
    atLabel: '18 February 2026 · 11:04',
    kind: 'assistant',
    summary:
      'Assistant tasked to reconcile the tip against every record obtained under the warrant.',
  },
];

export const northridgeOverview: OverviewModel = {
  case: northridgeCase,
  assistant: {
    durationLabel: 'worked this case for 4m 12s',
    runLabel: 'RUN 8841',
    steps: [
      {
        id: 'step-scope',
        label: 'Confirmed authority scope — full investigation, 3 techniques blocked at this level',
        state: 'done',
        durationLabel: '0.4s',
      },
      {
        id: 'step-read',
        label: 'Read 41 records in compartment — warrant return, 14 evidence items, 8 statements',
        state: 'done',
        durationLabel: '38.2s',
      },
      {
        id: 'step-denied',
        label: 'Denied 4 records outside compartment — 3 sealed, 1 confidential source identity',
        state: 'denied',
        durationLabel: '0.1s',
      },
      {
        id: 'step-align',
        label: 'Aligned interview transcript 08-B to recording timestamps — derived copy only',
        state: 'done',
        durationLabel: '1m 06s',
      },
      {
        id: 'step-elements',
        label: 'Compared record against statutory elements of §§ 666, 1343 — 2 unsupported',
        state: 'done',
        durationLabel: '52.7s',
      },
      {
        id: 'step-search',
        label: 'Searching for contradictory and exculpatory material — 3 found so far',
        state: 'running',
        durationLabel: '1m 51s',
      },
      {
        id: 'step-pending',
        label: 'Package human-only decisions for case team review',
        state: 'pending',
      },
    ],
    findings: [
      {
        id: 'finding-1',
        text: "The badge-access log places Dunn off-site at 18:40, which contradicts the originating tip's account of who was present at the 09 Jan vote.",
        tags: ['EV-0091', 'TIP-4402', 'potentially exculpatory'],
      },
      {
        id: 'finding-2',
        text: 'Vendor invoice 8812 predates the award vote by 11 days. No record in the case explains the sequence.',
        tags: ['DE-1183', 'MIN-0221'],
      },
      {
        id: 'finding-3',
        text: "Two elements of § 666 remain unsupported by any record: the federal-funds threshold and the agency's benefit year.",
        tags: ['ELEM-666', 'gap in proof'],
      },
    ],
    humanOnly: [
      {
        id: 'human-1',
        label: 'Accept finding 1 as potentially exculpatory and route to the prosecution team',
        assignee: 'AUSA Feld',
      },
      {
        id: 'human-2',
        label: 'Elevate Osei from person of interest to subject — requires written factual basis',
        assignee: 'SSA Halloway',
      },
      {
        id: 'human-3',
        label: 'Approve the drafted warrant affidavit — the assistant cannot find probable cause',
        assignee: 'SSA Halloway',
      },
    ],
  },
  rail: {
    techniques: [
      { id: 'tech-surveillance', label: 'Physical surveillance', ok: true },
      { id: 'tech-gj', label: 'Grand jury subpoena', ok: true },
      { id: 'tech-pen', label: 'Pen register', ok: true },
      { id: 'tech-cs', label: 'Confidential source tasking', ok: true },
      { id: 'tech-uc', label: 'Undercover, once approved', ok: true },
      { id: 'tech-t3', label: 'Title III intercept — blocked', ok: false },
    ],
    access: [
      { id: 'access-federal', label: 'Federal · FBI' },
      { id: 'access-local', label: 'Local' },
      { id: 'access-crim', label: 'Crim-intel' },
    ],
  },
};

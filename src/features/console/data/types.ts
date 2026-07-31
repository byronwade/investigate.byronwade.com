export type CaseId = string;

export type CaseRecord = {
  id: CaseId;
  number: string;
  title: string;
  status: 'open' | 'closed';
  openedLabel: string;
  assigneesLabel: string;
  reviewDueLabel: string;
};

export type PersonRecord = {
  id: string;
  caseId: CaseId;
  name: string;
  role: 'subject' | 'witness' | 'poi' | 'other';
  notes: string;
  contradictionCount: number;
};

export type EvidenceRecord = {
  id: string;
  caseId: CaseId;
  label: string;
  kind: string;
  custody: 'sealed' | 'lab' | 'checked-out' | 'intake';
};

export type LeadRecord = {
  id: string;
  caseId: CaseId;
  title: string;
  column: 'triage' | 'active' | 'blocked' | 'done';
  owner: string;
};

export type TimelineEventRecord = {
  id: string;
  caseId: CaseId;
  atLabel: string;
  kind: string;
  summary: string;
};

export type AssistantStep = {
  id: string;
  label: string;
  state: 'done' | 'denied' | 'running' | 'pending';
  durationLabel?: string;
};

export type OverviewModel = {
  case: CaseRecord;
  assistant: {
    durationLabel: string;
    runLabel: string;
    steps: AssistantStep[];
    findings: { id: string; text: string; tags: string[] }[];
    humanOnly: { id: string; label: string; assignee: string }[];
  };
  rail: {
    techniques: { id: string; label: string; ok: boolean }[];
    access: { id: string; label: string }[];
  };
};

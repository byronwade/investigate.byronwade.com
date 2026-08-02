import type { StatusDotTone } from '#/features/console/ui/status-dot';

export type WorkspaceRow = {
  id: string;
  primary: string;
  secondary: string;
  meta?: string;
  due?: string;
  tone?: StatusDotTone;
  href?: string;
};

export type WorkspaceSection = {
  id: string;
  title: string;
  hint?: string;
  rows: WorkspaceRow[];
};

export type WorkspacePageModel = {
  slug: string;
  title: string;
  description?: string;
  crumb: string;
  meta?: string;
  sections: WorkspaceSection[];
};

export type CommandCenterModel = {
  greeting: string;
  summary: string[];
  waiting: WorkspaceSection;
  overnight: WorkspaceSection;
  attention: WorkspaceSection;
};

export type MediaWorkbenchModel = {
  slug: string;
  title: string;
  crumb: string;
  description: string;
  assetLabel: string;
  statusLabel: string;
  tracks: { id: string; label: string; detail: string }[];
  notes: { id: string; at: string; text: string }[];
};

export type PortfolioCase = {
  id: string;
  number: string;
  title: string;
  status: string;
  squad: string;
  openedLabel: string;
  href: string;
};

export type IntakeQueueItem = {
  id: string;
  tipId: string;
  summary: string;
  classification: string;
  priority: string;
  tone: StatusDotTone;
  owner: 'mine' | 'unassigned' | 'squad';
  submittedLabel: string;
  extractedFields: { label: string; value: string }[];
};

export type IntakeModel = {
  title: string;
  description: string;
  meta: string;
  queue: IntakeQueueItem[];
  selectedId: string;
};

export type PlanHypothesis = {
  id: string;
  code: string;
  title: string;
  statement: string;
  status: string;
  tone: StatusDotTone;
  supports: string[];
  contradicts: string[];
};

export type PlanStep = {
  id: string;
  label: string;
  owner: string;
  due?: string;
  tone?: StatusDotTone;
};

export type InvestigativePlanModel = {
  title: string;
  description: string;
  objective: string;
  hypotheses: PlanHypothesis[];
  steps: PlanStep[];
};

export type SearchHit = {
  id: string;
  kind: string;
  title: string;
  snippet: string;
  provenance: string;
  href?: string;
  tone?: StatusDotTone;
  clearanceHidden?: boolean;
};

export type SearchModel = {
  title: string;
  description: string;
  query: string;
  visibleCount: number;
  hiddenCount: number;
  filters: string[];
  hits: SearchHit[];
};

export type IntelligencePackage = {
  id: string;
  title: string;
  summary: string;
  lane: string;
  status: string;
  tone: StatusDotTone;
  entities: string[];
  accessNote: string;
  href?: string;
};

export type IntelligenceModel = {
  title: string;
  description: string;
  meta: string;
  packages: IntelligencePackage[];
  selectedId: string;
};

export type IncidentPin = {
  id: string;
  label: string;
  summary: string;
  coords: string;
  when: string;
  tone: StatusDotTone;
  href?: string;
};

export type IncidentsModel = {
  title: string;
  description: string;
  meta: string;
  pins: IncidentPin[];
  selectedId: string;
};

export type DirectoryEntry = {
  id: string;
  title: string;
  summary: string;
  kind: string;
  status: string;
  tone: StatusDotTone;
  href?: string;
  meta?: string;
};

export type DirectoryModel = {
  title: string;
  description: string;
  meta: string;
  filters: string[];
  entries: DirectoryEntry[];
};

export type ProsecutionPacket = {
  id: string;
  title: string;
  summary: string;
  owner: string;
  status: string;
  tone: StatusDotTone;
  bradyOpen: number;
  href?: string;
};

export type ProsecutionModel = {
  title: string;
  description: string;
  meta: string;
  packets: ProsecutionPacket[];
};

export type AnalysisItem = {
  id: string;
  label: string;
  detail: string;
  tone?: StatusDotTone;
};

export type AnalysisColumn = {
  id: string;
  title: string;
  items: AnalysisItem[];
};

export type AnalysisBoardModel = {
  title: string;
  description: string;
  columns: AnalysisColumn[];
};

export type TranscriptLine = {
  id: string;
  at: string;
  speaker: string;
  text: string;
  marker?: string;
  tone?: StatusDotTone;
};

export type InterviewTranscriptModel = {
  title: string;
  description: string;
  subject: string;
  meta: string;
  lines: TranscriptLine[];
};

export type LegalProcessItem = {
  id: string;
  title: string;
  summary: string;
  kind: string;
  status: string;
  tone: StatusDotTone;
  due?: string;
};

export type LegalProcessModel = {
  title: string;
  description: string;
  meta: string;
  items: LegalProcessItem[];
};

export type ApprovalItem = {
  id: string;
  title: string;
  summary: string;
  requester: string;
  due: string;
  tone: StatusDotTone;
  decisionNote: string;
};

export type ApprovalsModel = {
  title: string;
  description: string;
  meta: string;
  items: ApprovalItem[];
};

export type SceneLayer = {
  id: string;
  title: string;
  summary: string;
  status: string;
  tone: StatusDotTone;
};

export type SceneDiagramModel = {
  title: string;
  description: string;
  location: string;
  meta: string;
  layers: SceneLayer[];
  anchors: { id: string; label: string; note: string }[];
};

export type ReportMetric = {
  id: string;
  label: string;
  value: string;
  detail: string;
  tone: StatusDotTone;
};

export type ReportsModel = {
  title: string;
  description: string;
  meta: string;
  metrics: ReportMetric[];
  notes: DirectoryEntry[];
};

export type LocalModeModel = {
  title: string;
  description: string;
  meta: string;
  networkLabel: string;
  networkTone: StatusDotTone;
  lastSync: string;
  queue: DirectoryEntry[];
};

export type DocsPrinciple = {
  id: string;
  title: string;
  summary: string;
  detail: string;
  tone: StatusDotTone;
};

export type DocsPageModel = {
  title: string;
  description: string;
  meta: string;
  principles: DocsPrinciple[];
};

export type CaseQueueItem = {
  id: string;
  title: string;
  summary: string;
  kind: string;
  status: string;
  tone: StatusDotTone;
  href?: string;
  due?: string;
};

export type CaseQueueModel = {
  title: string;
  description: string;
  meta: string;
  items: CaseQueueItem[];
};

export type ClosureCheckItem = {
  id: string;
  title: string;
  summary: string;
  status: string;
  tone: StatusDotTone;
  complete: boolean;
};

export type ClosureModel = {
  title: string;
  description: string;
  meta: string;
  items: ClosureCheckItem[];
};

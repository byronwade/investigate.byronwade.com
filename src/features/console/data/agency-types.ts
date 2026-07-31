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

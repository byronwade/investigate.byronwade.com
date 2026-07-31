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

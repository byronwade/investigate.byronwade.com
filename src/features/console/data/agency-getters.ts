import {
  caseWorkspacePages,
  commandCenter,
  mediaWorkbenches,
  portfolioCases,
  workspacePages,
} from './agency';
import type {
  CommandCenterModel,
  MediaWorkbenchModel,
  PortfolioCase,
  WorkspacePageModel,
} from './agency-types';
import { getCase, listPeople } from './getters';
import type { CaseId, PersonRecord } from './types';

export function getCommandCenter(): CommandCenterModel {
  return commandCenter;
}

export function listPortfolioCases(): PortfolioCase[] {
  return portfolioCases;
}

export function getWorkspacePage(slug: string): WorkspacePageModel | null {
  return workspacePages[slug] ?? null;
}

export function getCaseWorkspacePage(caseId: CaseId, slug: string): WorkspacePageModel | null {
  if (!getCase(caseId)) {
    return null;
  }
  return caseWorkspacePages[slug] ?? null;
}

export function getMediaWorkbench(slug: string): MediaWorkbenchModel | null {
  return mediaWorkbenches[slug] ?? null;
}

export function getPerson(caseId: CaseId, personId: string): PersonRecord | null {
  return listPeople(caseId).find((person) => person.id === personId) ?? null;
}

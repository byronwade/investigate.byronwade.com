import {
  administrationModel,
  analysisBoard,
  approvalsModel,
  caseWorkspacePages,
  closureModel,
  commandCenter,
  courtProductionModel,
  digitalEvidenceQueue,
  discoveryQueue,
  forensicsQueue,
  foundationsDocs,
  handoffModel,
  incidentsModel,
  intakeModel,
  intelligenceModel,
  interviewsIndexModel,
  interviewTranscript,
  investigativePlan,
  legalProcess,
  localModeModel,
  mediaWorkbenches,
  motionDocs,
  oversightModel,
  peopleOrgsModel,
  portfolioCases,
  prosecutionModel,
  recordsModel,
  reportsModel,
  sceneDiagram,
  scenesIndexModel,
  searchModel,
  workspacePages,
} from './agency';
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

export function getIntake(): IntakeModel {
  return intakeModel;
}

export function getInvestigativePlan(caseId: CaseId): InvestigativePlanModel | null {
  if (!getCase(caseId)) {
    return null;
  }
  return investigativePlan;
}

export function getSearch(): SearchModel {
  return searchModel;
}

export function getIntelligence(): IntelligenceModel {
  return intelligenceModel;
}

export function getIncidents(): IncidentsModel {
  return incidentsModel;
}

export function getInterviewsIndex(): DirectoryModel {
  return interviewsIndexModel;
}

export function getPeopleOrgs(): DirectoryModel {
  return peopleOrgsModel;
}

export function getScenesIndex(): DirectoryModel {
  return scenesIndexModel;
}

export function getProsecution(): ProsecutionModel {
  return prosecutionModel;
}

export function getAnalysisBoard(caseId: CaseId): AnalysisBoardModel | null {
  if (!getCase(caseId)) {
    return null;
  }
  return analysisBoard;
}

export function getInterviewTranscript(caseId: CaseId): InterviewTranscriptModel | null {
  if (!getCase(caseId)) {
    return null;
  }
  return interviewTranscript;
}

export function getLegalProcess(caseId: CaseId): LegalProcessModel | null {
  if (!getCase(caseId)) {
    return null;
  }
  return legalProcess;
}

export function getApprovals(caseId: CaseId): ApprovalsModel | null {
  if (!getCase(caseId)) {
    return null;
  }
  return approvalsModel;
}

export function getSceneDiagram(caseId: CaseId): SceneDiagramModel | null {
  if (!getCase(caseId)) {
    return null;
  }
  return sceneDiagram;
}

export function getReports(): ReportsModel {
  return reportsModel;
}

export function getOversight(): DirectoryModel {
  return oversightModel;
}

export function getRecords(): DirectoryModel {
  return recordsModel;
}

export function getAdministration(): DirectoryModel {
  return administrationModel;
}

export function getLocalMode(): LocalModeModel {
  return localModeModel;
}

export function getHandoff(): DirectoryModel {
  return handoffModel;
}

export function getCourtProduction(): DirectoryModel {
  return courtProductionModel;
}

export function getFoundationsDocs(): DocsPageModel {
  return foundationsDocs;
}

export function getMotionDocs(): DocsPageModel {
  return motionDocs;
}

export function getDigitalEvidence(caseId: CaseId): CaseQueueModel | null {
  if (!getCase(caseId)) {
    return null;
  }
  return digitalEvidenceQueue;
}

export function getForensics(caseId: CaseId): CaseQueueModel | null {
  if (!getCase(caseId)) {
    return null;
  }
  return forensicsQueue;
}

export function getDiscovery(caseId: CaseId): CaseQueueModel | null {
  if (!getCase(caseId)) {
    return null;
  }
  return discoveryQueue;
}

export function getClosure(caseId: CaseId): ClosureModel | null {
  if (!getCase(caseId)) {
    return null;
  }
  return closureModel;
}

import {
  NORTHRIDGE_CASE_ID,
  northridgeCase,
  northridgeEvidence,
  northridgeLeads,
  northridgeOverview,
  northridgePeople,
  northridgeTimeline,
} from './northridge';
import type {
  CaseId,
  CaseRecord,
  EvidenceRecord,
  LeadRecord,
  OverviewModel,
  PersonRecord,
  TimelineEventRecord,
} from './types';

export const DEFAULT_CASE_ID = NORTHRIDGE_CASE_ID;

export function getCase(caseId: CaseId): CaseRecord | null {
  if (caseId === NORTHRIDGE_CASE_ID) {
    return northridgeCase;
  }
  return null;
}

export function listPeople(caseId: CaseId): PersonRecord[] {
  return northridgePeople.filter((person) => person.caseId === caseId);
}

export function listEvidence(caseId: CaseId): EvidenceRecord[] {
  return northridgeEvidence.filter((item) => item.caseId === caseId);
}

export function listLeads(caseId: CaseId): LeadRecord[] {
  return northridgeLeads.filter((lead) => lead.caseId === caseId);
}

export function listTimeline(caseId: CaseId): TimelineEventRecord[] {
  return northridgeTimeline.filter((event) => event.caseId === caseId);
}

export function getOverview(caseId: CaseId): OverviewModel | null {
  if (caseId === NORTHRIDGE_CASE_ID) {
    return northridgeOverview;
  }
  return null;
}

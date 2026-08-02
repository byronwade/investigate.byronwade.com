import { describe, expect, it } from 'vitest';

import {
  getAdministration,
  getAnalysisBoard,
  getApprovals,
  getCaseWorkspacePage,
  getClosure,
  getCommandCenter,
  getCourtProduction,
  getDigitalEvidence,
  getDiscovery,
  getForensics,
  getFoundationsDocs,
  getHandoff,
  getIncidents,
  getIntake,
  getIntelligence,
  getInterviewsIndex,
  getInterviewTranscript,
  getInvestigativePlan,
  getLegalProcess,
  getLocalMode,
  getMediaWorkbench,
  getMotionDocs,
  getOversight,
  getPeopleOrgs,
  getPerson,
  getProsecution,
  getRecords,
  getReports,
  getSceneDiagram,
  getScenesIndex,
  getSearch,
  getWorkspacePage,
  listPortfolioCases,
} from './agency-getters';
import { DEFAULT_CASE_ID } from './getters';

describe('agency getters', () => {
  it('returns command center queue fixtures', () => {
    const model = getCommandCenter();
    expect(model.greeting).toMatch(/Dayo/);
    expect(model.waiting.rows.length).toBeGreaterThan(0);
  });

  it('lists portfolio cases with per-case overview hrefs', () => {
    const cases = listPortfolioCases();
    expect(cases.some((item) => item.id === DEFAULT_CASE_ID)).toBe(true);
    const halstead = cases.find((item) => item.id === 'halstead');
    expect(halstead?.href).toBe('/console/cases/halstead/overview');
  });

  it('loads workspace and media pages by slug', () => {
    expect(getWorkspacePage('intake')?.title).toMatch(/Intake/);
    expect(getMediaWorkbench('video-review')?.title).toMatch(/Video/);
  });

  it('loads case workspace pages only for known cases', () => {
    expect(getCaseWorkspacePage(DEFAULT_CASE_ID, 'plan')?.title).toMatch(/plan/i);
    expect(getCaseWorkspacePage('missing', 'plan')).toBeNull();
  });

  it('loads dedicated intake, plan, and search fixtures', () => {
    expect(getIntake().queue.length).toBeGreaterThan(2);
    expect(getInvestigativePlan(DEFAULT_CASE_ID)?.hypotheses.length).toBeGreaterThan(0);
    expect(getInvestigativePlan('missing')).toBeNull();
    expect(getSearch().hits.some((hit) => hit.clearanceHidden)).toBe(true);
  });

  it('loads composed agency product fixtures', () => {
    expect(getIntelligence().packages.length).toBeGreaterThan(1);
    expect(getIncidents().pins.length).toBeGreaterThan(1);
    expect(getInterviewsIndex().entries.length).toBeGreaterThan(1);
    expect(getPeopleOrgs().entries.some((entry) => entry.kind === 'Org')).toBe(true);
    expect(getScenesIndex().entries[0]?.href).toContain('/scene');
    expect(getProsecution().packets.some((packet) => packet.bradyOpen > 0)).toBe(true);
    expect(getReports().metrics.length).toBeGreaterThan(3);
    expect(getOversight().entries.length).toBeGreaterThan(1);
    expect(getRecords().entries.length).toBeGreaterThan(1);
    expect(getAdministration().entries.length).toBeGreaterThan(1);
    expect(getLocalMode().queue.length).toBeGreaterThan(1);
    expect(getHandoff().entries.length).toBeGreaterThan(0);
    expect(getCourtProduction().entries.length).toBeGreaterThan(0);
    expect(getFoundationsDocs().principles.length).toBeGreaterThan(1);
    expect(getMotionDocs().principles.length).toBeGreaterThan(1);
  });

  it('loads composed case product fixtures only for known cases', () => {
    expect(getAnalysisBoard(DEFAULT_CASE_ID)?.columns.length).toBe(3);
    expect(getInterviewTranscript(DEFAULT_CASE_ID)?.lines.length).toBeGreaterThan(2);
    expect(getLegalProcess(DEFAULT_CASE_ID)?.items.length).toBeGreaterThan(2);
    expect(getApprovals(DEFAULT_CASE_ID)?.items.length).toBeGreaterThan(0);
    expect(getSceneDiagram(DEFAULT_CASE_ID)?.layers.length).toBeGreaterThan(1);
    expect(getDigitalEvidence(DEFAULT_CASE_ID)?.items.length).toBeGreaterThan(1);
    expect(getForensics(DEFAULT_CASE_ID)?.items.length).toBeGreaterThan(0);
    expect(getDiscovery(DEFAULT_CASE_ID)?.items.length).toBeGreaterThan(1);
    expect(getClosure(DEFAULT_CASE_ID)?.items.some((item) => !item.complete)).toBe(true);
    expect(getAnalysisBoard('missing')).toBeNull();
    expect(getSceneDiagram('missing')).toBeNull();
    expect(getClosure('missing')).toBeNull();
  });

  it('resolves northridge people', () => {
    expect(getPerson(DEFAULT_CASE_ID, 'person-vance')?.name).toMatch(/Vance/);
    expect(getPerson(DEFAULT_CASE_ID, 'missing')).toBeNull();
  });
});

import { describe, expect, it } from 'vitest';

import {
  getCaseWorkspacePage,
  getCommandCenter,
  getIntake,
  getInvestigativePlan,
  getMediaWorkbench,
  getPerson,
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

  it('resolves northridge people', () => {
    expect(getPerson(DEFAULT_CASE_ID, 'person-vance')?.name).toMatch(/Vance/);
    expect(getPerson(DEFAULT_CASE_ID, 'missing')).toBeNull();
  });
});

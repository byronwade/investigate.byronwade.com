import { describe, expect, it } from 'vitest';
import {
  DEFAULT_CASE_ID,
  getCase,
  getOverview,
  listEvidence,
  listLeads,
  listPeople,
  listTimeline,
} from './getters';

describe('console case getters', () => {
  it('returns the default Northridge case', () => {
    const c = getCase(DEFAULT_CASE_ID);
    expect(c?.number).toBe('245D-CG-3881127');
    expect(c?.title).toMatch(/Northridge/i);
  });

  it('returns null for unknown cases', () => {
    expect(getCase('missing')).toBeNull();
    expect(getOverview('missing')).toBeNull();
  });

  it('lists non-empty related collections for Northridge', () => {
    expect(listPeople(DEFAULT_CASE_ID).length).toBeGreaterThan(0);
    expect(listEvidence(DEFAULT_CASE_ID).length).toBeGreaterThan(0);
    expect(listLeads(DEFAULT_CASE_ID).length).toBeGreaterThan(0);
    expect(listTimeline(DEFAULT_CASE_ID).length).toBeGreaterThan(0);
    expect(getOverview(DEFAULT_CASE_ID)?.assistant.steps.length).toBeGreaterThan(0);
  });
});

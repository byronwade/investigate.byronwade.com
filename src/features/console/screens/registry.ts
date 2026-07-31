export type ConsoleScreenMeta = {
  slug: string;
  title: string;
  paperId: string;
  group: 'case' | 'workspace' | 'media' | 'system' | 'foundations';
};

/** All Investigation Console desk screens from the Paper file (excludes ZZ · NOT THIS PROJECT). */
export const consoleScreens: readonly ConsoleScreenMeta[] = [
  { slug: 'case-overview', title: '01 · Case overview', paperId: '1-0', group: 'case' },
  { slug: 'case-timeline', title: '02 · Case timeline', paperId: 'QO-0', group: 'case' },
  { slug: 'command-center', title: '03 · Command center', paperId: '10Y-0', group: 'workspace' },
  { slug: 'evidence-custody', title: '04 · Evidence & custody', paperId: '163-0', group: 'case' },
  { slug: 'intake-triage', title: '05 · Intake & triage', paperId: '1B8-0', group: 'workspace' },
  { slug: 'intelligence', title: '06 · Intelligence', paperId: 'VT-0', group: 'workspace' },
  { slug: 'analysis-board', title: '07 · Analysis board', paperId: '3C4-0', group: 'case' },
  {
    slug: 'reports-statistics',
    title: '08 · Reports & statistics',
    paperId: '42H-0',
    group: 'workspace',
  },
  { slug: 'leads-board', title: '09 · Leads board', paperId: '4I8-0', group: 'case' },
  { slug: 'scene-diagram', title: '10 · Scene diagram', paperId: '560-0', group: 'case' },
  { slug: 'legal-process', title: '11 · Legal process', paperId: '5H7-0', group: 'case' },
  {
    slug: 'interview-transcript',
    title: '12 · Interview transcript',
    paperId: '5SC-0',
    group: 'case',
  },
  { slug: 'digital-evidence', title: '13 · Digital evidence', paperId: '64Q-0', group: 'case' },
  {
    slug: 'oversight-audit',
    title: '14 · Oversight & audit',
    paperId: '6HS-0',
    group: 'workspace',
  },
  { slug: 'person-profile', title: '15 · Person profile', paperId: '6W0-0', group: 'case' },
  {
    slug: 'records-retention',
    title: '16 · Records & retention',
    paperId: '7K4-0',
    group: 'workspace',
  },
  { slug: 'incidents-map', title: '17 · Incidents map', paperId: '7XH-0', group: 'workspace' },
  { slug: 'people-orgs', title: '18 · People & orgs', paperId: '8CG-0', group: 'workspace' },
  { slug: 'investigative-plan', title: '19 · Investigative plan', paperId: '8TO-0', group: 'case' },
  { slug: 'forensics', title: '20 · Forensics', paperId: '9CG-0', group: 'case' },
  {
    slug: 'discovery-disclosure',
    title: '21 · Discovery & disclosure',
    paperId: '9T6-0',
    group: 'case',
  },
  { slug: 'approvals', title: '22 · Approvals', paperId: 'A86-0', group: 'case' },
  { slug: 'prosecution', title: '23 · Prosecution', paperId: 'AM2-0', group: 'workspace' },
  { slug: 'administration', title: '24 · Administration', paperId: 'B1A-0', group: 'system' },
  { slug: 'command-palette', title: '25 · Command palette', paperId: 'BHE-0', group: 'system' },
  { slug: 'local-mode', title: '26 · Local mode', paperId: 'BUX-0', group: 'system' },
  { slug: 'cases-portfolio', title: '27 · Cases portfolio', paperId: 'CDB-0', group: 'workspace' },
  { slug: 'scenes-index', title: '28 · Scenes index', paperId: 'CVA-0', group: 'workspace' },
  {
    slug: 'interviews-index',
    title: '29 · Interviews index',
    paperId: 'DAL-0',
    group: 'workspace',
  },
  { slug: 'empty-states', title: '30 · Empty states', paperId: 'DTQ-0', group: 'system' },
  { slug: 'case-closure', title: '31 · Case closure', paperId: 'EBA-0', group: 'case' },
  { slug: 'foundations', title: '32 · Foundations', paperId: 'EM9-0', group: 'foundations' },
  { slug: 'handoff', title: '33 · Handoff', paperId: 'FDM-0', group: 'system' },
  { slug: 'search-results', title: '34 · Search results', paperId: 'FU0-0', group: 'system' },
  { slug: 'court-production', title: '35 · Court production', paperId: 'G7L-0', group: 'system' },
  { slug: 'field-capture', title: '36 · Field capture', paperId: 'GKV-0', group: 'media' },
  {
    slug: 'motion-spec',
    title: '37 · Motion & interaction',
    paperId: 'GS6-0',
    group: 'foundations',
  },
  { slug: 'video-review', title: '38 · Video review', paperId: 'H08-0', group: 'media' },
  { slug: 'audio-examination', title: '39 · Audio examination', paperId: 'HKE-0', group: 'media' },
  { slug: 'photo-canvas', title: '40 · Photo canvas', paperId: 'I7V-0', group: 'media' },
] as const;

export const consoleScreenSlugs = consoleScreens.map((screen) => screen.slug);

export function getConsoleScreen(slug: string): ConsoleScreenMeta | undefined {
  return consoleScreens.find((screen) => screen.slug === slug);
}

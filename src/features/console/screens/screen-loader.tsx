import { Link } from '@tanstack/react-router';
import type { ComponentType } from 'react';
import { lazy, Suspense } from 'react';
import { getConsoleScreen } from './registry';

type ScreenModule = { default?: ComponentType; [key: string]: ComponentType | undefined };

const screenImporters: Record<string, () => Promise<ScreenModule>> = {
  'case-overview': () => import('./paper/case-overview'),
  'case-timeline': () => import('./paper/case-timeline'),
  'command-center': () => import('./paper/command-center'),
  'evidence-custody': () => import('./paper/evidence-custody'),
  'intake-triage': () => import('./paper/intake-triage'),
  intelligence: () => import('./paper/intelligence'),
  'analysis-board': () => import('./paper/analysis-board'),
  'reports-statistics': () => import('./paper/reports-statistics'),
  'leads-board': () => import('./paper/leads-board'),
  'scene-diagram': () => import('./paper/scene-diagram'),
  'legal-process': () => import('./paper/legal-process'),
  'interview-transcript': () => import('./paper/interview-transcript'),
  'digital-evidence': () => import('./paper/digital-evidence'),
  'oversight-audit': () => import('./paper/oversight-audit'),
  'person-profile': () => import('./paper/person-profile'),
  'records-retention': () => import('./paper/records-retention'),
  'incidents-map': () => import('./paper/incidents-map'),
  'people-orgs': () => import('./paper/people-orgs'),
  'investigative-plan': () => import('./paper/investigative-plan'),
  forensics: () => import('./paper/forensics'),
  'discovery-disclosure': () => import('./paper/discovery-disclosure'),
  approvals: () => import('./paper/approvals'),
  prosecution: () => import('./paper/prosecution'),
  administration: () => import('./paper/administration'),
  'command-palette': () => import('./paper/command-palette'),
  'local-mode': () => import('./paper/local-mode'),
  'cases-portfolio': () => import('./paper/cases-portfolio'),
  'scenes-index': () => import('./paper/scenes-index'),
  'interviews-index': () => import('./paper/interviews-index'),
  'empty-states': () => import('./paper/empty-states'),
  'case-closure': () => import('./paper/case-closure'),
  foundations: () => import('./paper/foundations'),
  handoff: () => import('./paper/handoff'),
  'search-results': () => import('./paper/search-results'),
  'court-production': () => import('./paper/court-production'),
  'field-capture': () => import('./paper/field-capture'),
  'motion-spec': () => import('./paper/motion-spec'),
  'video-review': () => import('./paper/video-review'),
  'audio-examination': () => import('./paper/audio-examination'),
  'photo-canvas': () => import('./paper/photo-canvas'),
};

function toExportName(slug: string): string {
  return `${slug
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')}Screen`;
}

function loadScreen(slug: string) {
  const importer = screenImporters[slug];
  if (!importer) {
    return null;
  }

  return lazy(async () => {
    const mod = await importer();
    const named = mod[toExportName(slug)];
    const Component = named ?? mod.default;
    if (!Component) {
      throw new Error(`Screen module for "${slug}" has no export`);
    }
    return { default: Component };
  });
}

function ScreenPending({ title }: { title: string }) {
  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#FFFFFF',
        color: '#6B6B6B',
        fontFamily: 'var(--console-font-sans)',
        fontSize: 13,
      }}
    >
      <output aria-live="polite">Loading {title}…</output>
    </div>
  );
}

function ScreenMissing({ slug }: { slug: string }) {
  const meta = getConsoleScreen(slug);
  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        gap: 12,
        padding: 40,
        background: '#FFFFFF',
        color: '#111111',
        fontFamily: 'var(--console-font-sans)',
      }}
    >
      <p
        style={{
          margin: 0,
          color: '#6B6B6B',
          fontFamily: 'var(--console-font-mono)',
          fontSize: 11,
          letterSpacing: '0.06em',
        }}
      >
        SCREEN NOT YET MIGRATED
      </p>
      <h1 style={{ margin: 0, fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em' }}>
        {meta?.title ?? slug}
      </h1>
      <p style={{ margin: 0, maxWidth: 420, color: '#3D3D3D', fontSize: 14, lineHeight: '20px' }}>
        This Paper artboard is registered in the console catalog. The exact visual export is still
        being written to{' '}
        <code style={{ fontFamily: 'var(--console-font-mono)' }}>
          src/features/console/screens/paper/{slug}.tsx
        </code>
        .
      </p>
      <p style={{ margin: 0 }}>
        <Link
          to="/console/reference"
          style={{
            color: '#111111',
            fontSize: 13,
            fontWeight: 500,
            textDecoration: 'underline',
            textDecorationColor: '#ECECEC',
            textUnderlineOffset: 4,
          }}
        >
          Back to Paper reference gallery
        </Link>
      </p>
    </div>
  );
}

export function ConsoleScreenLoader({ slug }: { slug: string }) {
  const meta = getConsoleScreen(slug);
  const LazyScreen = loadScreen(slug);

  if (!meta || !LazyScreen) {
    return <ScreenMissing slug={slug} />;
  }

  return (
    <Suspense fallback={<ScreenPending title={meta.title} />}>
      <LazyScreen />
    </Suspense>
  );
}

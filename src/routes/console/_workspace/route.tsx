import { createFileRoute, Outlet, useRouterState } from '@tanstack/react-router';

import { getMediaWorkbench, getWorkspacePage } from '#/features/console/data';
import { AgencyShell } from '#/features/console/shell/agency-shell';

const CRUMB_BY_PATH: Record<string, string> = {
  '/console/command-center': 'Command center',
  '/console/intake': 'Intake',
  '/console/intelligence': 'Intelligence',
  '/console/reports': 'Reports',
  '/console/oversight': 'Oversight',
  '/console/records': 'Records',
  '/console/incidents': 'Incidents',
  '/console/people-orgs': 'People & orgs',
  '/console/prosecution': 'Prosecution',
  '/console/cases': 'Cases',
  '/console/scenes': 'Scenes',
  '/console/interviews': 'Interviews',
  '/console/administration': 'Administration',
  '/console/local-mode': 'Local mode',
  '/console/empty-states': 'Empty states',
  '/console/handoff': 'Handoff',
  '/console/search': 'Search',
  '/console/court-production': 'Court production',
  '/console/foundations': 'Foundations',
  '/console/motion': 'Motion',
  '/console/media/field-capture': 'Field capture',
  '/console/media/video-review': 'Video review',
  '/console/media/audio-examination': 'Audio examination',
  '/console/media/photo-canvas': 'Photo canvas',
};

export const Route = createFileRoute('/console/_workspace')({
  component: WorkspaceLayout,
});

function WorkspaceLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const crumb =
    CRUMB_BY_PATH[pathname] ??
    getWorkspacePage(pathname.split('/').pop() ?? '')?.crumb ??
    getMediaWorkbench(pathname.split('/').pop() ?? '')?.crumb ??
    'Workspace';

  return (
    <AgencyShell crumb={crumb}>
      <Outlet />
    </AgencyShell>
  );
}

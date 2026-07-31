import { createFileRoute, notFound } from '@tanstack/react-router';

import { getWorkspacePage } from '#/features/console/data';
import { WorkspacePage } from '#/features/console/pages/workspace-page';

export const Route = createFileRoute('/console/_workspace/reports')({
  component: Page,
  head: () => {
    const model = getWorkspacePage('reports');
    return {
      meta: [{ title: `${model?.title ?? 'reports'} · Investigation Console` }],
    };
  },
});

function Page() {
  const model = getWorkspacePage('reports');
  if (!model) {
    throw notFound();
  }
  return <WorkspacePage model={model} />;
}

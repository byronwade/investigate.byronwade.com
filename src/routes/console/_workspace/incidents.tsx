import { createFileRoute, notFound } from '@tanstack/react-router';

import { getWorkspacePage } from '#/features/console/data';
import { WorkspacePage } from '#/features/console/pages/workspace-page';

export const Route = createFileRoute('/console/_workspace/incidents')({
  component: Page,
  head: () => {
    const model = getWorkspacePage('incidents');
    return {
      meta: [{ title: `${model?.title ?? 'incidents'} · Investigation Console` }],
    };
  },
});

function Page() {
  const model = getWorkspacePage('incidents');
  if (!model) {
    throw notFound();
  }
  return <WorkspacePage model={model} />;
}

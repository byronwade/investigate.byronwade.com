import { createFileRoute, notFound } from '@tanstack/react-router';

import { getWorkspacePage } from '#/features/console/data';
import { WorkspacePage } from '#/features/console/pages/workspace-page';

export const Route = createFileRoute('/console/_workspace/empty-states')({
  component: Page,
  head: () => {
    const model = getWorkspacePage('empty-states');
    return {
      meta: [{ title: `${model?.title ?? 'empty-states'} · Investigation Console` }],
    };
  },
});

function Page() {
  const model = getWorkspacePage('empty-states');
  if (!model) {
    throw notFound();
  }
  return <WorkspacePage model={model} />;
}

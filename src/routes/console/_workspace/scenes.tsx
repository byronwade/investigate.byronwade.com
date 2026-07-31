import { createFileRoute, notFound } from '@tanstack/react-router';

import { getWorkspacePage } from '#/features/console/data';
import { WorkspacePage } from '#/features/console/pages/workspace-page';

export const Route = createFileRoute('/console/_workspace/scenes')({
  component: Page,
  head: () => {
    const model = getWorkspacePage('scenes');
    return {
      meta: [{ title: `${model?.title ?? 'scenes'} · Investigation Console` }],
    };
  },
});

function Page() {
  const model = getWorkspacePage('scenes');
  if (!model) {
    throw notFound();
  }
  return <WorkspacePage model={model} />;
}

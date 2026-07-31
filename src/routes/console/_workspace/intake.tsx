import { createFileRoute, notFound } from '@tanstack/react-router';

import { getWorkspacePage } from '#/features/console/data';
import { WorkspacePage } from '#/features/console/pages/workspace-page';

export const Route = createFileRoute('/console/_workspace/intake')({
  component: Page,
  head: () => {
    const model = getWorkspacePage('intake');
    return {
      meta: [{ title: `${model?.title ?? 'intake'} · Investigation Console` }],
    };
  },
});

function Page() {
  const model = getWorkspacePage('intake');
  if (!model) {
    throw notFound();
  }
  return <WorkspacePage model={model} />;
}

import { createFileRoute, notFound } from '@tanstack/react-router';

import { getWorkspacePage } from '#/features/console/data';
import { WorkspacePage } from '#/features/console/pages/workspace-page';

export const Route = createFileRoute('/console/_workspace/search')({
  component: Page,
  head: () => {
    const model = getWorkspacePage('search');
    return {
      meta: [{ title: `${model?.title ?? 'search'} · Investigation Console` }],
    };
  },
});

function Page() {
  const model = getWorkspacePage('search');
  if (!model) {
    throw notFound();
  }
  return <WorkspacePage model={model} />;
}

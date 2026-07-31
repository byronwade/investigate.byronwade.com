import { createFileRoute, notFound } from '@tanstack/react-router';

import { getWorkspacePage } from '#/features/console/data';
import { WorkspacePage } from '#/features/console/pages/workspace-page';

export const Route = createFileRoute('/console/_workspace/foundations')({
  component: Page,
  head: () => {
    const model = getWorkspacePage('foundations');
    return {
      meta: [{ title: `${model?.title ?? 'foundations'} · Investigation Console` }],
    };
  },
});

function Page() {
  const model = getWorkspacePage('foundations');
  if (!model) {
    throw notFound();
  }
  return <WorkspacePage model={model} />;
}

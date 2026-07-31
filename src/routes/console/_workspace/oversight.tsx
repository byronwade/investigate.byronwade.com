import { createFileRoute, notFound } from '@tanstack/react-router';

import { getWorkspacePage } from '#/features/console/data';
import { WorkspacePage } from '#/features/console/pages/workspace-page';

export const Route = createFileRoute('/console/_workspace/oversight')({
  component: Page,
  head: () => {
    const model = getWorkspacePage('oversight');
    return {
      meta: [{ title: `${model?.title ?? 'oversight'} · Investigation Console` }],
    };
  },
});

function Page() {
  const model = getWorkspacePage('oversight');
  if (!model) {
    throw notFound();
  }
  return <WorkspacePage model={model} />;
}

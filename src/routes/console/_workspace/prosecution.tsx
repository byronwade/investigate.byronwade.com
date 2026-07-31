import { createFileRoute, notFound } from '@tanstack/react-router';

import { getWorkspacePage } from '#/features/console/data';
import { WorkspacePage } from '#/features/console/pages/workspace-page';

export const Route = createFileRoute('/console/_workspace/prosecution')({
  component: Page,
  head: () => {
    const model = getWorkspacePage('prosecution');
    return {
      meta: [{ title: `${model?.title ?? 'prosecution'} · Investigation Console` }],
    };
  },
});

function Page() {
  const model = getWorkspacePage('prosecution');
  if (!model) {
    throw notFound();
  }
  return <WorkspacePage model={model} />;
}

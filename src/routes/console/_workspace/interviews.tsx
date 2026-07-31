import { createFileRoute, notFound } from '@tanstack/react-router';

import { getWorkspacePage } from '#/features/console/data';
import { WorkspacePage } from '#/features/console/pages/workspace-page';

export const Route = createFileRoute('/console/_workspace/interviews')({
  component: Page,
  head: () => {
    const model = getWorkspacePage('interviews');
    return {
      meta: [{ title: `${model?.title ?? 'interviews'} · Investigation Console` }],
    };
  },
});

function Page() {
  const model = getWorkspacePage('interviews');
  if (!model) {
    throw notFound();
  }
  return <WorkspacePage model={model} />;
}

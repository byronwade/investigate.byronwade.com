import { createFileRoute, notFound } from '@tanstack/react-router';

import { getWorkspacePage } from '#/features/console/data';
import { WorkspacePage } from '#/features/console/pages/workspace-page';

export const Route = createFileRoute('/console/_workspace/intelligence')({
  component: Page,
  head: () => {
    const model = getWorkspacePage('intelligence');
    return {
      meta: [{ title: `${model?.title ?? 'intelligence'} · Investigation Console` }],
    };
  },
});

function Page() {
  const model = getWorkspacePage('intelligence');
  if (!model) {
    throw notFound();
  }
  return <WorkspacePage model={model} />;
}

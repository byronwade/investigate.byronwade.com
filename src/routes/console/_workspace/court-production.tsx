import { createFileRoute, notFound } from '@tanstack/react-router';

import { getWorkspacePage } from '#/features/console/data';
import { WorkspacePage } from '#/features/console/pages/workspace-page';

export const Route = createFileRoute('/console/_workspace/court-production')({
  component: Page,
  head: () => {
    const model = getWorkspacePage('court-production');
    return {
      meta: [{ title: `${model?.title ?? 'court-production'} · Investigation Console` }],
    };
  },
});

function Page() {
  const model = getWorkspacePage('court-production');
  if (!model) {
    throw notFound();
  }
  return <WorkspacePage model={model} />;
}

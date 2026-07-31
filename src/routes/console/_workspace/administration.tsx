import { createFileRoute, notFound } from '@tanstack/react-router';

import { getWorkspacePage } from '#/features/console/data';
import { WorkspacePage } from '#/features/console/pages/workspace-page';

export const Route = createFileRoute('/console/_workspace/administration')({
  component: Page,
  head: () => {
    const model = getWorkspacePage('administration');
    return {
      meta: [{ title: `${model?.title ?? 'administration'} · Investigation Console` }],
    };
  },
});

function Page() {
  const model = getWorkspacePage('administration');
  if (!model) {
    throw notFound();
  }
  return <WorkspacePage model={model} />;
}

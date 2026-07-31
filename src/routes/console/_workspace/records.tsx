import { createFileRoute, notFound } from '@tanstack/react-router';

import { getWorkspacePage } from '#/features/console/data';
import { WorkspacePage } from '#/features/console/pages/workspace-page';

export const Route = createFileRoute('/console/_workspace/records')({
  component: Page,
  head: () => {
    const model = getWorkspacePage('records');
    return {
      meta: [{ title: `${model?.title ?? 'records'} · Investigation Console` }],
    };
  },
});

function Page() {
  const model = getWorkspacePage('records');
  if (!model) {
    throw notFound();
  }
  return <WorkspacePage model={model} />;
}

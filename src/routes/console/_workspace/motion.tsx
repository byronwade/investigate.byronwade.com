import { createFileRoute, notFound } from '@tanstack/react-router';

import { getWorkspacePage } from '#/features/console/data';
import { WorkspacePage } from '#/features/console/pages/workspace-page';

export const Route = createFileRoute('/console/_workspace/motion')({
  component: Page,
  head: () => {
    const model = getWorkspacePage('motion');
    return {
      meta: [{ title: `${model?.title ?? 'motion'} · Investigation Console` }],
    };
  },
});

function Page() {
  const model = getWorkspacePage('motion');
  if (!model) {
    throw notFound();
  }
  return <WorkspacePage model={model} />;
}

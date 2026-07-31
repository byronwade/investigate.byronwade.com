import { createFileRoute, notFound } from '@tanstack/react-router';

import { getWorkspacePage } from '#/features/console/data';
import { WorkspacePage } from '#/features/console/pages/workspace-page';

export const Route = createFileRoute('/console/_workspace/handoff')({
  component: Page,
  head: () => {
    const model = getWorkspacePage('handoff');
    return {
      meta: [{ title: `${model?.title ?? 'handoff'} · Investigation Console` }],
    };
  },
});

function Page() {
  const model = getWorkspacePage('handoff');
  if (!model) {
    throw notFound();
  }
  return <WorkspacePage model={model} />;
}

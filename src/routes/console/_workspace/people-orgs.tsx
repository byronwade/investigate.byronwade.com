import { createFileRoute, notFound } from '@tanstack/react-router';

import { getWorkspacePage } from '#/features/console/data';
import { WorkspacePage } from '#/features/console/pages/workspace-page';

export const Route = createFileRoute('/console/_workspace/people-orgs')({
  component: Page,
  head: () => {
    const model = getWorkspacePage('people-orgs');
    return {
      meta: [{ title: `${model?.title ?? 'people-orgs'} · Investigation Console` }],
    };
  },
});

function Page() {
  const model = getWorkspacePage('people-orgs');
  if (!model) {
    throw notFound();
  }
  return <WorkspacePage model={model} />;
}

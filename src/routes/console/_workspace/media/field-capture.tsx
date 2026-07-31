import { createFileRoute, notFound } from '@tanstack/react-router';

import { getMediaWorkbench } from '#/features/console/data';
import { MediaWorkbenchPage } from '#/features/console/pages/media-workbench-page';

export const Route = createFileRoute('/console/_workspace/media/field-capture')({
  component: Page,
  head: () => {
    const model = getMediaWorkbench('field-capture');
    return {
      meta: [{ title: `${model?.title ?? 'field-capture'} · Investigation Console` }],
    };
  },
});

function Page() {
  const model = getMediaWorkbench('field-capture');
  if (!model) {
    throw notFound();
  }
  return <MediaWorkbenchPage model={model} />;
}

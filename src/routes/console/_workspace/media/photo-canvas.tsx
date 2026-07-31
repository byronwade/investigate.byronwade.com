import { createFileRoute, notFound } from '@tanstack/react-router';

import { getMediaWorkbench } from '#/features/console/data';
import { MediaWorkbenchPage } from '#/features/console/pages/media-workbench-page';

export const Route = createFileRoute('/console/_workspace/media/photo-canvas')({
  component: Page,
  head: () => {
    const model = getMediaWorkbench('photo-canvas');
    return {
      meta: [{ title: `${model?.title ?? 'photo-canvas'} · Investigation Console` }],
    };
  },
});

function Page() {
  const model = getMediaWorkbench('photo-canvas');
  if (!model) {
    throw notFound();
  }
  return <MediaWorkbenchPage model={model} />;
}

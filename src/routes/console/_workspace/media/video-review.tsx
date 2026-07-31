import { createFileRoute, notFound } from '@tanstack/react-router';

import { getMediaWorkbench } from '#/features/console/data';
import { MediaWorkbenchPage } from '#/features/console/pages/media-workbench-page';

export const Route = createFileRoute('/console/_workspace/media/video-review')({
  component: Page,
  head: () => {
    const model = getMediaWorkbench('video-review');
    return {
      meta: [{ title: `${model?.title ?? 'video-review'} · Investigation Console` }],
    };
  },
});

function Page() {
  const model = getMediaWorkbench('video-review');
  if (!model) {
    throw notFound();
  }
  return <MediaWorkbenchPage model={model} />;
}

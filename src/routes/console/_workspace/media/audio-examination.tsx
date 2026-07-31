import { createFileRoute, notFound } from '@tanstack/react-router';

import { getMediaWorkbench } from '#/features/console/data';
import { MediaWorkbenchPage } from '#/features/console/pages/media-workbench-page';

export const Route = createFileRoute('/console/_workspace/media/audio-examination')({
  component: Page,
  head: () => {
    const model = getMediaWorkbench('audio-examination');
    return {
      meta: [{ title: `${model?.title ?? 'audio-examination'} · Investigation Console` }],
    };
  },
});

function Page() {
  const model = getMediaWorkbench('audio-examination');
  if (!model) {
    throw notFound();
  }
  return <MediaWorkbenchPage model={model} />;
}

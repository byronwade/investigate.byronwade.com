import { createFileRoute } from '@tanstack/react-router';

import { ScenesIndexPage } from '#/features/console/pages/scenes-index-page';

export const Route = createFileRoute('/console/_workspace/scenes')({
  component: ScenesIndexPage,
  head: () => ({
    meta: [{ title: 'Scenes index · Investigation Console' }],
  }),
});

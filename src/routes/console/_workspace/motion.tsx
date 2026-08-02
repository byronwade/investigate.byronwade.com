import { createFileRoute } from '@tanstack/react-router';

import { MotionPage } from '#/features/console/pages/motion-page';

export const Route = createFileRoute('/console/_workspace/motion')({
  component: MotionPage,
  head: () => ({
    meta: [{ title: 'Motion & interaction · Investigation Console' }],
  }),
});

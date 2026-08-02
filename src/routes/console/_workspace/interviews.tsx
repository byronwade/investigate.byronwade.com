import { createFileRoute } from '@tanstack/react-router';

import { InterviewsIndexPage } from '#/features/console/pages/interviews-index-page';

export const Route = createFileRoute('/console/_workspace/interviews')({
  component: InterviewsIndexPage,
  head: () => ({
    meta: [{ title: 'Interviews index · Investigation Console' }],
  }),
});

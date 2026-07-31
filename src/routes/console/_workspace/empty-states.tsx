import { createFileRoute } from '@tanstack/react-router';

import { EmptyStatesPage } from '#/features/console/pages/empty-states-page';

export const Route = createFileRoute('/console/_workspace/empty-states')({
  component: EmptyStatesPage,
  head: () => ({
    meta: [{ title: 'Empty states · Investigation Console' }],
  }),
});

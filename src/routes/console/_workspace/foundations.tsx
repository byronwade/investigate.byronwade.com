import { createFileRoute } from '@tanstack/react-router';

import { FoundationsPage } from '#/features/console/pages/foundations-page';

export const Route = createFileRoute('/console/_workspace/foundations')({
  component: FoundationsPage,
  head: () => ({
    meta: [{ title: 'Foundations · Investigation Console' }],
  }),
});

import { createFileRoute } from '@tanstack/react-router';

import { SearchPage } from '#/features/console/pages/search-page';

export const Route = createFileRoute('/console/_workspace/search')({
  component: SearchPage,
  head: () => ({
    meta: [{ title: 'Search results · Investigation Console' }],
  }),
});

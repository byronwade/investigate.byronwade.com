import { createFileRoute } from '@tanstack/react-router';

import { RecordsPage } from '#/features/console/pages/records-page';

export const Route = createFileRoute('/console/_workspace/records')({
  component: RecordsPage,
  head: () => ({
    meta: [{ title: 'Records & retention · Investigation Console' }],
  }),
});

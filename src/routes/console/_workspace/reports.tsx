import { createFileRoute } from '@tanstack/react-router';

import { ReportsPage } from '#/features/console/pages/reports-page';

export const Route = createFileRoute('/console/_workspace/reports')({
  component: ReportsPage,
  head: () => ({
    meta: [{ title: 'Reports & statistics · Investigation Console' }],
  }),
});

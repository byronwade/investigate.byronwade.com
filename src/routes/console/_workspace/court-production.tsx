import { createFileRoute } from '@tanstack/react-router';

import { CourtProductionPage } from '#/features/console/pages/court-production-page';

export const Route = createFileRoute('/console/_workspace/court-production')({
  component: CourtProductionPage,
  head: () => ({
    meta: [{ title: 'Court production · Investigation Console' }],
  }),
});

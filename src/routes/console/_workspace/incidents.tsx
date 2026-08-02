import { createFileRoute } from '@tanstack/react-router';

import { IncidentsPage } from '#/features/console/pages/incidents-page';

export const Route = createFileRoute('/console/_workspace/incidents')({
  component: IncidentsPage,
  head: () => ({
    meta: [{ title: 'Incidents map · Investigation Console' }],
  }),
});

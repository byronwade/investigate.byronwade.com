import { createFileRoute } from '@tanstack/react-router';

import { OversightPage } from '#/features/console/pages/oversight-page';

export const Route = createFileRoute('/console/_workspace/oversight')({
  component: OversightPage,
  head: () => ({
    meta: [{ title: 'Oversight & audit · Investigation Console' }],
  }),
});

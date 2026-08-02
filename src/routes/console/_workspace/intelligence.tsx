import { createFileRoute } from '@tanstack/react-router';

import { IntelligencePage } from '#/features/console/pages/intelligence-page';

export const Route = createFileRoute('/console/_workspace/intelligence')({
  component: IntelligencePage,
  head: () => ({
    meta: [{ title: 'Intelligence · Investigation Console' }],
  }),
});

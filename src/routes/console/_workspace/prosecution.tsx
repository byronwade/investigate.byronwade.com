import { createFileRoute } from '@tanstack/react-router';

import { ProsecutionPage } from '#/features/console/pages/prosecution-page';

export const Route = createFileRoute('/console/_workspace/prosecution')({
  component: ProsecutionPage,
  head: () => ({
    meta: [{ title: 'Prosecution · Investigation Console' }],
  }),
});

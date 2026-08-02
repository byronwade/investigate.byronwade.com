import { createFileRoute } from '@tanstack/react-router';

import { AdministrationPage } from '#/features/console/pages/administration-page';

export const Route = createFileRoute('/console/_workspace/administration')({
  component: AdministrationPage,
  head: () => ({
    meta: [{ title: 'Administration · Investigation Console' }],
  }),
});

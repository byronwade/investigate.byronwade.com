import { createFileRoute } from '@tanstack/react-router';

import { CommandCenterPage } from '#/features/console/pages/command-center-page';

export const Route = createFileRoute('/console/_workspace/command-center')({
  component: CommandCenterPage,
  head: () => ({
    meta: [{ title: 'Command center · Investigation Console' }],
  }),
});

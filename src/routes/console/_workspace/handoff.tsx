import { createFileRoute } from '@tanstack/react-router';

import { HandoffPage } from '#/features/console/pages/handoff-page';

export const Route = createFileRoute('/console/_workspace/handoff')({
  component: HandoffPage,
  head: () => ({
    meta: [{ title: 'Handoff · Investigation Console' }],
  }),
});

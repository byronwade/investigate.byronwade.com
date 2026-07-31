import { createFileRoute } from '@tanstack/react-router';

import { IntakePage } from '#/features/console/pages/intake-page';

export const Route = createFileRoute('/console/_workspace/intake')({
  component: IntakePage,
  head: () => ({
    meta: [{ title: 'Intake & triage · Investigation Console' }],
  }),
});

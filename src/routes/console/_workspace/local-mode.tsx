import { createFileRoute } from '@tanstack/react-router';

import { LocalModePage } from '#/features/console/pages/local-mode-page';

export const Route = createFileRoute('/console/_workspace/local-mode')({
  component: LocalModePage,
  head: () => ({
    meta: [{ title: 'Local mode · Investigation Console' }],
  }),
});

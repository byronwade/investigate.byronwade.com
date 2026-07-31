import { createFileRoute, redirect } from '@tanstack/react-router';

import { DEFAULT_CASE_ID } from '#/features/console/data';

export const Route = createFileRoute('/console/')({
  beforeLoad: () => {
    throw redirect({
      to: '/console/cases/$caseId/overview',
      params: { caseId: DEFAULT_CASE_ID },
    });
  },
});

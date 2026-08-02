import { createFileRoute } from '@tanstack/react-router';

import { PeopleOrgsPage } from '#/features/console/pages/people-orgs-page';

export const Route = createFileRoute('/console/_workspace/people-orgs')({
  component: PeopleOrgsPage,
  head: () => ({
    meta: [{ title: 'People & organizations · Investigation Console' }],
  }),
});

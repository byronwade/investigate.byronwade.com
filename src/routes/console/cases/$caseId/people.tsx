import { createFileRoute } from '@tanstack/react-router';

import { getCase } from '#/features/console/data';
import { PeoplePage } from '#/features/console/pages/people-page';

export const Route = createFileRoute('/console/cases/$caseId/people')({
  component: PeopleRoute,
  head: ({ params }) => {
    const caseRecord = getCase(params.caseId);
    return {
      meta: [
        {
          title: caseRecord
            ? `People · ${caseRecord.title} · Investigation Console`
            : 'People · Investigation Console',
        },
      ],
    };
  },
});

function PeopleRoute() {
  const { caseId } = Route.useParams();
  return <PeoplePage caseId={caseId} />;
}

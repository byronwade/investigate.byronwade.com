import { createFileRoute } from '@tanstack/react-router';

import { getCase } from '#/features/console/data';
import { OverviewPage } from '#/features/console/pages/overview-page';

export const Route = createFileRoute('/console/cases/$caseId/overview')({
  component: OverviewRoute,
  head: ({ params }) => {
    const caseRecord = getCase(params.caseId);
    return {
      meta: [
        {
          title: caseRecord
            ? `Overview · ${caseRecord.title} · Investigation Console`
            : 'Overview · Investigation Console',
        },
      ],
    };
  },
});

function OverviewRoute() {
  const { caseId } = Route.useParams();
  return <OverviewPage caseId={caseId} />;
}

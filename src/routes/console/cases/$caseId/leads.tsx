import { createFileRoute } from '@tanstack/react-router';

import { getCase } from '#/features/console/data';
import { LeadsPage } from '#/features/console/pages/leads-page';

export const Route = createFileRoute('/console/cases/$caseId/leads')({
  component: LeadsRoute,
  head: ({ params }) => {
    const caseRecord = getCase(params.caseId);
    return {
      meta: [
        {
          title: caseRecord
            ? `Leads · ${caseRecord.title} · Investigation Console`
            : 'Leads · Investigation Console',
        },
      ],
    };
  },
});

function LeadsRoute() {
  const { caseId } = Route.useParams();
  return <LeadsPage caseId={caseId} />;
}

import { createFileRoute } from '@tanstack/react-router';

import { getCase } from '#/features/console/data';
import { TimelinePage } from '#/features/console/pages/timeline-page';

export const Route = createFileRoute('/console/cases/$caseId/timeline')({
  component: TimelineRoute,
  head: ({ params }) => {
    const caseRecord = getCase(params.caseId);
    return {
      meta: [
        {
          title: caseRecord
            ? `Timeline · ${caseRecord.title} · Investigation Console`
            : 'Timeline · Investigation Console',
        },
      ],
    };
  },
});

function TimelineRoute() {
  const { caseId } = Route.useParams();
  return <TimelinePage caseId={caseId} />;
}

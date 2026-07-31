import { createFileRoute } from '@tanstack/react-router';

import { getCase } from '#/features/console/data';
import { PageHeader } from '#/features/console/ui/page-header';

export const Route = createFileRoute('/console/cases/$caseId/timeline')({
  component: CaseTimelineStub,
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

function CaseTimelineStub() {
  const { caseId } = Route.useParams();
  const caseRecord = getCase(caseId);
  if (!caseRecord) {
    return null;
  }

  return (
    <PageHeader
      title="Timeline"
      description={caseRecord.title}
      meta={`${caseRecord.number} · ${caseRecord.status}`}
    />
  );
}

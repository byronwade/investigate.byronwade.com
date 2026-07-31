import { createFileRoute } from '@tanstack/react-router';

import { getCase } from '#/features/console/data';
import { PageHeader } from '#/features/console/ui/page-header';

export const Route = createFileRoute('/console/cases/$caseId/people')({
  component: CasePeopleStub,
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

function CasePeopleStub() {
  const { caseId } = Route.useParams();
  const caseRecord = getCase(caseId);
  if (!caseRecord) {
    return null;
  }

  return (
    <PageHeader
      title="People"
      description={caseRecord.title}
      meta={`${caseRecord.number} · ${caseRecord.status}`}
    />
  );
}

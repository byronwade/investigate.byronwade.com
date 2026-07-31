import { createFileRoute } from '@tanstack/react-router';

import { getCase } from '#/features/console/data';
import { PageHeader } from '#/features/console/ui/page-header';

export const Route = createFileRoute('/console/cases/$caseId/leads')({
  component: CaseLeadsStub,
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

function CaseLeadsStub() {
  const { caseId } = Route.useParams();
  const caseRecord = getCase(caseId);
  if (!caseRecord) {
    return null;
  }

  return (
    <PageHeader
      title="Leads"
      description={caseRecord.title}
      meta={`${caseRecord.number} · ${caseRecord.status}`}
    />
  );
}

import { createFileRoute } from '@tanstack/react-router';

import { getCase } from '#/features/console/data';
import { PageHeader } from '#/features/console/ui/page-header';

export const Route = createFileRoute('/console/cases/$caseId/evidence')({
  component: CaseEvidenceStub,
  head: ({ params }) => {
    const caseRecord = getCase(params.caseId);
    return {
      meta: [
        {
          title: caseRecord
            ? `Evidence · ${caseRecord.title} · Investigation Console`
            : 'Evidence · Investigation Console',
        },
      ],
    };
  },
});

function CaseEvidenceStub() {
  const { caseId } = Route.useParams();
  const caseRecord = getCase(caseId);
  if (!caseRecord) {
    return null;
  }

  return (
    <PageHeader
      title="Evidence"
      description={caseRecord.title}
      meta={`${caseRecord.number} · ${caseRecord.status}`}
    />
  );
}

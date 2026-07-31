import { createFileRoute } from '@tanstack/react-router';

import { getCase } from '#/features/console/data';
import { EvidencePage } from '#/features/console/pages/evidence-page';

export const Route = createFileRoute('/console/cases/$caseId/evidence')({
  component: EvidenceRoute,
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

function EvidenceRoute() {
  const { caseId } = Route.useParams();
  return <EvidencePage caseId={caseId} />;
}

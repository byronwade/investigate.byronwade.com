import { createFileRoute, notFound } from '@tanstack/react-router';

import { getCase, getDigitalEvidence } from '#/features/console/data';
import { DigitalPage } from '#/features/console/pages/digital-page';

export const Route = createFileRoute('/console/cases/$caseId/digital')({
  component: Page,
  head: ({ params }) => {
    const caseRecord = getCase(params.caseId);
    const model = getDigitalEvidence(params.caseId);
    return {
      meta: [
        {
          title: caseRecord
            ? `${model?.title ?? 'Digital'} · ${caseRecord.title} · Investigation Console`
            : 'Digital · Investigation Console',
        },
      ],
    };
  },
});

function Page() {
  const { caseId } = Route.useParams();
  const model = getDigitalEvidence(caseId);
  if (!model) {
    throw notFound();
  }
  return <DigitalPage caseId={caseId} />;
}

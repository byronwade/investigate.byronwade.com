import { createFileRoute, notFound } from '@tanstack/react-router';

import { getCase, getLegalProcess } from '#/features/console/data';
import { LegalPage } from '#/features/console/pages/legal-page';

export const Route = createFileRoute('/console/cases/$caseId/legal')({
  component: Page,
  head: ({ params }) => {
    const caseRecord = getCase(params.caseId);
    const model = getLegalProcess(params.caseId);
    return {
      meta: [
        {
          title: caseRecord
            ? `${model?.title ?? 'Legal'} · ${caseRecord.title} · Investigation Console`
            : 'Legal · Investigation Console',
        },
      ],
    };
  },
});

function Page() {
  const { caseId } = Route.useParams();
  const model = getLegalProcess(caseId);
  if (!model) {
    throw notFound();
  }
  return <LegalPage caseId={caseId} />;
}

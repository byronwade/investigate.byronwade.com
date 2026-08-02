import { createFileRoute, notFound } from '@tanstack/react-router';

import { getAnalysisBoard, getCase } from '#/features/console/data';
import { AnalysisPage } from '#/features/console/pages/analysis-page';

export const Route = createFileRoute('/console/cases/$caseId/analysis')({
  component: Page,
  head: ({ params }) => {
    const caseRecord = getCase(params.caseId);
    const model = getAnalysisBoard(params.caseId);
    return {
      meta: [
        {
          title: caseRecord
            ? `${model?.title ?? 'Analysis'} · ${caseRecord.title} · Investigation Console`
            : 'Analysis · Investigation Console',
        },
      ],
    };
  },
});

function Page() {
  const { caseId } = Route.useParams();
  const model = getAnalysisBoard(caseId);
  if (!model) {
    throw notFound();
  }
  return <AnalysisPage caseId={caseId} />;
}

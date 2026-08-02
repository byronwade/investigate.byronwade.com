import { createFileRoute, notFound } from '@tanstack/react-router';

import { getCase, getSceneDiagram } from '#/features/console/data';
import { ScenePage } from '#/features/console/pages/scene-page';

export const Route = createFileRoute('/console/cases/$caseId/scene')({
  component: Page,
  head: ({ params }) => {
    const caseRecord = getCase(params.caseId);
    const model = getSceneDiagram(params.caseId);
    return {
      meta: [
        {
          title: caseRecord
            ? `${model?.title ?? 'Scene'} · ${caseRecord.title} · Investigation Console`
            : 'Scene · Investigation Console',
        },
      ],
    };
  },
});

function Page() {
  const { caseId } = Route.useParams();
  const model = getSceneDiagram(caseId);
  if (!model) {
    throw notFound();
  }
  return <ScenePage caseId={caseId} />;
}

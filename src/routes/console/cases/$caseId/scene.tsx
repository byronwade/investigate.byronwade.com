import { createFileRoute, notFound } from '@tanstack/react-router';

import { getCase, getCaseWorkspacePage } from '#/features/console/data';
import { WorkspacePage } from '#/features/console/pages/workspace-page';

export const Route = createFileRoute('/console/cases/$caseId/scene')({
  component: Page,
  head: ({ params }) => {
    const caseRecord = getCase(params.caseId);
    const model = getCaseWorkspacePage(params.caseId, 'scene');
    return {
      meta: [
        {
          title: caseRecord
            ? `${model?.title ?? 'scene'} · ${caseRecord.title} · Investigation Console`
            : 'scene · Investigation Console',
        },
      ],
    };
  },
});

function Page() {
  const { caseId } = Route.useParams();
  const model = getCaseWorkspacePage(caseId, 'scene');
  if (!model) {
    throw notFound();
  }
  return <WorkspacePage model={model} />;
}

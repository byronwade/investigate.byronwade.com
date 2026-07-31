import { createFileRoute, notFound } from '@tanstack/react-router';

import { getCase, getCaseWorkspacePage } from '#/features/console/data';
import { WorkspacePage } from '#/features/console/pages/workspace-page';

export const Route = createFileRoute('/console/cases/$caseId/analysis')({
  component: Page,
  head: ({ params }) => {
    const caseRecord = getCase(params.caseId);
    const model = getCaseWorkspacePage(params.caseId, 'analysis');
    return {
      meta: [
        {
          title: caseRecord
            ? `${model?.title ?? 'analysis'} · ${caseRecord.title} · Investigation Console`
            : 'analysis · Investigation Console',
        },
      ],
    };
  },
});

function Page() {
  const { caseId } = Route.useParams();
  const model = getCaseWorkspacePage(caseId, 'analysis');
  if (!model) {
    throw notFound();
  }
  return <WorkspacePage model={model} />;
}

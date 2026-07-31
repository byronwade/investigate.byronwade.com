import { createFileRoute, notFound } from '@tanstack/react-router';

import { getCase, getCaseWorkspacePage } from '#/features/console/data';
import { WorkspacePage } from '#/features/console/pages/workspace-page';

export const Route = createFileRoute('/console/cases/$caseId/plan')({
  component: Page,
  head: ({ params }) => {
    const caseRecord = getCase(params.caseId);
    const model = getCaseWorkspacePage(params.caseId, 'plan');
    return {
      meta: [
        {
          title: caseRecord
            ? `${model?.title ?? 'plan'} · ${caseRecord.title} · Investigation Console`
            : 'plan · Investigation Console',
        },
      ],
    };
  },
});

function Page() {
  const { caseId } = Route.useParams();
  const model = getCaseWorkspacePage(caseId, 'plan');
  if (!model) {
    throw notFound();
  }
  return <WorkspacePage model={model} />;
}

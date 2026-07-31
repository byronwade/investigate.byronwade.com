import { createFileRoute, notFound } from '@tanstack/react-router';

import { getCase, getCaseWorkspacePage } from '#/features/console/data';
import { WorkspacePage } from '#/features/console/pages/workspace-page';

export const Route = createFileRoute('/console/cases/$caseId/interview')({
  component: Page,
  head: ({ params }) => {
    const caseRecord = getCase(params.caseId);
    const model = getCaseWorkspacePage(params.caseId, 'interview');
    return {
      meta: [
        {
          title: caseRecord
            ? `${model?.title ?? 'interview'} · ${caseRecord.title} · Investigation Console`
            : 'interview · Investigation Console',
        },
      ],
    };
  },
});

function Page() {
  const { caseId } = Route.useParams();
  const model = getCaseWorkspacePage(caseId, 'interview');
  if (!model) {
    throw notFound();
  }
  return <WorkspacePage model={model} />;
}

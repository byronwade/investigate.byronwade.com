import { createFileRoute, notFound } from '@tanstack/react-router';

import { getCase, getCaseWorkspacePage } from '#/features/console/data';
import { WorkspacePage } from '#/features/console/pages/workspace-page';

export const Route = createFileRoute('/console/cases/$caseId/legal')({
  component: Page,
  head: ({ params }) => {
    const caseRecord = getCase(params.caseId);
    const model = getCaseWorkspacePage(params.caseId, 'legal');
    return {
      meta: [
        {
          title: caseRecord
            ? `${model?.title ?? 'legal'} · ${caseRecord.title} · Investigation Console`
            : 'legal · Investigation Console',
        },
      ],
    };
  },
});

function Page() {
  const { caseId } = Route.useParams();
  const model = getCaseWorkspacePage(caseId, 'legal');
  if (!model) {
    throw notFound();
  }
  return <WorkspacePage model={model} />;
}

import { createFileRoute, notFound } from '@tanstack/react-router';

import { getCase, getCaseWorkspacePage } from '#/features/console/data';
import { WorkspacePage } from '#/features/console/pages/workspace-page';

export const Route = createFileRoute('/console/cases/$caseId/closure')({
  component: Page,
  head: ({ params }) => {
    const caseRecord = getCase(params.caseId);
    const model = getCaseWorkspacePage(params.caseId, 'closure');
    return {
      meta: [
        {
          title: caseRecord
            ? `${model?.title ?? 'closure'} · ${caseRecord.title} · Investigation Console`
            : 'closure · Investigation Console',
        },
      ],
    };
  },
});

function Page() {
  const { caseId } = Route.useParams();
  const model = getCaseWorkspacePage(caseId, 'closure');
  if (!model) {
    throw notFound();
  }
  return <WorkspacePage model={model} />;
}

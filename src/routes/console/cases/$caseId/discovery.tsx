import { createFileRoute, notFound } from '@tanstack/react-router';

import { getCase, getCaseWorkspacePage } from '#/features/console/data';
import { WorkspacePage } from '#/features/console/pages/workspace-page';

export const Route = createFileRoute('/console/cases/$caseId/discovery')({
  component: Page,
  head: ({ params }) => {
    const caseRecord = getCase(params.caseId);
    const model = getCaseWorkspacePage(params.caseId, 'discovery');
    return {
      meta: [
        {
          title: caseRecord
            ? `${model?.title ?? 'discovery'} · ${caseRecord.title} · Investigation Console`
            : 'discovery · Investigation Console',
        },
      ],
    };
  },
});

function Page() {
  const { caseId } = Route.useParams();
  const model = getCaseWorkspacePage(caseId, 'discovery');
  if (!model) {
    throw notFound();
  }
  return <WorkspacePage model={model} />;
}

import { createFileRoute, notFound } from '@tanstack/react-router';

import { getCase, getCaseWorkspacePage } from '#/features/console/data';
import { WorkspacePage } from '#/features/console/pages/workspace-page';

export const Route = createFileRoute('/console/cases/$caseId/approvals')({
  component: Page,
  head: ({ params }) => {
    const caseRecord = getCase(params.caseId);
    const model = getCaseWorkspacePage(params.caseId, 'approvals');
    return {
      meta: [
        {
          title: caseRecord
            ? `${model?.title ?? 'approvals'} · ${caseRecord.title} · Investigation Console`
            : 'approvals · Investigation Console',
        },
      ],
    };
  },
});

function Page() {
  const { caseId } = Route.useParams();
  const model = getCaseWorkspacePage(caseId, 'approvals');
  if (!model) {
    throw notFound();
  }
  return <WorkspacePage model={model} />;
}

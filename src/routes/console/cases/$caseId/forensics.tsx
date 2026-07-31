import { createFileRoute, notFound } from '@tanstack/react-router';

import { getCase, getCaseWorkspacePage } from '#/features/console/data';
import { WorkspacePage } from '#/features/console/pages/workspace-page';

export const Route = createFileRoute('/console/cases/$caseId/forensics')({
  component: Page,
  head: ({ params }) => {
    const caseRecord = getCase(params.caseId);
    const model = getCaseWorkspacePage(params.caseId, 'forensics');
    return {
      meta: [
        {
          title: caseRecord
            ? `${model?.title ?? 'forensics'} · ${caseRecord.title} · Investigation Console`
            : 'forensics · Investigation Console',
        },
      ],
    };
  },
});

function Page() {
  const { caseId } = Route.useParams();
  const model = getCaseWorkspacePage(caseId, 'forensics');
  if (!model) {
    throw notFound();
  }
  return <WorkspacePage model={model} />;
}

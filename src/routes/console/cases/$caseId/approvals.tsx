import { createFileRoute, notFound } from '@tanstack/react-router';

import { getApprovals, getCase } from '#/features/console/data';
import { ApprovalsPage } from '#/features/console/pages/approvals-page';

export const Route = createFileRoute('/console/cases/$caseId/approvals')({
  component: Page,
  head: ({ params }) => {
    const caseRecord = getCase(params.caseId);
    const model = getApprovals(params.caseId);
    return {
      meta: [
        {
          title: caseRecord
            ? `${model?.title ?? 'Approvals'} · ${caseRecord.title} · Investigation Console`
            : 'Approvals · Investigation Console',
        },
      ],
    };
  },
});

function Page() {
  const { caseId } = Route.useParams();
  const model = getApprovals(caseId);
  if (!model) {
    throw notFound();
  }
  return <ApprovalsPage caseId={caseId} />;
}

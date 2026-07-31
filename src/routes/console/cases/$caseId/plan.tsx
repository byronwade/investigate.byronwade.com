import { createFileRoute, notFound } from '@tanstack/react-router';

import { getCase, getInvestigativePlan } from '#/features/console/data';
import { PlanPage } from '#/features/console/pages/plan-page';

export const Route = createFileRoute('/console/cases/$caseId/plan')({
  component: Page,
  head: ({ params }) => {
    const caseRecord = getCase(params.caseId);
    const model = getInvestigativePlan(params.caseId);
    return {
      meta: [
        {
          title: caseRecord
            ? `${model?.title ?? 'Plan'} · ${caseRecord.title} · Investigation Console`
            : 'Plan · Investigation Console',
        },
      ],
    };
  },
});

function Page() {
  const { caseId } = Route.useParams();
  if (!getInvestigativePlan(caseId)) {
    throw notFound();
  }
  return <PlanPage caseId={caseId} />;
}

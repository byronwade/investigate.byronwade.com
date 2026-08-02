import { createFileRoute, notFound } from '@tanstack/react-router';

import { getCase, getClosure } from '#/features/console/data';
import { ClosurePage } from '#/features/console/pages/closure-page';

export const Route = createFileRoute('/console/cases/$caseId/closure')({
  component: Page,
  head: ({ params }) => {
    const caseRecord = getCase(params.caseId);
    const model = getClosure(params.caseId);
    return {
      meta: [
        {
          title: caseRecord
            ? `${model?.title ?? 'Closure'} · ${caseRecord.title} · Investigation Console`
            : 'Closure · Investigation Console',
        },
      ],
    };
  },
});

function Page() {
  const { caseId } = Route.useParams();
  const model = getClosure(caseId);
  if (!model) {
    throw notFound();
  }
  return <ClosurePage caseId={caseId} />;
}

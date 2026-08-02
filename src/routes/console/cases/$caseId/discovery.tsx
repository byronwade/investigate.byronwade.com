import { createFileRoute, notFound } from '@tanstack/react-router';

import { getCase, getDiscovery } from '#/features/console/data';
import { DiscoveryPage } from '#/features/console/pages/discovery-page';

export const Route = createFileRoute('/console/cases/$caseId/discovery')({
  component: Page,
  head: ({ params }) => {
    const caseRecord = getCase(params.caseId);
    const model = getDiscovery(params.caseId);
    return {
      meta: [
        {
          title: caseRecord
            ? `${model?.title ?? 'Discovery'} · ${caseRecord.title} · Investigation Console`
            : 'Discovery · Investigation Console',
        },
      ],
    };
  },
});

function Page() {
  const { caseId } = Route.useParams();
  const model = getDiscovery(caseId);
  if (!model) {
    throw notFound();
  }
  return <DiscoveryPage caseId={caseId} />;
}

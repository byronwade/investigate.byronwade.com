import { createFileRoute, notFound } from '@tanstack/react-router';

import { getCase, getForensics } from '#/features/console/data';
import { ForensicsPage } from '#/features/console/pages/forensics-page';

export const Route = createFileRoute('/console/cases/$caseId/forensics')({
  component: Page,
  head: ({ params }) => {
    const caseRecord = getCase(params.caseId);
    const model = getForensics(params.caseId);
    return {
      meta: [
        {
          title: caseRecord
            ? `${model?.title ?? 'Forensics'} · ${caseRecord.title} · Investigation Console`
            : 'Forensics · Investigation Console',
        },
      ],
    };
  },
});

function Page() {
  const { caseId } = Route.useParams();
  const model = getForensics(caseId);
  if (!model) {
    throw notFound();
  }
  return <ForensicsPage caseId={caseId} />;
}

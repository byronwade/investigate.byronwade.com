import { createFileRoute, notFound } from '@tanstack/react-router';

import { getCase, getInterviewTranscript } from '#/features/console/data';
import { InterviewPage } from '#/features/console/pages/interview-page';

export const Route = createFileRoute('/console/cases/$caseId/interview')({
  component: Page,
  head: ({ params }) => {
    const caseRecord = getCase(params.caseId);
    const model = getInterviewTranscript(params.caseId);
    return {
      meta: [
        {
          title: caseRecord
            ? `${model?.title ?? 'Interview'} · ${caseRecord.title} · Investigation Console`
            : 'Interview · Investigation Console',
        },
      ],
    };
  },
});

function Page() {
  const { caseId } = Route.useParams();
  const model = getInterviewTranscript(caseId);
  if (!model) {
    throw notFound();
  }
  return <InterviewPage caseId={caseId} />;
}

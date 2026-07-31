import { createFileRoute, notFound } from '@tanstack/react-router';

import { getCase, getPerson } from '#/features/console/data';
import { PersonProfilePage } from '#/features/console/pages/person-profile-page';

export const Route = createFileRoute('/console/cases/$caseId/people/$personId')({
  component: Page,
  head: ({ params }) => {
    const caseRecord = getCase(params.caseId);
    const person = getPerson(params.caseId, params.personId);
    return {
      meta: [
        {
          title: person
            ? `${person.name} · ${caseRecord?.title ?? 'Case'} · Investigation Console`
            : 'Person · Investigation Console',
        },
      ],
    };
  },
});

function Page() {
  const { caseId, personId } = Route.useParams();
  const person = getPerson(caseId, personId);
  if (!person) {
    throw notFound();
  }
  return <PersonProfilePage caseId={caseId} personId={personId} />;
}

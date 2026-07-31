import { createFileRoute, Outlet } from '@tanstack/react-router';

import { getCase } from '#/features/console/data';
import { CaseNotFound } from '#/features/console/shell/case-not-found';
import { CaseShell } from '#/features/console/shell/case-shell';

export const Route = createFileRoute('/console/cases/$caseId')({
  component: CaseLayout,
});

function CaseLayout() {
  const { caseId } = Route.useParams();
  const caseRecord = getCase(caseId);

  if (!caseRecord) {
    return <CaseNotFound caseId={caseId} />;
  }

  // Rail stays page-local in Phase A (right column inside main when needed).
  return (
    <CaseShell caseRecord={caseRecord}>
      <Outlet />
    </CaseShell>
  );
}

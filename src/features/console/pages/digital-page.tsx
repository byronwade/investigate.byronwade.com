import type * as React from 'react';

import { getDigitalEvidence } from '#/features/console/data/agency-getters';
import { CaseQueuePage } from '#/features/console/pages/case-queue-page';

export function DigitalPage({ caseId }: { caseId: string }): React.JSX.Element | null {
  const model = getDigitalEvidence(caseId);
  if (!model) {
    return null;
  }
  return <CaseQueuePage model={model} />;
}

import type * as React from 'react';

import { getForensics } from '#/features/console/data/agency-getters';
import { CaseQueuePage } from '#/features/console/pages/case-queue-page';

export function ForensicsPage({ caseId }: { caseId: string }): React.JSX.Element | null {
  const model = getForensics(caseId);
  if (!model) {
    return null;
  }
  return <CaseQueuePage model={model} />;
}

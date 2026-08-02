import type * as React from 'react';

import { getDiscovery } from '#/features/console/data/agency-getters';
import { CaseQueuePage } from '#/features/console/pages/case-queue-page';

export function DiscoveryPage({ caseId }: { caseId: string }): React.JSX.Element | null {
  const model = getDiscovery(caseId);
  if (!model) {
    return null;
  }
  return <CaseQueuePage model={model} />;
}

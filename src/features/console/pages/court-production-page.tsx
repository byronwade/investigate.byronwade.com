import type * as React from 'react';

import { getCourtProduction } from '#/features/console/data/agency-getters';
import { DirectoryPage } from '#/features/console/pages/directory-page';

export function CourtProductionPage(): React.JSX.Element {
  return <DirectoryPage model={getCourtProduction()} />;
}

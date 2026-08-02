import type * as React from 'react';

import { getOversight } from '#/features/console/data/agency-getters';
import { DirectoryPage } from '#/features/console/pages/directory-page';

export function OversightPage(): React.JSX.Element {
  return <DirectoryPage model={getOversight()} />;
}

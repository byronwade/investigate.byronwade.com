import type * as React from 'react';

import { getRecords } from '#/features/console/data/agency-getters';
import { DirectoryPage } from '#/features/console/pages/directory-page';

export function RecordsPage(): React.JSX.Element {
  return <DirectoryPage model={getRecords()} />;
}

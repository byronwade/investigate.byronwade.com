import type * as React from 'react';

import { getHandoff } from '#/features/console/data/agency-getters';
import { DirectoryPage } from '#/features/console/pages/directory-page';

export function HandoffPage(): React.JSX.Element {
  return <DirectoryPage model={getHandoff()} />;
}

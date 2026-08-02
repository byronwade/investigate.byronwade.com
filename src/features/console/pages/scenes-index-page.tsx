import type * as React from 'react';

import { getScenesIndex } from '#/features/console/data/agency-getters';
import { DirectoryPage } from '#/features/console/pages/directory-page';

export function ScenesIndexPage(): React.JSX.Element {
  return <DirectoryPage model={getScenesIndex()} />;
}

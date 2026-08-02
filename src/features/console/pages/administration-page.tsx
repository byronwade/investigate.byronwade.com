import type * as React from 'react';

import { getAdministration } from '#/features/console/data/agency-getters';
import { DirectoryPage } from '#/features/console/pages/directory-page';

export function AdministrationPage(): React.JSX.Element {
  return <DirectoryPage model={getAdministration()} />;
}

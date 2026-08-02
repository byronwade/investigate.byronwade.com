import type * as React from 'react';

import { getPeopleOrgs } from '#/features/console/data/agency-getters';
import { DirectoryPage } from '#/features/console/pages/directory-page';

export function PeopleOrgsPage(): React.JSX.Element {
  return <DirectoryPage model={getPeopleOrgs()} />;
}

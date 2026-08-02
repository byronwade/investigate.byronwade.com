import type * as React from 'react';

import { getFoundationsDocs } from '#/features/console/data/agency-getters';
import { DocsPage } from '#/features/console/pages/docs-page';

export function FoundationsPage(): React.JSX.Element {
  return <DocsPage model={getFoundationsDocs()} />;
}

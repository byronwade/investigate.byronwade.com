import type * as React from 'react';

import { getMotionDocs } from '#/features/console/data/agency-getters';
import { DocsPage } from '#/features/console/pages/docs-page';

export function MotionPage(): React.JSX.Element {
  return <DocsPage model={getMotionDocs()} />;
}

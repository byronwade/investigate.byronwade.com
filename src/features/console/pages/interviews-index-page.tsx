import type * as React from 'react';

import { getInterviewsIndex } from '#/features/console/data/agency-getters';
import { DirectoryPage } from '#/features/console/pages/directory-page';

export function InterviewsIndexPage(): React.JSX.Element {
  return <DirectoryPage model={getInterviewsIndex()} />;
}

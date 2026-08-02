import type * as React from 'react';

import type { DirectoryModel } from '#/features/console/data/agency-types';
import { DirectoryList } from '#/features/console/pages/directory-list';
import { PageHeader } from '#/features/console/ui/page-header';

export function DirectoryPage({ model }: { model: DirectoryModel }): React.JSX.Element {
  return (
    <div className="space-y-6" data-surface="console">
      <PageHeader title={model.title} description={model.description} meta={model.meta} />
      <DirectoryList
        entries={model.entries}
        filters={model.filters}
        filterLabel={`Filter ${model.title}`}
      />
    </div>
  );
}

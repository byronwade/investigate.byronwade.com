import type * as React from 'react';

import type { WorkspacePageModel } from '#/features/console/data/agency-types';
import { PageHeader } from '#/features/console/ui/page-header';
import { WorkspaceSections } from '#/features/console/ui/workspace-sections';

export function WorkspacePage({ model }: { model: WorkspacePageModel }): React.JSX.Element {
  return (
    <div className="space-y-6" data-surface="console">
      <PageHeader
        title={model.title}
        {...(model.description !== undefined ? { description: model.description } : {})}
        {...(model.meta !== undefined ? { meta: model.meta } : {})}
      />
      <WorkspaceSections sections={model.sections} />
    </div>
  );
}

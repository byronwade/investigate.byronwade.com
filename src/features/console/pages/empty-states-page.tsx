import type * as React from 'react';

import { Button } from '#/components/ui/button';
import { ConsoleLink } from '#/features/console/shell/console-link';
import { EmptyState } from '#/features/console/ui/empty-state';
import { PageHeader } from '#/features/console/ui/page-header';

export function EmptyStatesPage(): React.JSX.Element {
  return (
    <div className="space-y-8" data-surface="console">
      <PageHeader
        title="Empty states"
        description="Canonical empty patterns for queues, search, and media sessions. Prefer these over blank tables."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <EmptyState
          title="Queue is clear"
          description="Nothing is waiting on you. Overnight runs and intake packets will land here."
          action={
            <Button type="button" size="sm" className="h-11 rounded-[7px] sm:h-[30px]" asChild>
              <ConsoleLink to="/console/command-center">Back to command center</ConsoleLink>
            </Button>
          }
        />
        <EmptyState
          title="No search hits"
          description="Try a case number, evidence seal ID, or person name. Broad natural-language asks belong in the command palette."
          action={
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-11 rounded-[7px] sm:h-[30px]"
              asChild
            >
              <ConsoleLink to="/console/search">Open search</ConsoleLink>
            </Button>
          }
        />
        <EmptyState
          title="Media session idle"
          description="Load a field capture, video review, or photo canvas asset to begin annotated playback."
          action={
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-11 rounded-[7px] sm:h-[30px]"
              asChild
            >
              <ConsoleLink to="/console/media/video-review">Open video review</ConsoleLink>
            </Button>
          }
        />
        <EmptyState
          title="No cases match the filter"
          description="Clear filters or start intake for a new file. Portfolio only shows cases you can access."
          action={
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-11 rounded-[7px] sm:h-[30px]"
              asChild
            >
              <ConsoleLink to="/console/cases">View portfolio</ConsoleLink>
            </Button>
          }
        />
      </div>
    </div>
  );
}

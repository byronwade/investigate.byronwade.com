import { Plus } from '@phosphor-icons/react/dist/csr/Plus';
import type * as React from 'react';

import { Button } from '#/components/ui/button';
import { getCommandCenter } from '#/features/console/data/agency-getters';
import { WorkspaceSections } from '#/features/console/ui/workspace-sections';

export function CommandCenterPage(): React.JSX.Element {
  const model = getCommandCenter();

  return (
    <div className="space-y-8" data-surface="console">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="font-[family-name:var(--console-font-sans)] text-[24px] font-semibold leading-[30px] tracking-[-0.02em] text-[var(--console-ink)]">
            {model.greeting}
          </h1>
          <p className="flex flex-wrap items-center gap-2 text-[13px] text-[var(--console-muted)]">
            {model.summary.map((part, index) => (
              <span key={part} className="inline-flex items-center gap-2">
                {index > 0 ? <span aria-hidden="true">·</span> : null}
                <span
                  className={
                    index === model.summary.length - 1 ? 'text-[var(--console-sensor)]' : undefined
                  }
                >
                  {part}
                </span>
              </span>
            ))}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" className="h-[30px] rounded-[7px]">
            My queue
          </Button>
          <Button type="button" size="sm" className="h-[30px] gap-1.5 rounded-[7px]">
            <Plus aria-hidden="true" weight="bold" className="size-[11px]" />
            Task an assistant
          </Button>
        </div>
      </header>

      <WorkspaceSections sections={[model.waiting, model.overnight, model.attention]} />
    </div>
  );
}

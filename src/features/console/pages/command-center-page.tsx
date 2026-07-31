import { Plus } from '@phosphor-icons/react/dist/csr/Plus';
import type * as React from 'react';

import { Button } from '#/components/ui/button';
import { getCommandCenter } from '#/features/console/data/agency-getters';
import { ConsoleLink } from '#/features/console/shell/console-link';
import { WorkspaceSections } from '#/features/console/ui/workspace-sections';

export function CommandCenterPage(): React.JSX.Element {
  const model = getCommandCenter();

  return (
    <div className="space-y-8" data-surface="console">
      <header className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h1 className="font-[family-name:var(--console-font-sans)] text-[22px] font-semibold leading-[28px] tracking-[-0.02em] text-[var(--console-ink)] sm:text-[24px] sm:leading-[30px]">
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
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-11 rounded-[7px] sm:h-[30px]"
            asChild
          >
            <ConsoleLink to="/console/intake">My queue</ConsoleLink>
          </Button>
          <Button
            type="button"
            size="sm"
            className="h-11 gap-1.5 rounded-[7px] sm:h-[30px]"
            asChild
          >
            <ConsoleLink to="/console/intelligence">
              <Plus aria-hidden="true" weight="bold" className="size-[11px]" />
              Task an assistant
            </ConsoleLink>
          </Button>
        </div>
      </header>

      <WorkspaceSections sections={[model.waiting, model.overnight, model.attention]} />
    </div>
  );
}

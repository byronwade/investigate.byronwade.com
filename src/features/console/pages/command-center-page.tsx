import { Plus } from '@phosphor-icons/react/dist/csr/Plus';
import type * as React from 'react';

import { Button } from '#/components/ui/button';
import { getCommandCenter } from '#/features/console/data/agency-getters';
import { ConsoleLink } from '#/features/console/shell/console-link';
import { consoleActionClass } from '#/features/console/ui/console-action';
import { ConsolePage } from '#/features/console/ui/console-page';
import { WorkspaceSections } from '#/features/console/ui/workspace-sections';

export function CommandCenterPage(): React.JSX.Element {
  const model = getCommandCenter();

  return (
    <ConsolePage loose>
      <header className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:gap-4">
        <div className="space-y-2">
          <h1 className="font-[family-name:var(--console-font-sans)] text-[22px] font-semibold leading-[28px] tracking-[-0.02em] text-[var(--console-ink)] sm:text-[24px] sm:leading-[30px]">
            {model.greeting}
          </h1>
          <p className="max-w-2xl text-[13px] leading-5 text-[var(--console-muted)]">
            {model.summary.map((part, index) => (
              <span key={part}>
                {index > 0 ? ' · ' : null}
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
        <div className="console-actions">
          <Button type="button" variant="outline" size="sm" className={consoleActionClass} asChild>
            <ConsoleLink to="/console/intake">My queue</ConsoleLink>
          </Button>
          <Button type="button" size="sm" className={`${consoleActionClass} gap-1.5`} asChild>
            <ConsoleLink to="/console/intelligence">
              <Plus aria-hidden="true" weight="bold" className="size-[11px]" />
              Task an assistant
            </ConsoleLink>
          </Button>
        </div>
      </header>

      <WorkspaceSections sections={[model.waiting, model.overnight, model.attention]} />
    </ConsolePage>
  );
}

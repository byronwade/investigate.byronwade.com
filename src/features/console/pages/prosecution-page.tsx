import { Scales } from '@phosphor-icons/react/dist/csr/Scales';
import type * as React from 'react';

import { Badge } from '#/components/ui/badge';
import { Button } from '#/components/ui/button';
import { getProsecution } from '#/features/console/data/agency-getters';
import { ConsoleLink } from '#/features/console/shell/console-link';
import { consoleActionClass } from '#/features/console/ui/console-action';
import { ConsolePage } from '#/features/console/ui/console-page';
import { EmptyState } from '#/features/console/ui/empty-state';
import { PageHeader } from '#/features/console/ui/page-header';
import { StatusDot } from '#/features/console/ui/status-dot';

export function ProsecutionPage(): React.JSX.Element {
  const model = getProsecution();

  return (
    <ConsolePage>
      <PageHeader
        title={model.title}
        description={model.description}
        meta={
          <span className="inline-flex items-center gap-2">
            <Scales aria-hidden="true" weight="duotone" className="size-3.5" />
            {model.meta}
          </span>
        }
      />

      {model.packets.length === 0 ? (
        <EmptyState
          title="No prosecution packets"
          description="Packets appear when a case approaches AUSA handoff."
        />
      ) : (
        <ul className="console-list">
          {model.packets.map((packet) => (
            <li key={packet.id} className="console-row !items-start !py-4 sm:!items-center">
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusDot tone={packet.tone} />
                  <h2 className="text-[14px] font-semibold text-[var(--console-ink)]">
                    {packet.title}
                  </h2>
                  <Badge variant="secondary" className="rounded-md">
                    {packet.status}
                  </Badge>
                </div>
                <p className="text-[13px] leading-5 text-[var(--console-body)]">{packet.summary}</p>
                <p className="text-[12px] text-[var(--console-muted)]">
                  Owner · {packet.owner}
                  {packet.bradyOpen > 0
                    ? ` · ${packet.bradyOpen} Brady item${packet.bradyOpen === 1 ? '' : 's'} open`
                    : ' · Brady clear'}
                </p>
              </div>
              {packet.href ? (
                <Button
                  type="button"
                  size="sm"
                  className={`${consoleActionClass} shrink-0`}
                  asChild
                >
                  <ConsoleLink to={packet.href}>Open discovery</ConsoleLink>
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className={`${consoleActionClass} shrink-0`}
                  disabled
                >
                  Awaiting signature
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </ConsolePage>
  );
}

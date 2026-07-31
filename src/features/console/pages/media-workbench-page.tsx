import type * as React from 'react';

import { Separator } from '#/components/ui/separator';
import type { MediaWorkbenchModel } from '#/features/console/data/agency-types';
import { PageHeader } from '#/features/console/ui/page-header';
import { StatusDot } from '#/features/console/ui/status-dot';

export function MediaWorkbenchPage({ model }: { model: MediaWorkbenchModel }): React.JSX.Element {
  return (
    <div className="space-y-6" data-surface="console">
      <PageHeader title={model.title} description={model.description} meta={model.statusLabel} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-4">
          <div className="flex min-h-[220px] items-center justify-center rounded-lg border border-[var(--console-hairline)] bg-[var(--console-strip)]">
            <div className="space-y-2 text-center">
              <StatusDot tone="sensor" className="mx-auto" />
              <p className="text-[13px] font-medium text-[var(--console-ink)]">
                {model.assetLabel}
              </p>
              <p className="text-[12px] text-[var(--console-muted)]">
                Media surface placeholder — fixtures only
              </p>
            </div>
          </div>

          <ul className="divide-y divide-[var(--console-strip)] border-t border-[var(--console-hairline)]">
            {model.tracks.map((track) => (
              <li key={track.id} className="flex min-h-[38px] items-center gap-4 py-2">
                <span className="w-28 shrink-0 font-[family-name:var(--console-font-mono)] text-[11px] text-[var(--console-muted)]">
                  {track.label}
                </span>
                <span className="text-[13px] text-[var(--console-ink)]">{track.detail}</span>
              </li>
            ))}
          </ul>
        </div>

        <aside className="space-y-3 rounded-lg border border-[var(--console-hairline)] p-4">
          <h2 className="text-[12px] font-medium text-[var(--console-muted)]">Session notes</h2>
          <Separator className="bg-[var(--console-hairline)]" />
          <ul className="space-y-3">
            {model.notes.map((note) => (
              <li key={note.id} className="space-y-1">
                <p className="font-[family-name:var(--console-font-mono)] text-[11px] text-[var(--console-muted)]">
                  {note.at}
                </p>
                <p className="text-[13px] text-[var(--console-ink)]">{note.text}</p>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}

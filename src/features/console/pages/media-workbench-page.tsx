import { Pause } from '@phosphor-icons/react/dist/csr/Pause';
import { Play } from '@phosphor-icons/react/dist/csr/Play';
import { SkipBack } from '@phosphor-icons/react/dist/csr/SkipBack';
import { SkipForward } from '@phosphor-icons/react/dist/csr/SkipForward';
import type * as React from 'react';

import { Badge } from '#/components/ui/badge';
import { Button } from '#/components/ui/button';
import { ScrollArea } from '#/components/ui/scroll-area';
import { Separator } from '#/components/ui/separator';
import type { MediaWorkbenchModel } from '#/features/console/data/agency-types';
import { PageHeader } from '#/features/console/ui/page-header';
import { StatusDot } from '#/features/console/ui/status-dot';

export function MediaWorkbenchPage({ model }: { model: MediaWorkbenchModel }): React.JSX.Element {
  return (
    <div className="space-y-6" data-surface="console">
      <PageHeader
        title={model.title}
        description={model.description}
        meta={
          <span className="inline-flex items-center gap-2">
            <StatusDot tone="sensor" />
            {model.statusLabel}
          </span>
        }
        actions={
          <Badge
            variant="secondary"
            className="rounded-md font-[family-name:var(--console-font-mono)] text-[11px]"
          >
            fixture preview
          </Badge>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-4">
          <div className="overflow-hidden rounded-lg border border-[var(--console-hairline)] bg-[var(--console-ink)] text-white">
            <div className="flex min-h-[200px] items-center justify-center px-4 py-10 sm:min-h-[260px]">
              <div className="space-y-2 text-center">
                <p className="text-[13px] font-medium">{model.assetLabel}</p>
                <p className="text-[12px] text-white/65">
                  Synced playback · chain-of-custody locked
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 border-t border-white/10 bg-black/30 px-3 py-2.5">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="size-11 text-white hover:bg-white/10 hover:text-white sm:size-9"
                aria-label="Skip back"
              >
                <SkipBack aria-hidden="true" weight="fill" className="size-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="size-11 rounded-full bg-white text-[var(--console-ink)] hover:bg-white/90 sm:size-9"
                aria-label="Play"
              >
                <Play aria-hidden="true" weight="fill" className="size-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="size-11 text-white hover:bg-white/10 hover:text-white sm:size-9"
                aria-label="Pause"
              >
                <Pause aria-hidden="true" weight="fill" className="size-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="size-11 text-white hover:bg-white/10 hover:text-white sm:size-9"
                aria-label="Skip forward"
              >
                <SkipForward aria-hidden="true" weight="fill" className="size-4" />
              </Button>
              <div className="ml-auto font-[family-name:var(--console-font-mono)] text-[11px] text-white/70">
                00:00 / --:--
              </div>
            </div>
          </div>

          <section className="space-y-2">
            <h2 className="text-[13px] font-semibold text-[var(--console-ink)]">
              Tracks & markers
            </h2>
            <ul className="divide-y divide-[var(--console-strip)] border-t border-[var(--console-hairline)]">
              {model.tracks.map((track) => (
                <li
                  key={track.id}
                  className="flex min-h-11 flex-col gap-1 py-2.5 sm:min-h-[38px] sm:flex-row sm:items-center sm:gap-4"
                >
                  <span className="shrink-0 font-[family-name:var(--console-font-mono)] text-[11px] text-[var(--console-muted)] sm:w-28">
                    {track.label}
                  </span>
                  <span className="text-[13px] text-[var(--console-ink)]">{track.detail}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="flex max-h-[420px] flex-col rounded-lg border border-[var(--console-hairline)]">
          <div className="space-y-1 px-4 py-3">
            <h2 className="text-[12px] font-medium text-[var(--console-muted)]">Session notes</h2>
            <p className="text-[11px] text-[var(--console-muted)]">
              Audited annotations for this asset
            </p>
          </div>
          <Separator className="bg-[var(--console-hairline)]" />
          <ScrollArea className="min-h-0 flex-1 px-4 py-3">
            <ul className="space-y-3 pr-2">
              {model.notes.map((note) => (
                <li key={note.id} className="space-y-1">
                  <p className="font-[family-name:var(--console-font-mono)] text-[11px] text-[var(--console-muted)]">
                    {note.at}
                  </p>
                  <p className="text-[13px] text-[var(--console-ink)]">{note.text}</p>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </aside>
      </div>
    </div>
  );
}

'use client';

import { Pause } from '@phosphor-icons/react/dist/csr/Pause';
import { Play } from '@phosphor-icons/react/dist/csr/Play';
import { SkipBack } from '@phosphor-icons/react/dist/csr/SkipBack';
import { SkipForward } from '@phosphor-icons/react/dist/csr/SkipForward';
import type * as React from 'react';
import { useEffect, useState } from 'react';

import { Badge } from '#/components/ui/badge';
import { Button } from '#/components/ui/button';
import { ScrollArea } from '#/components/ui/scroll-area';
import { Separator } from '#/components/ui/separator';
import type { MediaWorkbenchModel } from '#/features/console/data/agency-types';
import { ConsolePage } from '#/features/console/ui/console-page';
import { useConsoleToast } from '#/features/console/ui/console-toast';
import { PageHeader } from '#/features/console/ui/page-header';
import { SectionHeader } from '#/features/console/ui/section-header';
import { StatusDot } from '#/features/console/ui/status-dot';

const CLIP_SECONDS = 184;

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function MediaWorkbenchPage({ model }: { model: MediaWorkbenchModel }): React.JSX.Element {
  const { push } = useConsoleToast();
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);

  useEffect(() => {
    if (!playing) {
      return;
    }
    const timer = window.setInterval(() => {
      setPosition((current) => {
        if (current >= CLIP_SECONDS) {
          setPlaying(false);
          return CLIP_SECONDS;
        }
        return current + 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [playing]);

  return (
    <ConsolePage>
      <PageHeader
        title={model.title}
        description={model.description}
        meta={
          <span className="inline-flex items-center gap-2">
            <StatusDot tone={playing ? 'ok' : 'sensor'} />
            {playing ? 'Playing' : model.statusLabel}
          </span>
        }
        actions={
          <Badge variant="secondary" className="rounded-md console-meta !text-[11px]">
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
                  {playing
                    ? 'Synced playback running · chain-of-custody locked'
                    : 'Synced playback paused · chain-of-custody locked'}
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
                onClick={() => {
                  setPosition((current) => Math.max(0, current - 10));
                  push('Skipped back 10s', 'neutral');
                }}
              >
                <SkipBack aria-hidden="true" weight="fill" className="size-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="size-11 rounded-full bg-white text-[var(--console-ink)] hover:bg-white/90 sm:size-9"
                aria-label={playing ? 'Pause' : 'Play'}
                onClick={() => {
                  setPlaying((current) => {
                    const next = !current;
                    push(next ? 'Playback started' : 'Playback paused', 'neutral');
                    return next;
                  });
                }}
              >
                {playing ? (
                  <Pause aria-hidden="true" weight="fill" className="size-4" />
                ) : (
                  <Play aria-hidden="true" weight="fill" className="size-4" />
                )}
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="size-11 text-white hover:bg-white/10 hover:text-white sm:size-9"
                aria-label="Skip forward"
                onClick={() => {
                  setPosition((current) => Math.min(CLIP_SECONDS, current + 10));
                  push('Skipped forward 10s', 'neutral');
                }}
              >
                <SkipForward aria-hidden="true" weight="fill" className="size-4" />
              </Button>
              <div className="ml-auto console-meta !text-white/70">
                {formatTime(position)} / {formatTime(CLIP_SECONDS)}
              </div>
            </div>
          </div>

          <section className="space-y-2">
            <SectionHeader title="Tracks & markers" />
            <ul className="console-list">
              {model.tracks.map((track) => (
                <li key={track.id} className="console-row">
                  <span className="console-meta shrink-0 sm:w-28">{track.label}</span>
                  <span className="text-[13px] text-[var(--console-ink)]">{track.detail}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="console-panel flex max-h-[420px] flex-col overflow-hidden">
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
                  <p className="console-meta">{note.at}</p>
                  <p className="text-[13px] text-[var(--console-ink)]">{note.text}</p>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </aside>
      </div>
    </ConsolePage>
  );
}

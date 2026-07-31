import type * as React from 'react';

import { cn } from '#/lib/utils';

const toneClass: Record<'ok' | 'warn' | 'danger' | 'muted' | 'sensor', string> = {
  ok: 'bg-[var(--console-ok)]',
  warn: 'bg-[var(--console-sensor)]',
  danger: 'bg-[var(--console-danger)]',
  muted: 'bg-[var(--console-muted)]',
  sensor: 'bg-[var(--console-sensor)]',
};

export type StatusDotTone = keyof typeof toneClass;

export function StatusDot({
  tone = 'ok',
  className,
  label,
}: {
  tone?: StatusDotTone;
  className?: string;
  /** Accessible name when the dot conveys meaning alone */
  label?: string;
}): React.JSX.Element {
  if (label) {
    return (
      <span
        role="img"
        aria-label={label}
        className={cn('inline-block size-[5px] shrink-0 rounded-[3px]', toneClass[tone], className)}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={cn('inline-block size-[5px] shrink-0 rounded-[3px]', toneClass[tone], className)}
    />
  );
}

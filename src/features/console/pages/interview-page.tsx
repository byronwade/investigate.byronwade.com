import { ChatsTeardrop } from '@phosphor-icons/react/dist/csr/ChatsTeardrop';
import type * as React from 'react';

import { Badge } from '#/components/ui/badge';
import { getInterviewTranscript } from '#/features/console/data/agency-getters';
import { EmptyState } from '#/features/console/ui/empty-state';
import { PageHeader } from '#/features/console/ui/page-header';
import { StatusDot } from '#/features/console/ui/status-dot';

export function InterviewPage({ caseId }: { caseId: string }): React.JSX.Element | null {
  const model = getInterviewTranscript(caseId);
  if (!model) {
    return null;
  }

  return (
    <div className="space-y-6" data-surface="console">
      <PageHeader
        title={model.title}
        description={model.description}
        meta={
          <span className="inline-flex items-center gap-2">
            <ChatsTeardrop aria-hidden="true" weight="duotone" className="size-3.5" />
            {model.subject} · {model.meta}
          </span>
        }
      />

      {model.lines.length === 0 ? (
        <EmptyState
          title="No transcript lines"
          description="Transcript excerpts appear after review."
        />
      ) : (
        <ol className="space-y-0 divide-y divide-[var(--console-strip)] border-t border-[var(--console-hairline)]">
          {model.lines.map((line) => (
            <li
              key={line.id}
              className="grid gap-2 py-3 sm:grid-cols-[88px_minmax(0,1fr)] sm:gap-4"
            >
              <div className="space-y-1">
                <p className="font-[family-name:var(--console-font-mono)] text-[11px] text-[var(--console-muted)]">
                  {line.at}
                </p>
                <p className="text-[12px] font-medium text-[var(--console-ink)]">{line.speaker}</p>
              </div>
              <div className="space-y-2">
                <p className="text-[13px] leading-6 text-[var(--console-body)]">{line.text}</p>
                {line.marker ? (
                  <div className="flex flex-wrap items-center gap-2">
                    {line.tone ? <StatusDot tone={line.tone} /> : null}
                    <Badge variant="secondary" className="rounded-md">
                      {line.marker}
                    </Badge>
                  </div>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

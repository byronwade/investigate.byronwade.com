import { useQuery } from '@tanstack/react-query';
import type { SystemStatus } from '#/lib/server/system-status';

type StatusPanelProps = {
  initialStatus: SystemStatus;
  fetchStatus: () => Promise<SystemStatus>;
};

export function StatusPanel({ initialStatus, fetchStatus }: StatusPanelProps) {
  const query = useQuery({
    queryKey: ['system-status'],
    queryFn: fetchStatus,
    initialData: initialStatus,
    staleTime: 15_000,
  });

  return (
    <section className="surface p-6" aria-labelledby="status-heading">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 id="status-heading" className="font-[family-name:var(--font-display)] text-2xl">
            Server status
          </h2>
          <p className="mt-1 text-[var(--color-fg-muted)]">
            TanStack Query caches a server function response for interactive refresh.
          </p>
        </div>
        <button
          type="button"
          className="text-sm font-semibold text-[var(--color-accent)] underline-offset-2 hover:underline"
          onClick={() => void query.refetch()}
        >
          Refresh
        </button>
      </div>

      {query.isFetching ? (
        <output className="mt-4 block text-sm text-[var(--color-fg-muted)]">
          Refreshing status…
        </output>
      ) : null}

      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <dt className="text-xs uppercase tracking-wide text-[var(--color-fg-muted)]">App</dt>
          <dd className="font-medium">{query.data.app}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-[var(--color-fg-muted)]">
            Environment
          </dt>
          <dd className="font-medium">{query.data.environment}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-[var(--color-fg-muted)]">Node</dt>
          <dd className="font-mono text-sm">{query.data.nodeVersion}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-[var(--color-fg-muted)]">
            Checked at
          </dt>
          <dd className="font-mono text-sm">{new Date(query.data.timestamp).toLocaleString()}</dd>
        </div>
      </dl>
    </section>
  );
}

import { createFileRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { StatusPanel } from '#/features/demo/status-panel';
import { getSystemStatus } from '#/lib/server/system-status';
import { getPublicEnv } from '#/lib/shared/env';

const getStatus = createServerFn({ method: 'GET' }).handler(async () => {
  const { VITE_APP_NAME } = getPublicEnv();
  return getSystemStatus(VITE_APP_NAME);
});

export const Route = createFileRoute('/foundation')({
  loader: async () => getStatus(),
  pendingComponent: FoundationPending,
  component: FoundationPage,
  head: () => ({
    meta: [
      { title: 'Foundation · Investigate' },
      {
        name: 'description',
        content: 'Server function and TanStack Query demonstration route.',
      },
    ],
  }),
});

function FoundationPending() {
  return (
    <div className="container-content py-16">
      <output className="block text-[var(--color-fg-muted)]">Loading foundation status…</output>
    </div>
  );
}

function FoundationPage() {
  const initialStatus = Route.useLoaderData();

  return (
    <div className="container-content py-12 sm:py-16">
      <header className="motion-fade-up max-w-3xl">
        <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl">
          Platform foundation
        </h1>
        <p className="mt-4 text-lg text-[var(--color-fg-muted)]">
          This route proves SSR loaders, server functions, and a legitimate client cache refresh
          path with TanStack Query.
        </p>
      </header>

      <div className="mt-10 motion-fade-in">
        <StatusPanel initialStatus={initialStatus} fetchStatus={() => getStatus()} />
      </div>
    </div>
  );
}

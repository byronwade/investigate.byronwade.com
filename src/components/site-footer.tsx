import { getPublicEnv } from '#/lib/shared/env';

export function SiteFooter() {
  const { VITE_APP_NAME } = getPublicEnv();

  return (
    <footer className="border-t border-[var(--color-border)] py-8 text-[var(--color-fg-muted)]">
      <div className="container-content flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p>{VITE_APP_NAME} foundation — TanStack Start, Vite, and design tokens.</p>
        <p>
          Read <span className="font-medium text-[var(--color-fg)]">DESIGN.md</span> before UI
          changes.
        </p>
      </div>
    </footer>
  );
}

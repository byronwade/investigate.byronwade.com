import { createFileRoute, Link } from '@tanstack/react-router';
import { getConsoleScreen } from '#/features/console/screens/registry';
import { ConsoleScreenLoader } from '#/features/console/screens/screen-loader';

export const Route = createFileRoute('/console/reference/$slug')({
  component: ReferenceScreenPage,
  head: ({ params }) => {
    const meta = getConsoleScreen(params.slug);
    return {
      meta: [
        {
          title: meta
            ? `${meta.title} · Paper reference · Investigation Console`
            : 'Paper reference · Investigation Console',
        },
      ],
    };
  },
});

function ReferenceScreenPage() {
  const { slug } = Route.useParams();
  const meta = getConsoleScreen(slug);

  if (!meta) {
    return (
      <main
        id="console-main"
        tabIndex={-1}
        className="mx-auto flex min-h-screen w-full max-w-xl flex-col justify-center px-6 py-10 outline-none"
      >
        <p className="font-[family-name:var(--console-font-mono)] text-[11px] tracking-[0.06em] text-[var(--console-muted)]">
          NOT FOUND
        </p>
        <h1 className="mt-2 text-[22px] font-semibold tracking-[-0.02em] text-[var(--console-ink)]">
          Unknown reference screen
        </h1>
        <p className="mt-3 text-[13px] leading-5 text-[var(--console-body)]">
          No Paper dump is registered for <code className="font-mono text-[12px]">{slug}</code>.
        </p>
        <p className="mt-6">
          <Link
            to="/console/reference"
            className="text-[13px] font-medium text-[var(--console-ink)] underline decoration-[var(--console-hairline)] underline-offset-4"
          >
            Back to Paper reference gallery
          </Link>
        </p>
      </main>
    );
  }

  return <ConsoleScreenLoader slug={slug} />;
}

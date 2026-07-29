import { createFileRoute, Link } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { FeedbackForm } from '#/features/home/feedback-form';
import { getPublicEnv } from '#/lib/shared/env';
import { feedbackSchema } from '#/lib/shared/feedback';

const submitFeedback = createServerFn({ method: 'POST' })
  .validator((data: unknown) => feedbackSchema.parse(data))
  .handler(async ({ data }) => {
    // Extension point: persist feedback / send to queue later.
    return {
      ok: true as const,
      message: `Stored locally for ${data.name}`,
    };
  });

export const Route = createFileRoute('/')({
  component: HomePage,
  head: () => {
    const { VITE_APP_NAME } = getPublicEnv();
    return {
      meta: [
        { title: `${VITE_APP_NAME} · Foundation` },
        {
          name: 'description',
          content: 'Polished starter interface demonstrating the Investigate design system.',
        },
      ],
    };
  },
});

function HomePage() {
  const { VITE_APP_NAME } = getPublicEnv();

  return (
    <div className="container-content py-12 sm:py-16">
      <section className="motion-fade-up grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--color-accent)]">
            {VITE_APP_NAME}
          </p>
          <h1 className="mt-3 max-w-3xl font-[family-name:var(--font-display)] text-5xl leading-[var(--leading-tight)] tracking-tight sm:text-6xl">
            A serious foundation for product engineering
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-[var(--color-fg-muted)]">
            TanStack Start, typed boundaries, design tokens, and a complete quality pipeline — ready
            for a human and AI development team.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/foundation"
              className="inline-flex h-11 items-center rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 font-semibold text-[var(--color-primary-fg)] no-underline"
            >
              Explore foundation
            </Link>
            <a
              href="https://tanstack.com/start/latest"
              className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4 font-semibold no-underline"
              rel="noopener noreferrer"
              target="_blank"
            >
              TanStack Start docs
            </a>
          </div>
        </div>
        <aside className="surface motion-fade-in p-6" aria-label="Design system snapshot">
          <h2 className="font-[family-name:var(--font-display)] text-2xl">Design system</h2>
          <ul className="mt-4 space-y-3 text-[var(--color-fg-muted)]">
            <li>Token-driven color, type, space, and motion</li>
            <li>Light and dark themes with focus-visible defaults</li>
            <li>Mobile-first layout widths and accessible forms</li>
          </ul>
        </aside>
      </section>

      <section className="mt-12 grid gap-6 lg:grid-cols-2">
        <FeedbackForm onSubmitFeedback={async (input) => submitFeedback({ data: input })} />
        <div className="surface p-6">
          <h2 className="font-[family-name:var(--font-display)] text-2xl">What ships here</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-[var(--color-fg-muted)]">
            <li>Strict TypeScript and Biome correctness</li>
            <li>Vitest + Playwright + axe accessibility smoke</li>
            <li>Knip, coverage thresholds, and self-hosted CI</li>
            <li>Clean extension points — no premature vendors</li>
          </ol>
        </div>
      </section>
    </div>
  );
}

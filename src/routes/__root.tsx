import { TanStackDevtools } from '@tanstack/react-devtools';
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
  useRouterState,
} from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';
import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import { SiteFooter } from '#/components/site-footer';
import { SiteHeader } from '#/components/site-header';
import { AppQueryProvider } from '#/integrations/tanstack-query/root-provider';
import { getPublicEnv } from '#/lib/shared/env';
import appCss from '../styles.css?url';

const { VITE_APP_NAME, VITE_APP_URL } = getPublicEnv();

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: VITE_APP_NAME },
      {
        name: 'description',
        content: `${VITE_APP_NAME} — production-grade TanStack Start foundation.`,
      },
      { property: 'og:title', content: VITE_APP_NAME },
      { property: 'og:url', content: VITE_APP_URL },
      { name: 'theme-color', content: '#156247' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=IBM+Plex+Mono:wght@400;500&family=Source+Sans+3:wght@400;550;600;700&display=swap',
      },
      { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
    ],
    scripts: [{ src: '/theme-boot.js' }],
  }),
  component: RootComponent,
  shellComponent: RootDocument,
  notFoundComponent: NotFound,
  errorComponent: RootError,
  pendingComponent: RoutePending,
});

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        {import.meta.env.DEV ? (
          <TanStackDevtools
            config={{ position: 'bottom-right' }}
            plugins={[
              {
                name: 'TanStack Router',
                render: <TanStackRouterDevtoolsPanel />,
              },
            ]}
          />
        ) : null}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <AppQueryProvider>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-[var(--radius-md)] focus:bg-[var(--color-bg-elevated)] focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <SiteHeader />
      <FocusOnNavigate />
      <main
        id="main-content"
        tabIndex={-1}
        className="min-h-[calc(100vh-var(--header-height))] outline-none"
      >
        <Outlet />
      </main>
      <SiteFooter />
    </AppQueryProvider>
  );
}

function FocusOnNavigate() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const isFirstNavigation = useRef(true);

  useEffect(() => {
    // Avoid stealing initial Tab order from the skip link on first paint.
    if (isFirstNavigation.current) {
      isFirstNavigation.current = false;
      return;
    }

    const main = document.getElementById('main-content');
    if (main instanceof HTMLElement) {
      main.dataset.route = pathname;
      main.focus({ preventScroll: true });
    }
  }, [pathname]);

  return null;
}

function RoutePending() {
  return (
    <div className="container-content py-16">
      <output className="block text-[var(--color-fg-muted)]" aria-live="polite">
        Loading route…
      </output>
    </div>
  );
}

function NotFound() {
  return (
    <div className="container-narrow py-20 motion-fade-up">
      <p className="text-sm font-semibold uppercase tracking-wide text-[var(--color-accent)]">
        404
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl">Page not found</h1>
      <p className="mt-3 text-[var(--color-fg-muted)]">
        The route you requested does not exist. Use the primary navigation to continue.
      </p>
      <p className="mt-6">
        <a href="/" className="font-semibold text-[var(--color-primary)]">
          Return home
        </a>
      </p>
    </div>
  );
}

function RootError({ error }: { error: Error }) {
  return (
    <div className="container-narrow py-20">
      <p className="text-sm font-semibold uppercase tracking-wide text-[var(--color-danger)]">
        Error
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl">Something went wrong</h1>
      <p className="mt-3 text-[var(--color-fg-muted)]">
        An unexpected error occurred. Details are hidden in production-safe messaging.
      </p>
      {import.meta.env.DEV ? (
        <pre className="mt-6 overflow-auto rounded-[var(--radius-md)] bg-[var(--color-neutral-900)] p-4 text-sm text-[var(--color-neutral-50)]">
          {error.message}
        </pre>
      ) : null}
    </div>
  );
}

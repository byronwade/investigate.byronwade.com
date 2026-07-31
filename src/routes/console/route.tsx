import { createFileRoute, Outlet } from '@tanstack/react-router';
import consoleCss from '#/features/console/styles/console.css?url';

export const Route = createFileRoute('/console')({
  component: ConsoleLayout,
  head: () => ({
    meta: [
      { title: 'Investigation Console · Investigate' },
      {
        name: 'description',
        content: 'AI-led investigation case platform — Paper design migration.',
      },
      { name: 'theme-color', content: '#111111' },
    ],
    links: [
      { rel: 'stylesheet', href: consoleCss },
      {
        rel: 'stylesheet',
        href: 'https://cdn.jsdelivr.net/npm/geist@1.3.1/dist/fonts/geist-sans/style.css',
      },
      {
        rel: 'stylesheet',
        href: 'https://cdn.jsdelivr.net/npm/geist@1.3.1/dist/fonts/geist-mono/style.css',
      },
    ],
  }),
});

function ConsoleLayout() {
  return (
    <div className="console-app" data-surface="console">
      <a
        href="#console-main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-[#111111]"
      >
        Skip to console content
      </a>
      <div className="outline-none">
        <Outlet />
      </div>
    </div>
  );
}

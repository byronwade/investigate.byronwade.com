import { Link } from '@tanstack/react-router';
import { Button } from '#/components/ui/button';
import { useTheme } from '#/hooks/use-theme';
import { getPublicEnv } from '#/lib/shared/env';

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/foundation', label: 'Foundation' },
] as const;

export function SiteHeader() {
  const { theme, toggleTheme } = useTheme();
  const { VITE_APP_NAME } = getPublicEnv();

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--color-border)] bg-[color-mix(in_oklab,var(--color-bg)_82%,transparent)] backdrop-blur-md">
      <div className="container-content flex h-[var(--header-height)] items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Link
            to="/"
            className="font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight no-underline"
          >
            {VITE_APP_NAME}
          </Link>
          <nav aria-label="Primary" className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-[var(--radius-md)] px-2 py-2 text-sm font-medium text-[var(--color-fg-muted)] no-underline transition-colors hover:text-[var(--color-fg)] sm:px-3 [&.active]:bg-[color-mix(in_oklab,var(--color-primary)_12%,transparent)] [&.active]:text-[var(--color-fg)]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
        >
          {theme === 'light' ? 'Dark' : 'Light'}
        </Button>
      </div>
    </header>
  );
}

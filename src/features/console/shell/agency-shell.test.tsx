import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type * as React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { AgencyShell } from './agency-shell';

const ACTIVE_PATH = '/console/command-center';

vi.mock('@tanstack/react-router', () => ({
  Link: ({
    children,
    to,
    className,
    activeProps,
    activeOptions,
    onClick,
    ...rest
  }: {
    children: React.ReactNode;
    to: string;
    className?: string;
    onClick?: React.MouseEventHandler<HTMLAnchorElement>;
    activeProps?: { className?: string; 'aria-current'?: 'page' };
    activeOptions?: { exact?: boolean };
  }) => {
    const isActive = activeOptions?.exact
      ? ACTIVE_PATH === to
      : ACTIVE_PATH === to || ACTIVE_PATH.startsWith(`${to}/`);
    const mergedClassName = [className, isActive ? activeProps?.className : undefined]
      .filter(Boolean)
      .join(' ');
    return (
      <a
        href={to}
        className={mergedClassName}
        aria-current={isActive ? (activeProps?.['aria-current'] ?? 'page') : undefined}
        onClick={onClick}
        {...rest}
      >
        {children}
      </a>
    );
  },
  useNavigate: () => vi.fn(),
  useRouterState: (opts?: { select?: (state: { location: { pathname: string } }) => unknown }) => {
    const state = { location: { pathname: ACTIVE_PATH } };
    return opts?.select ? opts.select(state) : state;
  },
}));

async function openMobileNav() {
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: /open navigation/i }));
  return screen.getByRole('dialog');
}

describe('AgencyShell', () => {
  it('renders agency chrome without case tabs', async () => {
    render(
      <AgencyShell crumb="Command center">
        <p>Agency main</p>
      </AgencyShell>,
    );

    expect(screen.queryByRole('navigation', { name: /case/i })).not.toBeInTheDocument();
    expect(screen.getAllByText('Command center').length).toBeGreaterThan(0);
    expect(screen.getByText('Agency main')).toBeInTheDocument();

    const dialog = await openMobileNav();
    expect(within(dialog).getByRole('link', { name: /^Intake/i })).toBeInTheDocument();
  });

  it('marks command center as the active sidebar link', async () => {
    render(
      <AgencyShell crumb="Command center">
        <p>Agency main</p>
      </AgencyShell>,
    );

    const dialog = await openMobileNav();
    expect(within(dialog).getByRole('link', { name: /^Command center$/i })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('exposes a mobile navigation trigger', () => {
    render(
      <AgencyShell crumb="Command center">
        <p>Agency main</p>
      </AgencyShell>,
    );

    expect(screen.getByRole('button', { name: /open navigation/i })).toBeInTheDocument();
  });
});

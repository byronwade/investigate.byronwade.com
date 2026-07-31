import { render, screen } from '@testing-library/react';
import type * as React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { ConsoleRailProvider, useConsoleRail } from '#/features/console/shell/rail-context';

import { OverviewPage } from './overview-page';

vi.mock('@tanstack/react-router', () => ({
  Link: ({
    children,
    to,
    className,
    ...rest
  }: {
    children: React.ReactNode;
    to: string;
    className?: string;
  }) => (
    <a href={to} className={className} {...rest}>
      {children}
    </a>
  ),
}));

function RailSlot(): React.JSX.Element {
  const rail = useConsoleRail();
  return <div data-testid="rail-slot">{rail}</div>;
}

function renderOverview(caseId = 'northridge') {
  return render(
    <ConsoleRailProvider>
      <OverviewPage caseId={caseId} />
      <RailSlot />
    </ConsoleRailProvider>,
  );
}

describe('OverviewPage', () => {
  it('renders case title and human-only gate copy', () => {
    renderOverview();
    expect(screen.getByRole('heading', { name: /Northridge/i })).toBeInTheDocument();
    expect(screen.getByText(/decisions are human-only/i)).toBeInTheDocument();
  });

  it('exposes unique human-only action labels', () => {
    renderOverview();
    expect(
      screen.getByRole('button', {
        name: /Review: Accept finding 1 as potentially exculpatory/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: /Reject: Elevate Osei from person of interest/i,
      }),
    ).toBeInTheDocument();
  });

  it('publishes techniques rail into ConsoleRailContext', () => {
    renderOverview();
    const slot = screen.getByTestId('rail-slot');
    expect(slot).toHaveTextContent('Techniques at this level');
    expect(slot).toHaveTextContent('Your access');
  });
});

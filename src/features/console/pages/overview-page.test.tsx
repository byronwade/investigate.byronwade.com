import { render, screen } from '@testing-library/react';
import type * as React from 'react';
import { describe, expect, it, vi } from 'vitest';

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

describe('OverviewPage', () => {
  it('renders case title and human-only gate copy', () => {
    render(<OverviewPage caseId="northridge" />);
    expect(screen.getByRole('heading', { name: /Northridge/i })).toBeInTheDocument();
    expect(screen.getByText(/decisions are human-only/i)).toBeInTheDocument();
  });

  it('exposes unique human-only action labels', () => {
    render(<OverviewPage caseId="northridge" />);
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
});

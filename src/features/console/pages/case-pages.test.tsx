import { render, screen } from '@testing-library/react';
import type * as React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { EvidencePage } from './evidence-page';
import { LeadsPage } from './leads-page';
import { PeoplePage } from './people-page';
import { TimelinePage } from './timeline-page';

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

describe('case workspace pages', () => {
  it('Timeline shows heading and a fixture event', () => {
    render(<TimelinePage caseId="northridge" />);
    expect(screen.getByRole('heading', { name: 'Timeline' })).toBeInTheDocument();
    expect(screen.getByText(/Anonymous tip received/i)).toBeInTheDocument();
  });

  it('Evidence shows heading and a fixture item with custody', () => {
    render(<EvidencePage caseId="northridge" />);
    expect(screen.getByRole('heading', { name: 'Evidence' })).toBeInTheDocument();
    expect(screen.getByText(/Dell latitude laptop/i)).toBeInTheDocument();
    expect(screen.getByText('sealed')).toBeInTheDocument();
  });

  it('Leads shows heading and a fixture card', () => {
    render(<LeadsPage caseId="northridge" />);
    expect(screen.getByRole('heading', { name: 'Leads' })).toBeInTheDocument();
    expect(screen.getByText(/Reconcile originating tip against warrant/i)).toBeInTheDocument();
  });

  it('People shows heading and a fixture person', () => {
    render(<PeoplePage caseId="northridge" />);
    expect(screen.getByRole('heading', { name: 'People' })).toBeInTheDocument();
    expect(screen.getByText(/Vance, Curtis A\./i)).toBeInTheDocument();
  });
});

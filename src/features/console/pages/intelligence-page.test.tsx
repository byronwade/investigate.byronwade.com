import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type * as React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { IntelligencePage } from './intelligence-page';

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

describe('IntelligencePage', () => {
  it('renders packages and updates the detail panel', async () => {
    const user = userEvent.setup();
    render(<IntelligencePage />);

    expect(screen.getByRole('heading', { name: /Intelligence/i })).toBeInTheDocument();
    expect(screen.getAllByText(/Northridge vendor cluster/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Readable at current clearance/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Halstead subcontractors/i }));
    expect(screen.getByText(/Denied — no foreign-intel clearance/i)).toBeInTheDocument();
  });
});

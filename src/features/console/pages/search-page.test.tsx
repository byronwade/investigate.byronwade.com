import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type * as React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { SearchPage } from './search-page';

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

describe('SearchPage', () => {
  it('renders fixture hits and filters by kind', async () => {
    const user = userEvent.setup();
    render(<SearchPage />);

    expect(screen.getByRole('heading', { name: /Search results/i })).toBeInTheDocument();
    expect(screen.getByText(/Vendor invoice 8812/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Hidden by clearance/i).length).toBeGreaterThan(0);

    await user.click(screen.getByRole('button', { name: /^People$/i }));
    expect(screen.getByText(/Vance, Curtis A\./i)).toBeInTheDocument();
    expect(screen.queryByText(/Vendor invoice 8812/i)).not.toBeInTheDocument();
  });
});

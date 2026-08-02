import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type * as React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { getPeopleOrgs } from '#/features/console/data/agency-getters';

import { DirectoryPage } from './directory-page';

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

describe('DirectoryPage', () => {
  it('filters directory entries by kind and query', async () => {
    const user = userEvent.setup();
    render(<DirectoryPage model={getPeopleOrgs()} />);

    expect(screen.getByRole('heading', { name: /People & organizations/i })).toBeInTheDocument();
    expect(screen.getByText(/Vance, Curtis A\./i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /^Org$/i }));
    expect(screen.getByText(/Northridge Township/i)).toBeInTheDocument();
    expect(screen.queryByText(/Vance, Curtis A\./i)).not.toBeInTheDocument();

    await user.type(screen.getByLabelText(/Filter People & organizations/i), 'brightline');
    expect(screen.getByText(/Brightline Vendors LLC/i)).toBeInTheDocument();
    expect(screen.queryByText(/Northridge Township/i)).not.toBeInTheDocument();
  });
});

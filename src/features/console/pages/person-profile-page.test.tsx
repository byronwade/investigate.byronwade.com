import { render, screen } from '@testing-library/react';
import type * as React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { DEFAULT_CASE_ID } from '#/features/console/data';

import { PersonProfilePage } from './person-profile-page';

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

describe('PersonProfilePage', () => {
  it('renders fixture person details and case links', () => {
    render(<PersonProfilePage caseId={DEFAULT_CASE_ID} personId="person-vance" />);

    expect(screen.getByRole('heading', { name: /Vance, Curtis A\./i })).toBeInTheDocument();
    expect(screen.getAllByText(/^subject$/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: /back to people/i })).toHaveAttribute(
      'href',
      `/console/cases/${DEFAULT_CASE_ID}/people`,
    );
    expect(screen.getByRole('tab', { name: /case links/i })).toBeInTheDocument();
    expect(screen.getByText(/4 flagged/i)).toBeInTheDocument();
  });

  it('returns null for unknown people', () => {
    const { container } = render(
      <PersonProfilePage caseId={DEFAULT_CASE_ID} personId="missing-person" />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});

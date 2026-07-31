import { render, screen } from '@testing-library/react';
import type * as React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { DEFAULT_CASE_ID } from '#/features/console/data';

import { PlanPage } from './plan-page';

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

describe('PlanPage', () => {
  it('renders hypotheses and planned steps', () => {
    render(<PlanPage caseId={DEFAULT_CASE_ID} />);

    expect(screen.getByRole('heading', { name: /Investigative plan/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Inflated awards/i })).toBeInTheDocument();
    expect(screen.getByText(/Complete bank records production review/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Open leads board/i })).toHaveAttribute(
      'href',
      `/console/cases/${DEFAULT_CASE_ID}/leads`,
    );
  });

  it('returns null for unknown cases', () => {
    const { container } = render(<PlanPage caseId="missing-case" />);
    expect(container).toBeEmptyDOMElement();
  });
});

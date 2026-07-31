import { render, screen } from '@testing-library/react';
import type * as React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { DEFAULT_CASE_ID, getCase } from '#/features/console/data';

import { CaseShell } from './case-shell';

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

describe('CaseShell', () => {
  it('shows case number and primary nav labels', () => {
    const caseRecord = getCase(DEFAULT_CASE_ID);
    if (!caseRecord) {
      throw new Error(`Expected fixture case ${DEFAULT_CASE_ID}`);
    }

    render(
      <CaseShell caseRecord={caseRecord}>
        <p>Main</p>
      </CaseShell>,
    );

    expect(screen.getAllByText(/245D-CG-3881127/).length).toBeGreaterThan(0);
    expect(screen.getByRole('navigation', { name: /case/i })).toBeInTheDocument();
    expect(screen.getByText('Main')).toBeInTheDocument();
  });
});

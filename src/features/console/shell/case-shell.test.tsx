import { render, screen, within } from '@testing-library/react';
import type * as React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { DEFAULT_CASE_ID, getCase } from '#/features/console/data';
import { OverviewPage } from '#/features/console/pages/overview-page';

import { CaseShell } from './case-shell';

const ACTIVE_PATH = '/console/cases/northridge/overview';

vi.mock('@tanstack/react-router', () => ({
  Link: ({
    children,
    to,
    className,
    activeProps,
    activeOptions,
    ...rest
  }: {
    children: React.ReactNode;
    to: string;
    className?: string;
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

  it('marks the current case tab and sidebar link as active', () => {
    const caseRecord = getCase(DEFAULT_CASE_ID);
    if (!caseRecord) {
      throw new Error(`Expected fixture case ${DEFAULT_CASE_ID}`);
    }

    render(
      <CaseShell caseRecord={caseRecord}>
        <p>Main</p>
      </CaseShell>,
    );

    const overviewTab = screen.getByRole('link', { name: /^Overview$/i });
    expect(overviewTab).toHaveAttribute('aria-current', 'page');
    expect(overviewTab.className).toContain('border-[var(--console-ink)]');

    const casesNav = screen.getByRole('link', { name: /^Cases$/i });
    expect(casesNav).toHaveAttribute('aria-current', 'page');
    expect(casesNav.className).toContain('bg-[var(--console-row-active)]');

    const peopleTab = within(screen.getByRole('navigation', { name: /case/i })).getByRole('link', {
      name: /^People$/i,
    });
    expect(peopleTab).not.toHaveAttribute('aria-current');
  });

  it('renders overview rail in the shell rail slot via context', () => {
    const caseRecord = getCase(DEFAULT_CASE_ID);
    if (!caseRecord) {
      throw new Error(`Expected fixture case ${DEFAULT_CASE_ID}`);
    }

    render(
      <CaseShell caseRecord={caseRecord}>
        <OverviewPage caseId={DEFAULT_CASE_ID} />
      </CaseShell>,
    );

    const main = document.getElementById('console-main');
    expect(main).toBeTruthy();
    expect(main).not.toHaveTextContent('Techniques at this level');

    expect(screen.getByRole('heading', { name: /Techniques at this level/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Your access/i })).toBeInTheDocument();
  });
});

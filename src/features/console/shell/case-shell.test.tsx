import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
    onClick,
    ...rest
  }: {
    children: React.ReactNode;
    to: string;
    className?: string;
    onClick?: React.MouseEventHandler<HTMLAnchorElement>;
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
        onClick={onClick}
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

async function openMobileNav() {
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: /open navigation/i }));
  return screen.getByRole('dialog');
}

describe('CaseShell', () => {
  it('shows case number and primary nav labels', async () => {
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

    const dialog = await openMobileNav();
    expect(within(dialog).getByRole('link', { name: /^This case$/i })).toBeInTheDocument();
  });

  it('marks the current case tab and sidebar link as active', async () => {
    const caseRecord = getCase(DEFAULT_CASE_ID);
    if (!caseRecord) {
      throw new Error(`Expected fixture case ${DEFAULT_CASE_ID}`);
    }

    render(
      <CaseShell caseRecord={caseRecord}>
        <p>Main</p>
      </CaseShell>,
    );

    const caseNav = screen.getByRole('navigation', { name: /case/i });
    const overviewTab = within(caseNav).getByRole('link', { name: /^Overview$/i });
    expect(overviewTab).toHaveAttribute('aria-current', 'page');
    expect(overviewTab.className).toContain('border-[var(--console-ink)]');

    const peopleTab = within(caseNav).getByRole('link', { name: /^People$/i });
    expect(peopleTab).not.toHaveAttribute('aria-current');

    const dialog = await openMobileNav();
    const thisCaseNav = within(dialog).getByRole('link', { name: /^This case$/i });
    expect(thisCaseNav).toHaveAttribute('aria-current', 'page');
    expect(thisCaseNav.className).toContain('bg-[var(--console-row-active)]');
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
    expect(main).toHaveTextContent('Techniques & access');

    expect(
      screen.getAllByRole('heading', { name: /Techniques at this level/i }).length,
    ).toBeGreaterThan(0);
    expect(screen.getAllByRole('heading', { name: /Your access/i }).length).toBeGreaterThan(0);
  });
});

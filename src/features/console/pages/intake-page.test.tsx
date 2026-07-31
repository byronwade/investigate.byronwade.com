import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type * as React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { IntakePage } from './intake-page';

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

describe('IntakePage', () => {
  it('renders queue tips and extraction panel', async () => {
    const user = userEvent.setup();
    render(<IntakePage />);

    expect(screen.getByRole('heading', { name: /Intake & triage/i })).toBeInTheDocument();
    expect(screen.getAllByText(/TIP-2026-1184/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Suggested action/i)).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', {
        name: /TIP-2026-1162.*parking ticket pattern/i,
      }),
    );
    expect(screen.getByText(/Decline · refer to municipal/i)).toBeInTheDocument();
  });
});

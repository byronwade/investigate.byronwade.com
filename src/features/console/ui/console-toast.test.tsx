import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type * as React from 'react';
import { describe, expect, it } from 'vitest';

import { ConsoleToastProvider, useConsoleToast } from './console-toast';

function Probe(): React.JSX.Element {
  const { push } = useConsoleToast();
  return (
    <button type="button" onClick={() => push('Approved · Tip', 'ok')}>
      Fire toast
    </button>
  );
}

describe('ConsoleToastProvider', () => {
  it('announces pushed status messages', async () => {
    const user = userEvent.setup();
    render(
      <ConsoleToastProvider>
        <Probe />
      </ConsoleToastProvider>,
    );

    await user.click(screen.getByRole('button', { name: /fire toast/i }));
    expect(screen.getByRole('status')).toHaveTextContent('Approved · Tip');
  });
});

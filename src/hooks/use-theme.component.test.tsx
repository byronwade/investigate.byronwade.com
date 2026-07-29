import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { useTheme } from './use-theme';

function ThemeProbe() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button type="button" onClick={toggleTheme}>
      {theme}
    </button>
  );
}

describe('useTheme', () => {
  it('toggles theme on interaction', async () => {
    const user = userEvent.setup();
    render(<ThemeProbe />);
    const button = await screen.findByRole('button');
    const initial = button.textContent;
    await user.click(button);
    expect(button.textContent).not.toBe(initial);
  });
});

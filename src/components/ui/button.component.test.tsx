import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './button';

describe('Button (shadcn)', () => {
  it('renders accessible name and handles clicks', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Save</Button>);

    const button = screen.getByRole('button', { name: 'Save' });
    await user.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('applies variant data attributes', () => {
    render(
      <Button variant="secondary" size="sm">
        Filter
      </Button>,
    );

    const button = screen.getByRole('button', { name: 'Filter' });
    expect(button).toHaveAttribute('data-variant', 'secondary');
    expect(button).toHaveAttribute('data-size', 'sm');
  });
});

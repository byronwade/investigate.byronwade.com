import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';

import { FilterBar } from './filter-bar';

function Harness() {
  const [value, setValue] = useState('All');
  return <FilterBar options={['All', 'Person', 'Org']} value={value} onChange={setValue} />;
}

describe('FilterBar', () => {
  it('marks the active filter and updates on press', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'true');
    await user.click(screen.getByRole('button', { name: 'Org' }));
    expect(screen.getByRole('button', { name: 'Org' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'false');
  });
});

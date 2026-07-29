import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { FeedbackForm } from './feedback-form';

describe('FeedbackForm', () => {
  it('shows validation errors for empty fields', async () => {
    const user = userEvent.setup();
    const onSubmitFeedback = vi.fn();
    render(<FeedbackForm onSubmitFeedback={onSubmitFeedback} />);

    await user.click(screen.getByRole('button', { name: 'Submit feedback' }));

    expect(await screen.findByText(/at least 2 characters/i)).toBeInTheDocument();
    expect(onSubmitFeedback).not.toHaveBeenCalled();
  });

  it('submits valid feedback', async () => {
    const user = userEvent.setup();
    const onSubmitFeedback = vi.fn().mockResolvedValue({ ok: true, message: 'ok' });
    render(<FeedbackForm onSubmitFeedback={onSubmitFeedback} />);

    await user.type(screen.getByLabelText('Name'), 'Ada Lovelace');
    await user.type(
      screen.getByLabelText('Message'),
      'The foundation validation path works as expected.',
    );
    await user.click(screen.getByRole('button', { name: 'Submit feedback' }));

    expect(await screen.findByText(/Thanks, Ada Lovelace/i)).toBeInTheDocument();
    expect(onSubmitFeedback).toHaveBeenCalledWith({
      name: 'Ada Lovelace',
      message: 'The foundation validation path works as expected.',
    });
  });
});

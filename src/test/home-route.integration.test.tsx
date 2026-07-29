import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FeedbackForm } from '#/features/home/feedback-form';

describe('home interactive surface', () => {
  it('keeps the feedback form keyboard accessible', () => {
    render(
      <FeedbackForm onSubmitFeedback={vi.fn().mockResolvedValue({ ok: true, message: 'ok' })} />,
    );

    expect(screen.getByLabelText('Name')).toBeVisible();
    expect(screen.getByLabelText('Message')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Submit feedback' })).toBeEnabled();
  });
});

import { type FormEvent, useState } from 'react';
import { Button } from '#/components/ui/marketing-button';
import { type FeedbackFieldErrors, validateFeedback } from '#/lib/shared/feedback';

type SubmitState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'success'; name: string }
  | { status: 'error'; message: string; fieldErrors?: FeedbackFieldErrors };

type FeedbackFormProps = {
  onSubmitFeedback: (input: { name: string; message: string }) => Promise<{
    ok: boolean;
    message: string;
  }>;
};

export function FeedbackForm({ onSubmitFeedback }: FeedbackFormProps) {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [state, setState] = useState<SubmitState>({ status: 'idle' });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validated = validateFeedback({ name, message });
    if (!validated.success) {
      setState({
        status: 'error',
        message: 'Please correct the highlighted fields.',
        fieldErrors: validated.fieldErrors,
      });
      return;
    }

    setState({ status: 'submitting' });
    try {
      const result = await onSubmitFeedback(validated.data);
      if (!result.ok) {
        setState({ status: 'error', message: result.message });
        return;
      }
      setState({ status: 'success', name: validated.data.name });
      setName('');
      setMessage('');
    } catch {
      setState({
        status: 'error',
        message: 'Something went wrong. Please try again.',
      });
    }
  }

  const fieldErrors = state.status === 'error' ? state.fieldErrors : undefined;

  return (
    <form className="surface flex flex-col gap-4 p-6" onSubmit={handleSubmit} noValidate>
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl">
          Share foundation feedback
        </h2>
        <p className="mt-1 text-[var(--color-fg-muted)]">
          Demonstrates accessible validation without external services.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="feedback-name" className="text-sm font-semibold">
          Name
        </label>
        <input
          id="feedback-name"
          name="name"
          autoComplete="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          aria-invalid={Boolean(fieldErrors?.name)}
          aria-describedby={fieldErrors?.name ? 'feedback-name-error' : undefined}
          className="h-11 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3"
        />
        {fieldErrors?.name ? (
          <p id="feedback-name-error" role="alert" className="text-sm text-[var(--color-danger)]">
            {fieldErrors.name}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="feedback-message" className="text-sm font-semibold">
          Message
        </label>
        <textarea
          id="feedback-message"
          name="message"
          rows={4}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          aria-invalid={Boolean(fieldErrors?.message)}
          aria-describedby={fieldErrors?.message ? 'feedback-message-error' : undefined}
          className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2"
        />
        {fieldErrors?.message ? (
          <p
            id="feedback-message-error"
            role="alert"
            className="text-sm text-[var(--color-danger)]"
          >
            {fieldErrors.message}
          </p>
        ) : null}
      </div>

      {state.status === 'error' && !fieldErrors ? (
        <p role="alert" className="text-sm text-[var(--color-danger)]">
          {state.message}
        </p>
      ) : null}

      {state.status === 'success' ? (
        <output className="block rounded-[var(--radius-md)] bg-[var(--color-success-bg)] px-3 py-2 text-sm text-[var(--color-success)]">
          Thanks, {state.name}. Feedback accepted locally.
        </output>
      ) : null}

      <div>
        <Button type="submit" disabled={state.status === 'submitting'}>
          {state.status === 'submitting' ? 'Sending…' : 'Submit feedback'}
        </Button>
      </div>
    </form>
  );
}

import { z } from 'zod';

export const feedbackSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(80, 'Name must be 80 characters or fewer'),
  message: z
    .string()
    .trim()
    .min(10, 'Message must be at least 10 characters')
    .max(500, 'Message must be 500 characters or fewer'),
});

export type FeedbackInput = z.infer<typeof feedbackSchema>;

export type FeedbackFieldErrors = Partial<Record<keyof FeedbackInput, string>>;

export function validateFeedback(
  input: unknown,
): { success: true; data: FeedbackInput } | { success: false; fieldErrors: FeedbackFieldErrors } {
  const parsed = feedbackSchema.safeParse(input);
  if (parsed.success) {
    return { success: true, data: parsed.data };
  }

  const fieldErrors: FeedbackFieldErrors = {};
  for (const issue of parsed.error.issues) {
    const key = issue.path[0];
    if ((key === 'name' || key === 'message') && !fieldErrors[key]) {
      fieldErrors[key] = issue.message;
    }
  }

  return { success: false, fieldErrors };
}
